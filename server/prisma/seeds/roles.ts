/**
 * 👥 Roles Seed
 * بذور الأدوار
 * 
 * Seeds the database with default roles and their permissions.
 */

import { PrismaClient } from '@prisma/client';

export async function seedRoles(prisma: PrismaClient) {
  // Define roles with their permissions
  const rolesData = [
    {
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: [
        'users:manage', 'roles:manage', 'permissions:manage',
        'plugins:manage', 'settings:manage', 'notifications:manage',
        'files:manage', 'audit:manage', 'dashboard:manage',
        'system:manage', 'profile:read', 'profile:update'
      ]
    },
    {
      name: 'Admin',
      description: 'Administrative access with most permissions',
      permissions: [
        'users:create', 'users:read', 'users:update',
        'roles:read', 'roles:update',
        'plugins:read', 'plugins:update', 'plugins:activate',
        'settings:read', 'settings:update',
        'notifications:manage',
        'files:manage',
        'audit:read',
        'dashboard:read', 'dashboard:manage',
        'profile:read', 'profile:update'
      ]
    },
    {
      name: 'Editor',
      description: 'Content management and basic administrative access',
      permissions: [
        'users:read',
        'plugins:read',
        'settings:read',
        'notifications:create', 'notifications:read', 'notifications:update',
        'files:upload', 'files:read', 'files:delete',
        'dashboard:read',
        'profile:read', 'profile:update'
      ]
    },
    {
      name: 'User',
      description: 'Basic user access with limited permissions',
      permissions: [
        'notifications:read',
        'files:upload', 'files:read',
        'dashboard:read',
        'profile:read', 'profile:update'
      ]
    },
    {
      name: 'Guest',
      description: 'Minimal access for guest users',
      permissions: [
        'dashboard:read',
        'profile:read'
      ]
    }
  ];

  for (const roleData of rolesData) {
    // Create or update the role
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        description: roleData.description,
      },
      create: {
        name: roleData.name,
        description: roleData.description,
        isSystem: true,
      },
    });

    // Get permissions for this role
    const permissions = await prisma.permission.findMany({
      where: {
        name: {
          in: roleData.permissions
        }
      }
    });

    // Clear existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id }
    });

    // Create new role permissions
    for (const permission of permissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }

    console.log(`✅ Seeded role: ${role.name} with ${permissions.length} permissions`);
  }

  console.log(`✅ Seeded ${rolesData.length} roles`);
}
