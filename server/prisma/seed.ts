/**
 * 🌱 Database Seed Script
 * سكريبت البيانات الأولية
 * 
 * Creates initial data for WebCore application
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full system access',
      isActive: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      displayName: 'User',
      description: 'Standard user access',
      isActive: true,
    },
  });

  // Create default permissions
  const permissions = [
    { name: 'users.read', description: 'Read users' },
    { name: 'users.write', description: 'Write users' },
    { name: 'users.delete', description: 'Delete users' },
    { name: 'roles.read', description: 'Read roles' },
    { name: 'roles.write', description: 'Write roles' },
    { name: 'settings.read', description: 'Read settings' },
    { name: 'settings.write', description: 'Write settings' },
    { name: 'plugins.read', description: 'Read plugins' },
    { name: 'plugins.write', description: 'Write plugins' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Assign all permissions to admin role
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@webcore.com' },
    update: {},
    create: {
      email: 'admin@webcore.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Create default settings
  const defaultSettings = [
    {
      key: 'app.name',
      value: 'WebCore Dashboard',
      description: 'Application name',
      category: 'general',
    },
    {
      key: 'app.version',
      value: '2.0.0',
      description: 'Application version',
      category: 'general',
    },
    {
      key: 'security.session_timeout',
      value: '3600',
      description: 'Session timeout in seconds',
      category: 'security',
    },
    {
      key: 'upload.max_size',
      value: '10485760',
      description: 'Maximum upload size in bytes',
      category: 'upload',
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('📧 Admin user created: admin@webcore.com');
  console.log('🔑 Admin password: admin123');
  console.log('⚠️  Please change the admin password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
