/**
 * 👤 Profile Routes
 * مسارات الملف الشخصي
 * 
 * Express routes for user profile management endpoints.
 */

import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
  getActivityLog,
  getSessions,
  revokeSession,
  revokeAllSessions,
} from '../controllers/profileController';
import { authenticate } from '@/shared/middleware/auth';
import { validateBody, validateQuery, validateParams } from '@/shared/middleware/validation';
import { auditLog, AuditActions, AuditResources } from '@/shared/middleware/audit';
import { upload, validateFile, securityScan, cleanupFiles } from '@/shared/middleware/fileUpload';
import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  activityLogQuerySchema,
  sessionIdSchema,
} from '../validation/profileValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management operations
 */

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/profile
 * Get user profile
 */
router.get(
  '/',
  auditLog(AuditActions.USER_CREATE, AuditResources.USER),
  getProfile
);

/**
 * PUT /api/profile
 * Update user profile
 */
router.put(
  '/',
  validateBody(updateProfileSchema),
  auditLog(AuditActions.USER_UPDATE, AuditResources.USER),
  updateProfile
);

/**
 * PUT /api/profile/password
 * Change user password
 */
router.put(
  '/password',
  validateBody(changePasswordSchema),
  auditLog(AuditActions.PASSWORD_CHANGE, AuditResources.AUTH),
  changePassword
);

/**
 * POST /api/profile/avatar
 * Upload profile avatar
 */
router.post(
  '/avatar',
  upload.single('avatar'),
  validateFile,
  securityScan,
  cleanupFiles,
  auditLog(AuditActions.FILE_UPLOAD, AuditResources.FILE),
  uploadAvatar
);

/**
 * DELETE /api/profile/delete
 * Delete user account
 */
router.delete(
  '/delete',
  validateBody(deleteAccountSchema),
  auditLog(AuditActions.USER_DELETE, AuditResources.USER),
  deleteAccount
);

/**
 * GET /api/profile/activity
 * Get user activity log
 */
router.get(
  '/activity',
  validateQuery(activityLogQuerySchema),
  auditLog(AuditActions.USER_CREATE, AuditResources.USER),
  getActivityLog
);

/**
 * GET /api/profile/sessions
 * Get user sessions
 */
router.get(
  '/sessions',
  auditLog(AuditActions.USER_CREATE, AuditResources.USER),
  getSessions
);

/**
 * DELETE /api/profile/sessions
 * Revoke all user sessions
 */
router.delete(
  '/sessions',
  auditLog(AuditActions.LOGOUT, AuditResources.AUTH),
  revokeAllSessions
);

/**
 * DELETE /api/profile/sessions/:sessionId
 * Revoke specific user session
 */
router.delete(
  '/sessions/:sessionId',
  validateParams(sessionIdSchema),
  auditLog(AuditActions.LOGOUT, AuditResources.AUTH),
  revokeSession
);

export { router as profileRouter };
