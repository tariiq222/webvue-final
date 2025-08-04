/**
 * 🧪 Users API Tests
 * اختبارات واجهة برمجة تطبيقات المستخدمين
 * 
 * Test suite for user management endpoints.
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import { hashPassword } from '../../src/shared/utils/password';

const prisma = new PrismaClient();

describe('Users API', () => {
  let adminToken: string;
  let userToken: string;
  let adminUserId: string;
  let regularUserId: string;
  let userRoleId: string;
  let adminRoleId: string;

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

    // Create permissions
    const permissions = await prisma.permission.createMany({
      data: [
        { name: 'users:read', resource: 'users', action: 'read', isSystem: true },
        { name: 'users:create', resource: 'users', action: 'create', isSystem: true },
        { name: 'users:update', resource: 'users', action: 'update', isSystem: true },
        { name: 'users:delete', resource: 'users', action: 'delete', isSystem: true },
        { name: 'users:manage', resource: 'users', action: 'manage', isSystem: true },
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

    adminRoleId = adminRole.id;
    userRoleId = userRole.id;

    // Assign permissions to roles
    await prisma.rolePermission.createMany({
      data: createdPermissions.map(permission => ({
        roleId: adminRole.id,
        permissionId: permission.id,
      })),
    });

    await prisma.rolePermission.create({
      data: {
        roleId: userRole.id,
        permissionId: createdPermissions.find(p => p.name === 'users:read')!.id,
      },
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
    regularUserId = regularUser.id;

    // Assign roles to users
    await prisma.userRole.createMany({
      data: [
        { userId: adminUser.id, roleId: adminRole.id },
        { userId: regularUser.id, roleId: userRole.id },
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

  describe('GET /api/users', () => {
    it('should get all users with admin permissions', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should support search', async () => {
      const response = await request(app)
        .get('/api/users?search=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe('admin@test.com');
    });

    it('should deny access without proper permissions', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should deny access without authentication', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID with admin permissions', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(regularUserId);
      expect(response.body.data.user.email).toBe('user@test.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('POST /api/users', () => {
    it('should create new user with admin permissions', async () => {
      const newUser = {
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'NewPass123',
        firstName: 'New',
        lastName: 'User',
        roleIds: [userRoleId],
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return error for duplicate email', async () => {
      const duplicateUser = {
        email: 'admin@test.com', // Already exists
        username: 'newuser',
        password: 'NewPass123',
        firstName: 'New',
        lastName: 'User',
      };

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateUser)
        .expect(409);
    });

    it('should return validation error for invalid data', async () => {
      const invalidUser = {
        email: 'invalid-email',
        username: 'ab', // Too short
        password: 'weak', // Too weak
        firstName: '',
        lastName: '',
      };

      await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user with admin permissions', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        isActive: false,
      };

      const response = await request(app)
        .put(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.user.lastName).toBe('Name');
      expect(response.body.data.user.isActive).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app)
        .put(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user with admin permissions', async () => {
      await request(app)
        .delete(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify user is deleted
      await request(app)
        .get(`/api/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('GET /api/users/stats', () => {
    it('should get user statistics with admin permissions', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.total).toBe(2);
      expect(response.body.data.stats.active).toBe(2);
      expect(response.body.data.stats.verified).toBe(2);
    });
  });
});
