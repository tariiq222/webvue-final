/**
 * 🏥 Health Check Routes
 * مسارات فحص الصحة
 * 
 * Health check endpoints for monitoring and load balancer health checks.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';
import { checkDatabaseHealth } from '@/database/connection';

const router = Router();

/**
 * Basic health check
 * فحص الصحة الأساسي
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '2.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100,
    },
    cpu: process.cpuUsage(),
  };

  res.status(200).json({
    success: true,
    data: healthCheck,
  });
}));

/**
 * Detailed health check
 * فحص الصحة المفصل
 */
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const checks = {
    server: 'OK',
    database: await checkDatabaseHealth() ? 'OK' : 'ERROR',
    redis: 'OK', // TODO: Add Redis health check if configured
    storage: 'OK', // TODO: Add storage health check
  };

  const allHealthy = Object.values(checks).every(status => status === 'OK');

  const healthCheck = {
    status: allHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '2.0.0',
    checks,
    system: {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100,
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100,
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    },
  };

  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: allHealthy,
    data: healthCheck,
  });
}));

/**
 * Readiness check
 * فحص الجاهزية
 */
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add readiness checks (database connection, etc.)
  const isReady = true; // Placeholder

  if (isReady) {
    res.status(200).json({
      success: true,
      message: 'Service is ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      success: false,
      message: 'Service is not ready',
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * Liveness check
 * فحص الحيوية
 */
router.get('/live', asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}));

export { router as healthRouter };
