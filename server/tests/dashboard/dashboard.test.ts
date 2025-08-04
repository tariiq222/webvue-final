/**
 * 🧪 Dashboard API Tests
 * اختبارات واجهة برمجة تطبيقات لوحة التحكم
 * 
 * Test suite for dashboard and analytics endpoints.
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import { hashPassword } from '../../src/shared/utils/password';

const prisma = new PrismaClient();

describe('Dashboard API', () => {
  let adminToken: string;
  let userToken: string;
  let adminUserId: string;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up
    await prisma.refreshToken.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.auditLog.deleteMany();

    // Create permissions
    const permissions = await prisma.permission.createMany({
      data: [
        { name: 'dashboard:read', resource: 'dashboard', action: 'read', isSystem: true },
        { name: 'system:monitor', resource: 'system', action: 'monitor', isSystem: true },
        { name: 'users:read', resource: 'users', action: 'read', isSystem: true },
      ],
    });

    const createdPermissions = await prisma.permission.findMany();

    // Create roles
    const adminRole = await prisma.role.create({
      data: { name: 'Admin', description: 'Administrator role', isSystem: true },
    });

    const userRole = await prisma.role.create({
      data: { name: 'User', description: 'Regular user role', isSystem: true },
    });

    // Assign permissions to admin role
    await prisma.rolePermission.createMany({
      data: createdPermissions.map(permission => ({
        roleId: adminRole.id,
        permissionId: permission.id,
      })),
    });

    // Create test users
    const hashedPassword = await hashPassword('TestPass123');

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        emailVerified: true,
      },
    });

    const regularUser = await prisma.user.create({
      data: {
        email: 'user@test.com',
        username: 'user',
        password: hashedPassword,
        firstName: 'Regular',
        lastName: 'User',
        isActive: true,
        emailVerified: true,
      },
    });

    adminUserId = adminUser.id;

    // Assign roles to users
    await prisma.userRole.createMany({
      data: [
        { userId: adminUser.id, roleId: adminRole.id },
        { userId: regularUser.id, roleId: userRole.id },
      ],
    });

    // Create some audit log entries for testing
    await prisma.auditLog.createMany({
      data: [
        {
          userId: adminUser.id,
          action: 'login',
          resource: 'auth',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
          details: {},
        },
        {
          userId: regularUser.id,
          action: 'user_create',
          resource: 'user',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
          details: {},
        },
      ],
    });

    // Login to get tokens
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'TestPass123' });

    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'TestPass123' });

    adminToken = adminLoginResponse.body.data.tokens.accessToken;
    userToken = userLoginResponse.body.data.tokens.accessToken;
  });

  describe('GET /api/dashboard/overview', () => {
    it('should get overview statistics with admin permissions', async () => {
      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.users).toBeDefined();
      expect(response.body.data.stats.roles).toBeDefined();
      expect(response.body.data.stats.settings).toBeDefined();
      expect(response.body.data.stats.activity).toBeDefined();

      // Check user stats
      expect(response.body.data.stats.users.total).toBe(2);
      expect(response.body.data.stats.users.active).toBe(2);

      // Check role stats
      expect(response.body.data.stats.roles.total).toBe(2);
      expect(response.body.data.stats.roles.system).toBe(2);
      expect(response.body.data.stats.roles.custom).toBe(0);
    });

    it('should deny access without proper permissions', async () => {
      await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should deny access without authentication', async () => {
      await request(app)
        .get('/api/dashboard/overview')
        .expect(401);
    });
  });

  describe('GET /api/dashboard/activity-chart', () => {
    it('should get activity chart data with default parameters', async () => {
      const response = await request(app)
        .get('/api/dashboard/activity-chart')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.chartData).toBeDefined();
      expect(Array.isArray(response.body.data.chartData)).toBe(true);
      expect(response.body.data.chartData.length).toBe(30); // Default 30 days
    });

    it('should get activity chart data with custom days parameter', async () => {
      const response = await request(app)
        .get('/api/dashboard/activity-chart?days=7')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.chartData).toBeDefined();
      expect(response.body.data.chartData.length).toBe(7);
    });

    it('should validate days parameter', async () => {
      await request(app)
        .get('/api/dashboard/activity-chart?days=0')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      await request(app)
        .get('/api/dashboard/activity-chart?days=400')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('GET /api/dashboard/recent-activities', () => {
    it('should get recent activities with default limit', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeDefined();
      expect(Array.isArray(response.body.data.activities)).toBe(true);
      expect(response.body.data.activities.length).toBeGreaterThan(0);
    });

    it('should get recent activities with custom limit', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-activities?limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities.length).toBeLessThanOrEqual(1);
    });

    it('should validate limit parameter', async () => {
      await request(app)
        .get('/api/dashboard/recent-activities?limit=0')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      await request(app)
        .get('/api/dashboard/recent-activities?limit=101')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('GET /api/dashboard/system-health', () => {
    it('should get system health metrics with proper permissions', async () => {
      const response = await request(app)
        .get('/api/dashboard/system-health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.health).toBeDefined();
      expect(response.body.data.health.database).toBeDefined();
      expect(response.body.data.health.memory).toBeDefined();
      expect(response.body.data.health.uptime).toBeDefined();

      // Check database health
      expect(response.body.data.health.database.status).toMatch(/^(healthy|warning|error)$/);
      expect(typeof response.body.data.health.database.responseTime).toBe('number');

      // Check memory usage
      expect(typeof response.body.data.health.memory.used).toBe('number');
      expect(typeof response.body.data.health.memory.total).toBe('number');
      expect(typeof response.body.data.health.memory.percentage).toBe('number');
    });

    it('should deny access without proper permissions', async () => {
      await request(app)
        .get('/api/dashboard/system-health')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/dashboard/action-distribution', () => {
    it('should get action distribution statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/action-distribution')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.distribution).toBeDefined();
      expect(Array.isArray(response.body.data.distribution)).toBe(true);

      if (response.body.data.distribution.length > 0) {
        const firstItem = response.body.data.distribution[0];
        expect(firstItem.action).toBeDefined();
        expect(typeof firstItem.count).toBe('number');
        expect(typeof firstItem.percentage).toBe('number');
      }
    });
  });
});
