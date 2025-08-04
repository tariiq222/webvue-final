/**
 * 📊 Monitoring Routes
 * مسارات المراقبة
 * 
 * Express routes for monitoring and alerting endpoints.
 */

import { Router } from 'express';
import {
  getCurrentMetrics,
  getHistoricalMetrics,
  getHealthSummary,
  getActiveAlerts,
  getAllAlerts,
  createCustomAlert,
  resolveAlert,
  startMonitoring,
  stopMonitoring,
} from '../controllers/monitoringController';
import { authenticate, requirePermission } from '@/shared/middleware/auth';
import { validateBody, validateQuery, validateParams } from '@/shared/middleware/validation';
import { auditLog, AuditActions, AuditResources } from '@/shared/middleware/audit';
import {
  historicalMetricsQuerySchema,
  alertQuerySchema,
  createCustomAlertSchema,
  alertIdSchema,
} from '../validation/monitoringValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Monitoring
 *   description: System monitoring and alerting operations
 */

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/monitoring/metrics/current
 * Get current system metrics
 */
router.get(
  '/metrics/current',
  requirePermission('monitoring:read'),
  auditLog(AuditActions.SYSTEM_MAINTENANCE, AuditResources.SYSTEM),
  getCurrentMetrics
);

/**
 * GET /api/monitoring/metrics/historical
 * Get historical metrics
 */
router.get(
  '/metrics/historical',
  requirePermission('monitoring:read'),
  validateQuery(historicalMetricsQuerySchema),
  auditLog(AuditActions.SYSTEM_MAINTENANCE, AuditResources.SYSTEM),
  getHistoricalMetrics
);

/**
 * GET /api/monitoring/health
 * Get system health summary
 */
router.get(
  '/health',
  requirePermission('monitoring:read'),
  auditLog(AuditActions.SYSTEM_MAINTENANCE, AuditResources.SYSTEM),
  getHealthSummary
);

/**
 * GET /api/monitoring/alerts/active
 * Get active alerts
 */
router.get(
  '/alerts/active',
  requirePermission('monitoring:read'),
  auditLog(AuditActions.SYSTEM_MAINTENANCE, AuditResources.SYSTEM),
  getActiveAlerts
);

/**
 * GET /api/monitoring/alerts
 * Get all alerts with pagination
 */
router.get(
  '/alerts',
  requirePermission('monitoring:read'),
  validateQuery(alertQuerySchema),
  auditLog(AuditActions.SYSTEM_MAINTENANCE, AuditResources.SYSTEM),
  getAllAlerts
);

/**
 * POST /api/monitoring/alerts
 * Create custom alert
 */
router.post(
  '/alerts',
  requirePermission('monitoring:create_alert'),
  validateBody(createCustomAlertSchema),
  auditLog(AuditActions.SYSTEM_MAINTENANCE, AuditResources.SYSTEM),
  createCustomAlert
);

/**
 * PUT /api/monitoring/alerts/:id/resolve
 * Resolve alert
 */
router.put(
  '/alerts/:id/resolve',
  requirePermission('monitoring:resolve_alert'),
  validateParams(alertIdSchema),
  auditLog(AuditActions.SYSTEM_MAINTENANCE, AuditResources.SYSTEM),
  resolveAlert
);

/**
 * POST /api/monitoring/start
 * Start monitoring (admin only)
 */
router.post(
  '/start',
  requirePermission('system:admin'),
  auditLog(AuditActions.SYSTEM_MAINTENANCE, AuditResources.SYSTEM),
  startMonitoring
);

/**
 * POST /api/monitoring/stop
 * Stop monitoring (admin only)
 */
router.post(
  '/stop',
  requirePermission('system:admin'),
  auditLog(AuditActions.SYSTEM_MAINTENANCE, AuditResources.SYSTEM),
  stopMonitoring
);

export { router as monitoringRouter };
