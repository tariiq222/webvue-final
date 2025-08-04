/**
 * 📊 Dashboard Routes
 * مسارات لوحة التحكم
 * 
 * Express routes for dashboard and analytics endpoints.
 */

import { Router } from 'express';
import {
  getOverview,
  getActivityChart,
  getRecentActivities,
  getSystemHealth,
  getActionDistribution,
} from '../controllers/dashboardController';
import { authenticate, requirePermission } from '@/shared/middleware/auth';
import { validateQuery } from '@/shared/middleware/validation';
import { auditLog, AuditActions, AuditResources } from '@/shared/middleware/audit';
import {
  activityChartQuerySchema,
  recentActivitiesQuerySchema,
} from '../validation/dashboardValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard and analytics operations
 */

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/dashboard/overview
 * Get dashboard overview statistics
 */
router.get(
  '/overview',
  requirePermission('dashboard:read'),
  auditLog(AuditActions.USER_CREATE, AuditResources.SYSTEM),
  getOverview
);

/**
 * GET /api/dashboard/activity-chart
 * Get user activity chart data
 */
router.get(
  '/activity-chart',
  requirePermission('dashboard:read'),
  validateQuery(activityChartQuerySchema),
  auditLog(AuditActions.USER_CREATE, AuditResources.SYSTEM),
  getActivityChart
);

/**
 * GET /api/dashboard/recent-activities
 * Get recent activities
 */
router.get(
  '/recent-activities',
  requirePermission('dashboard:read'),
  validateQuery(recentActivitiesQuerySchema),
  auditLog(AuditActions.USER_CREATE, AuditResources.SYSTEM),
  getRecentActivities
);

/**
 * GET /api/dashboard/system-health
 * Get system health metrics
 */
router.get(
  '/system-health',
  requirePermission('system:monitor'),
  auditLog(AuditActions.SYSTEM_MAINTENANCE, AuditResources.SYSTEM),
  getSystemHealth
);

/**
 * GET /api/dashboard/action-distribution
 * Get action distribution statistics
 */
router.get(
  '/action-distribution',
  requirePermission('dashboard:read'),
  auditLog(AuditActions.USER_CREATE, AuditResources.SYSTEM),
  getActionDistribution
);

export { router as dashboardRouter };
