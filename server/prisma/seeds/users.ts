/**
 * 👤 Users Seed
 * بذور المستخدمين
 * 
 * Seeds the database with default users for development and testing.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      email: 'admin@webcore.dev',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      password: hashedPassword,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      roleName: 'Super Admin'
    },
    {
      email: 'manager@webcore.dev',
      username: 'manager',
      firstName: 'Content',
      lastName: 'Manager',
      password: hashedPassword,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      roleName: 'Admin'
    },
    {
      email: 'editor@webcore.dev',
      username: 'editor',
      firstName: 'Content',
      lastName: 'Editor',
      password: hashedPassword,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      roleName: 'Editor'
    },
    {
      email: 'user@webcore.dev',
      username: 'user',
      firstName: 'Regular',
      lastName: 'User',
      password: hashedPassword,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      roleName: 'User'
    },
    {
      email: 'demo@webcore.dev',
      username: 'demo',
      firstName: 'Demo',
      lastName: 'User',
      password: hashedPassword,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      roleName: 'Guest'
    }
  ];

  for (const userData of usersData) {
    // Find the role
    const role = await prisma.role.findUnique({
      where: { name: userData.roleName }
    });

    if (!role) {
      console.error(`❌ Role not found: ${userData.roleName}`);
      continue;
    }

    // Create or update the user
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: userData.isActive,
        emailVerified: userData.emailVerified,
        emailVerifiedAt: userData.emailVerifiedAt,
      },
      create: {
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        isActive: userData.isActive,
        emailVerified: userData.emailVerified,
        emailVerifiedAt: userData.emailVerifiedAt,
      },
    });

    // Assign role to user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
      },
    });

    console.log(`✅ Seeded user: ${user.email} with role: ${userData.roleName}`);
  }

  console.log(`✅ Seeded ${usersData.length} users`);
}
