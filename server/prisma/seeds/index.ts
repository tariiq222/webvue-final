/**
 * 🌱 Database Seeds
 * بذور قاعدة البيانات
 * 
 * Main seeding script that populates the database with initial data.
 */

import { PrismaClient } from '@prisma/client';
import { seedPermissions } from './permissions';
import { seedRoles } from './roles';
import { seedUsers } from './users';
import { seedSettings } from './settings';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Seed permissions first (required by roles)
    console.log('📋 Seeding permissions...');
    await seedPermissions(prisma);
    console.log('✅ Permissions seeded successfully');

    // 2. Seed roles (requires permissions)
    console.log('👥 Seeding roles...');
    await seedRoles(prisma);
    console.log('✅ Roles seeded successfully');

    // 3. Seed users (requires roles)
    console.log('👤 Seeding users...');
    await seedUsers(prisma);
    console.log('✅ Users seeded successfully');

    // 4. Seed settings
    console.log('⚙️ Seeding settings...');
    await seedSettings(prisma);
    console.log('✅ Settings seeded successfully');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
