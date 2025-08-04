/**
 * 🔔 Notification Routes
 * مسارات الإشعارات
 * 
 * Express routes for notification management endpoints.
 */

import { Router } from 'express';
import {
  getUserNotifications,
  getAllNotifications,
  createNotification,
  createBulkNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
} from '../controllers/notificationController';
import { authenticate, requirePermission } from '@/shared/middleware/auth';
import { validateBody, validateQuery, validateParams } from '@/shared/middleware/validation';
import { auditLog, AuditActions, AuditResources } from '@/shared/middleware/audit';
import {
  createNotificationSchema,
  createBulkNotificationsSchema,
  notificationQuerySchema,
  notificationIdSchema,
} from '../validation/notificationValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management operations
 */

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get(
  '/',
  validateQuery(notificationQuerySchema),
  auditLog(AuditActions.NOTIFICATION_CREATE, AuditResources.NOTIFICATION),
  getUserNotifications
);

/**
 * GET /api/notifications/stats
 * Get notification statistics
 */
router.get(
  '/stats',
  auditLog(AuditActions.NOTIFICATION_CREATE, AuditResources.NOTIFICATION),
  getNotificationStats
);

/**
 * GET /api/notifications/all
 * Get all notifications (admin only)
 */
router.get(
  '/all',
  requirePermission('notifications:read_all'),
  validateQuery(notificationQuerySchema),
  auditLog(AuditActions.NOTIFICATION_CREATE, AuditResources.NOTIFICATION),
  getAllNotifications
);

/**
 * POST /api/notifications
 * Create notification
 */
router.post(
  '/',
  requirePermission('notifications:create'),
  validateBody(createNotificationSchema),
  auditLog(AuditActions.NOTIFICATION_CREATE, AuditResources.NOTIFICATION),
  createNotification
);

/**
 * POST /api/notifications/bulk
 * Create bulk notifications
 */
router.post(
  '/bulk',
  requirePermission('notifications:create_bulk'),
  validateBody(createBulkNotificationsSchema),
  auditLog(AuditActions.NOTIFICATION_CREATE, AuditResources.NOTIFICATION),
  createBulkNotifications
);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put(
  '/read-all',
  auditLog(AuditActions.NOTIFICATION_UPDATE, AuditResources.NOTIFICATION),
  markAllAsRead
);

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put(
  '/:id/read',
  validateParams(notificationIdSchema),
  auditLog(AuditActions.NOTIFICATION_UPDATE, AuditResources.NOTIFICATION),
  markAsRead
);

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete(
  '/:id',
  validateParams(notificationIdSchema),
  auditLog(AuditActions.NOTIFICATION_DELETE, AuditResources.NOTIFICATION),
  deleteNotification
);

export { router as notificationRouter };
