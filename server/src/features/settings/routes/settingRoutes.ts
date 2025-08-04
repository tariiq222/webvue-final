/**
 * ⚙️ Setting Routes
 * مسارات الإعدادات
 * 
 * Express routes for settings management endpoints.
 */

import { Router } from 'express';
import {
  getSettings,
  getPublicSettings,
  getCategories,
  getSettingsByCategory,
  getSettingByKey,
  createSetting,
  updateSetting,
  deleteSetting,
  bulkUpdateSettings,
} from '../controllers/settingController';
import { authenticate, requirePermission, optionalAuth } from '@/shared/middleware/auth';
import { validateBody, validateQuery, validateParams } from '@/shared/middleware/validation';
import { auditLog, AuditActions, AuditResources } from '@/shared/middleware/audit';
import {
  createSettingSchema,
  updateSettingSchema,
  bulkUpdateSettingsSchema,
  settingQuerySchema,
  settingKeySchema,
  categorySchema,
} from '../validation/settingValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: System settings management operations
 */

/**
 * GET /api/settings/public
 * Get public settings (no authentication required)
 */
router.get(
  '/public',
  optionalAuth,
  getPublicSettings
);

// All other routes require authentication
router.use(authenticate);

/**
 * GET /api/settings
 * Get all settings with pagination and filtering
 */
router.get(
  '/',
  requirePermission('settings:read'),
  validateQuery(settingQuerySchema),
  auditLog(AuditActions.SETTING_CREATE, AuditResources.SETTING),
  getSettings
);

/**
 * GET /api/settings/categories
 * Get setting categories
 */
router.get(
  '/categories',
  requirePermission('settings:read'),
  auditLog(AuditActions.SETTING_CREATE, AuditResources.SETTING),
  getCategories
);

/**
 * GET /api/settings/category/:category
 * Get settings by category
 */
router.get(
  '/category/:category',
  requirePermission('settings:read'),
  validateParams(categorySchema),
  auditLog(AuditActions.SETTING_CREATE, AuditResources.SETTING),
  getSettingsByCategory
);

/**
 * POST /api/settings
 * Create new setting
 */
router.post(
  '/',
  requirePermission('settings:create'),
  validateBody(createSettingSchema),
  auditLog(AuditActions.SETTING_CREATE, AuditResources.SETTING),
  createSetting
);

/**
 * PUT /api/settings/bulk
 * Bulk update settings
 */
router.put(
  '/bulk',
  requirePermission('settings:update'),
  validateBody(bulkUpdateSettingsSchema),
  auditLog(AuditActions.SETTING_UPDATE, AuditResources.SETTING),
  bulkUpdateSettings
);

/**
 * GET /api/settings/:key
 * Get setting by key
 */
router.get(
  '/:key',
  requirePermission('settings:read'),
  validateParams(settingKeySchema),
  auditLog(AuditActions.SETTING_CREATE, AuditResources.SETTING),
  getSettingByKey
);

/**
 * PUT /api/settings/:key
 * Update setting
 */
router.put(
  '/:key',
  requirePermission('settings:update'),
  validateParams(settingKeySchema),
  validateBody(updateSettingSchema),
  auditLog(AuditActions.SETTING_UPDATE, AuditResources.SETTING),
  updateSetting
);

/**
 * DELETE /api/settings/:key
 * Delete setting
 */
router.delete(
  '/:key',
  requirePermission('settings:delete'),
  validateParams(settingKeySchema),
  auditLog(AuditActions.SETTING_DELETE, AuditResources.SETTING),
  deleteSetting
);

export { router as settingRouter };
