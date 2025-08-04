/**
 * 🧪 Health Check Tests
 * اختبارات فحص الصحة
 * 
 * Test suite for health check endpoints.
 */

import request from 'supertest';
import app from '../../src/app';

describe('Health Check Endpoints', () => {
  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('OK');
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.uptime).toBeGreaterThan(0);
      expect(response.body.data.environment).toBeDefined();
      expect(response.body.data.version).toBe('2.0.0');
      expect(response.body.data.memory).toBeDefined();
      expect(response.body.data.cpu).toBeDefined();
    });

    it('should include memory usage information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const memory = response.body.data.memory;
      expect(memory.used).toBeGreaterThan(0);
      expect(memory.total).toBeGreaterThan(0);
      expect(memory.external).toBeGreaterThan(0);
    });

    it('should include CPU usage information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const cpu = response.body.data.cpu;
      expect(cpu.user).toBeDefined();
      expect(cpu.system).toBeDefined();
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBeDefined();
      expect(response.body.data.checks).toBeDefined();
      expect(response.body.data.system).toBeDefined();
    });

    it('should include system checks', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      const checks = response.body.data.checks;
      expect(checks.server).toBe('OK');
      expect(checks.database).toBeDefined();
      expect(checks.redis).toBeDefined();
      expect(checks.storage).toBeDefined();
    });

    it('should include detailed system information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      const system = response.body.data.system;
      expect(system.memory).toBeDefined();
      expect(system.cpu).toBeDefined();
      expect(system.platform).toBeDefined();
      expect(system.arch).toBeDefined();
      expect(system.nodeVersion).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Service is ready');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Service is alive');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });
});
