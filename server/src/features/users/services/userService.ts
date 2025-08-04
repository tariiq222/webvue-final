/**
 * 👥 User Service
 * خدمة المستخدمين
 * 
 * Business logic for user management operations including CRUD,
 * search, filtering, and role assignment.
 */

import { prisma } from '@/database/connection';
import { hashPassword } from '@/shared/utils/password';
import { AppError } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';
import {
  calculatePagination,
  getPaginationOffset,
  getPrismaSearchFilter,
  getPrismaSortOptions,
} from '@/shared/utils/pagination';
import {
  User,
  CreateUserData,
  UpdateUserData,
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types';

export class UserService {
  /**
   * Get all users with pagination and filtering
   * الحصول على جميع المستخدمين مع التصفح والتصفية
   */
  async getUsers(params: PaginationParams): Promise<PaginatedResponse<User>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search } = params;

    // Build where clause
    const where = {
      ...getPrismaSearchFilter(search, ['firstName', 'lastName', 'email', 'username']),
    };

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: getPrismaSortOptions(sortBy, sortOrder),
      skip: getPaginationOffset(page, limit),
      take: limit,
    });

    // Remove sensitive data
    const sanitizedUsers = users.map(user => this.sanitizeUser(user));

    const pagination = calculatePagination(page, limit, total);

    return {
      success: true,
      data: sanitizedUsers,
      pagination,
      message: 'Users retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get user by ID
   * الحصول على مستخدم بالمعرف
   */
  async getUserById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Create new user
   * إنشاء مستخدم جديد
   */
  async createUser(userData: CreateUserData): Promise<User> {
    const { email, username, password, firstName, lastName, roleIds = [] } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new AppError('Email already exists', 409, 'EMAIL_ALREADY_EXISTS');
      }
      if (existingUser.username === username.toLowerCase()) {
        throw new AppError('Username already exists', 409, 'USERNAME_ALREADY_EXISTS');
      }
    }

    // Validate roles if provided
    if (roleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: { id: { in: roleIds } },
      });

      if (roles.length !== roleIds.length) {
        throw new AppError('One or more roles not found', 400, 'INVALID_ROLES');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with roles
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        userRoles: {
          create: roleIds.map(roleId => ({ roleId })),
        },
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    logger.info('User created successfully', {
      userId: user.id,
      email: user.email,
      username: user.username,
      roles: roleIds,
    });

    return this.sanitizeUser(user);
  }

  /**
   * Update user
   * تحديث المستخدم
   */
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const { email, username, firstName, lastName, avatar, isActive, roleIds } = userData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check for email/username conflicts
    if (email || username) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                email ? { email: email.toLowerCase() } : {},
                username ? { username: username.toLowerCase() } : {},
              ].filter(condition => Object.keys(condition).length > 0),
            },
          ],
        },
      });

      if (conflictUser) {
        if (email && conflictUser.email === email.toLowerCase()) {
          throw new AppError('Email already exists', 409, 'EMAIL_ALREADY_EXISTS');
        }
        if (username && conflictUser.username === username.toLowerCase()) {
          throw new AppError('Username already exists', 409, 'USERNAME_ALREADY_EXISTS');
        }
      }
    }

    // Validate roles if provided
    if (roleIds && roleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: { id: { in: roleIds } },
      });

      if (roles.length !== roleIds.length) {
        throw new AppError('One or more roles not found', 400, 'INVALID_ROLES');
      }
    }

    // Update user
    const updateData: any = {};
    if (email) updateData.email = email.toLowerCase();
    if (username) updateData.username = username.toLowerCase();
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Update roles if provided
    if (roleIds !== undefined) {
      // Remove existing roles
      await prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // Add new roles
      if (roleIds.length > 0) {
        await prisma.userRole.createMany({
          data: roleIds.map(roleId => ({ userId: id, roleId })),
        });
      }

      // Fetch updated user with new roles
      const updatedUser = await prisma.user.findUnique({
        where: { id },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      logger.info('User updated successfully', {
        userId: id,
        updatedFields: Object.keys(updateData),
        rolesUpdated: roleIds !== undefined,
      });

      return this.sanitizeUser(updatedUser!);
    }

    logger.info('User updated successfully', {
      userId: id,
      updatedFields: Object.keys(updateData),
    });

    return this.sanitizeUser(user);
  }

  /**
   * Delete user
   * حذف المستخدم
   */
  async deleteUser(id: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if user is system user (admin)
    const adminRole = await prisma.role.findUnique({
      where: { name: 'Super Admin' },
      include: {
        userRoles: {
          where: { userId: id },
        },
      },
    });

    if (adminRole && adminRole.userRoles.length > 0) {
      // Check if this is the last admin
      const adminCount = await prisma.userRole.count({
        where: { roleId: adminRole.id },
      });

      if (adminCount <= 1) {
        throw new AppError('Cannot delete the last admin user', 400, 'CANNOT_DELETE_LAST_ADMIN');
      }
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    logger.info('User deleted successfully', {
      userId: id,
      email: user.email,
    });
  }

  /**
   * Get user statistics
   * الحصول على إحصائيات المستخدمين
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    with2FA: number;
    without2FA: number;
  }> {
    const [
      total,
      active,
      verified,
      with2FA,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({ where: { twoFactorEnabled: true } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      verified,
      unverified: total - verified,
      with2FA,
      without2FA: total - with2FA,
    };
  }

  /**
   * Remove sensitive data from user object
   * إزالة البيانات الحساسة من كائن المستخدم
   */
  private sanitizeUser(user: any): User {
    const { password, twoFactorSecret, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
