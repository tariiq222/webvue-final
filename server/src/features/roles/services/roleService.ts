/**
 * 👑 Role Service
 * خدمة الأدوار
 * 
 * Business logic for role and permission management operations.
 */

import { prisma } from '@/database/connection';
import { AppError } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';
import {
  calculatePagination,
  getPaginationOffset,
  getPrismaSearchFilter,
  getPrismaSortOptions,
} from '@/shared/utils/pagination';
import {
  Role,
  Permission,
  CreateRoleData,
  UpdateRoleData,
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types';

export class RoleService {
  /**
   * Get all roles with pagination and filtering
   * الحصول على جميع الأدوار مع التصفح والتصفية
   */
  async getRoles(params: PaginationParams): Promise<PaginatedResponse<Role>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search } = params;

    // Build where clause
    const where = {
      ...getPrismaSearchFilter(search, ['name', 'description']),
    };

    // Get total count
    const total = await prisma.role.count({ where });

    // Get roles with pagination
    const roles = await prisma.role.findMany({
      where,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: getPrismaSortOptions(sortBy, sortOrder),
      skip: getPaginationOffset(page, limit),
      take: limit,
    });

    // Transform roles to include permissions and user count
    const transformedRoles = roles.map(role => ({
      ...role,
      permissions: role.rolePermissions.map(rp => rp.permission),
      userCount: role.userRoles.length,
      users: role.userRoles.map(ur => ur.user),
      rolePermissions: undefined, // Remove the join table data
      userRoles: undefined, // Remove the join table data
    }));

    const pagination = calculatePagination(page, limit, total);

    return {
      success: true,
      data: transformedRoles,
      pagination,
      message: 'Roles retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get role by ID
   * الحصول على دور بالمعرف
   */
  async getRoleById(id: string): Promise<Role> {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
    }

    // Transform role to include permissions and users
    return {
      ...role,
      permissions: role.rolePermissions.map(rp => rp.permission),
      users: role.userRoles.map(ur => ur.user),
      userCount: role.userRoles.length,
      rolePermissions: undefined,
      userRoles: undefined,
    } as Role;
  }

  /**
   * Create new role
   * إنشاء دور جديد
   */
  async createRole(roleData: CreateRoleData): Promise<Role> {
    const { name, description, permissionIds } = roleData;

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new AppError('Role name already exists', 409, 'ROLE_NAME_EXISTS');
    }

    // Validate permissions
    if (permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        throw new AppError('One or more permissions not found', 400, 'INVALID_PERMISSIONS');
      }
    }

    // Create role with permissions
    const role = await prisma.role.create({
      data: {
        name,
        description,
        isSystem: false,
        rolePermissions: {
          create: permissionIds.map(permissionId => ({ permissionId })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    logger.info('Role created successfully', {
      roleId: role.id,
      name: role.name,
      permissionCount: permissionIds.length,
    });

    return {
      ...role,
      permissions: role.rolePermissions.map(rp => rp.permission),
      userCount: 0,
      users: [],
      rolePermissions: undefined,
    } as Role;
  }

  /**
   * Update role
   * تحديث الدور
   */
  async updateRole(id: string, roleData: UpdateRoleData): Promise<Role> {
    const { name, description, permissionIds } = roleData;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
    }

    // Check if it's a system role
    if (existingRole.isSystem) {
      throw new AppError('Cannot modify system role', 400, 'SYSTEM_ROLE_IMMUTABLE');
    }

    // Check for name conflicts
    if (name && name !== existingRole.name) {
      const conflictRole = await prisma.role.findUnique({
        where: { name },
      });

      if (conflictRole) {
        throw new AppError('Role name already exists', 409, 'ROLE_NAME_EXISTS');
      }
    }

    // Validate permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        throw new AppError('One or more permissions not found', 400, 'INVALID_PERMISSIONS');
      }
    }

    // Update role
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Update permissions if provided
    if (permissionIds !== undefined) {
      // Remove existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({ roleId: id, permissionId })),
        });
      }

      // Fetch updated role with new permissions
      const updatedRole = await prisma.role.findUnique({
        where: { id },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          userRoles: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      logger.info('Role updated successfully', {
        roleId: id,
        updatedFields: Object.keys(updateData),
        permissionsUpdated: true,
      });

      return {
        ...updatedRole!,
        permissions: updatedRole!.rolePermissions.map(rp => rp.permission),
        users: updatedRole!.userRoles.map(ur => ur.user),
        userCount: updatedRole!.userRoles.length,
        rolePermissions: undefined,
        userRoles: undefined,
      } as Role;
    }

    logger.info('Role updated successfully', {
      roleId: id,
      updatedFields: Object.keys(updateData),
    });

    return {
      ...role,
      permissions: role.rolePermissions.map(rp => rp.permission),
      users: role.userRoles.map(ur => ur.user),
      userCount: role.userRoles.length,
      rolePermissions: undefined,
      userRoles: undefined,
    } as Role;
  }

  /**
   * Delete role
   * حذف الدور
   */
  async deleteRole(id: string): Promise<void> {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });

    if (!role) {
      throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
    }

    // Check if it's a system role
    if (role.isSystem) {
      throw new AppError('Cannot delete system role', 400, 'SYSTEM_ROLE_IMMUTABLE');
    }

    // Check if role is assigned to users
    if (role.userRoles.length > 0) {
      throw new AppError('Cannot delete role that is assigned to users', 400, 'ROLE_IN_USE');
    }

    // Delete role (cascade will handle permissions)
    await prisma.role.delete({
      where: { id },
    });

    logger.info('Role deleted successfully', {
      roleId: id,
      name: role.name,
    });
  }

  /**
   * Get all permissions
   * الحصول على جميع الصلاحيات
   */
  async getPermissions(params: PaginationParams): Promise<PaginatedResponse<Permission>> {
    const { page = 1, limit = 50, sortBy = 'resource', sortOrder = 'asc', search } = params;

    // Build where clause
    const where = {
      ...getPrismaSearchFilter(search, ['name', 'resource', 'action', 'description']),
    };

    // Get total count
    const total = await prisma.permission.count({ where });

    // Get permissions with pagination
    const permissions = await prisma.permission.findMany({
      where,
      orderBy: getPrismaSortOptions(sortBy, sortOrder),
      skip: getPaginationOffset(page, limit),
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);

    return {
      success: true,
      data: permissions,
      pagination,
      message: 'Permissions retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get role statistics
   * الحصول على إحصائيات الأدوار
   */
  async getRoleStats(): Promise<{
    totalRoles: number;
    systemRoles: number;
    customRoles: number;
    totalPermissions: number;
    systemPermissions: number;
    customPermissions: number;
  }> {
    const [
      totalRoles,
      systemRoles,
      totalPermissions,
      systemPermissions,
    ] = await Promise.all([
      prisma.role.count(),
      prisma.role.count({ where: { isSystem: true } }),
      prisma.permission.count(),
      prisma.permission.count({ where: { isSystem: true } }),
    ]);

    return {
      totalRoles,
      systemRoles,
      customRoles: totalRoles - systemRoles,
      totalPermissions,
      systemPermissions,
      customPermissions: totalPermissions - systemPermissions,
    };
  }
}
