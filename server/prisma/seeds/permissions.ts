/**
 * 📋 Permissions Seed
 * بذور الصلاحيات
 * 
 * Seeds the database with all required permissions for the WebCore system.
 */

import { PrismaClient } from '@prisma/client';

export async function seedPermissions(prisma: PrismaClient) {
  const permissions = [
    // User Management Permissions
    { name: 'users:create', resource: 'users', action: 'create', description: 'Create new users' },
    { name: 'users:read', resource: 'users', action: 'read', description: 'View users' },
    { name: 'users:update', resource: 'users', action: 'update', description: 'Update user information' },
    { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
    { name: 'users:manage', resource: 'users', action: 'manage', description: 'Full user management access' },

    // Role Management Permissions
    { name: 'roles:create', resource: 'roles', action: 'create', description: 'Create new roles' },
    { name: 'roles:read', resource: 'roles', action: 'read', description: 'View roles' },
    { name: 'roles:update', resource: 'roles', action: 'update', description: 'Update role information' },
    { name: 'roles:delete', resource: 'roles', action: 'delete', description: 'Delete roles' },
    { name: 'roles:manage', resource: 'roles', action: 'manage', description: 'Full role management access' },

    // Permission Management Permissions
    { name: 'permissions:create', resource: 'permissions', action: 'create', description: 'Create new permissions' },
    { name: 'permissions:read', resource: 'permissions', action: 'read', description: 'View permissions' },
    { name: 'permissions:update', resource: 'permissions', action: 'update', description: 'Update permission information' },
    { name: 'permissions:delete', resource: 'permissions', action: 'delete', description: 'Delete permissions' },
    { name: 'permissions:manage', resource: 'permissions', action: 'manage', description: 'Full permission management access' },

    // Plugin Management Permissions
    { name: 'plugins:create', resource: 'plugins', action: 'create', description: 'Install new plugins' },
    { name: 'plugins:read', resource: 'plugins', action: 'read', description: 'View plugins' },
    { name: 'plugins:update', resource: 'plugins', action: 'update', description: 'Update plugin configuration' },
    { name: 'plugins:delete', resource: 'plugins', action: 'delete', description: 'Uninstall plugins' },
    { name: 'plugins:activate', resource: 'plugins', action: 'activate', description: 'Activate/deactivate plugins' },
    { name: 'plugins:manage', resource: 'plugins', action: 'manage', description: 'Full plugin management access' },

    // Settings Management Permissions
    { name: 'settings:create', resource: 'settings', action: 'create', description: 'Create new settings' },
    { name: 'settings:read', resource: 'settings', action: 'read', description: 'View settings' },
    { name: 'settings:update', resource: 'settings', action: 'update', description: 'Update settings' },
    { name: 'settings:delete', resource: 'settings', action: 'delete', description: 'Delete settings' },
    { name: 'settings:manage', resource: 'settings', action: 'manage', description: 'Full settings management access' },

    // Notification Management Permissions
    { name: 'notifications:create', resource: 'notifications', action: 'create', description: 'Send notifications' },
    { name: 'notifications:read', resource: 'notifications', action: 'read', description: 'View notifications' },
    { name: 'notifications:update', resource: 'notifications', action: 'update', description: 'Update notifications' },
    { name: 'notifications:delete', resource: 'notifications', action: 'delete', description: 'Delete notifications' },
    { name: 'notifications:manage', resource: 'notifications', action: 'manage', description: 'Full notification management access' },

    // File Management Permissions
    { name: 'files:upload', resource: 'files', action: 'upload', description: 'Upload files' },
    { name: 'files:read', resource: 'files', action: 'read', description: 'View files' },
    { name: 'files:delete', resource: 'files', action: 'delete', description: 'Delete files' },
    { name: 'files:manage', resource: 'files', action: 'manage', description: 'Full file management access' },

    // Audit Log Permissions
    { name: 'audit:read', resource: 'audit', action: 'read', description: 'View audit logs' },
    { name: 'audit:manage', resource: 'audit', action: 'manage', description: 'Full audit log access' },

    // Dashboard Permissions
    { name: 'dashboard:read', resource: 'dashboard', action: 'read', description: 'View dashboard' },
    { name: 'dashboard:manage', resource: 'dashboard', action: 'manage', description: 'Manage dashboard' },

    // Profile Permissions
    { name: 'profile:read', resource: 'profile', action: 'read', description: 'View own profile' },
    { name: 'profile:update', resource: 'profile', action: 'update', description: 'Update own profile' },

    // System Permissions
    { name: 'system:health', resource: 'system', action: 'health', description: 'View system health' },
    { name: 'system:metrics', resource: 'system', action: 'metrics', description: 'View system metrics' },
    { name: 'system:manage', resource: 'system', action: 'manage', description: 'Full system management access' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: {
        ...permission,
        isSystem: true,
      },
    });
  }

  console.log(`✅ Seeded ${permissions.length} permissions`);
}
