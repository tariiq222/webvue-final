/**
 * 👥 User Routes
 * مسارات المستخدمين
 * 
 * Express routes for user management endpoints.
 */

import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} from '../controllers/userController';
import { authenticate, requirePermission } from '@/shared/middleware/auth';
import { validateBody, validateQuery, validateParams } from '@/shared/middleware/validation';
import { auditLog, AuditActions, AuditResources } from '@/shared/middleware/audit';
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
  userIdSchema,
} from '../validation/userValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management operations
 */

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users
 * Get all users with pagination and filtering
 */
router.get(
  '/',
  requirePermission('users:read'),
  validateQuery(userQuerySchema),
  auditLog(AuditActions.USER_CREATE, AuditResources.USER),
  getUsers
);

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get(
  '/stats',
  requirePermission('users:read'),
  auditLog(AuditActions.USER_CREATE, AuditResources.USER),
  getUserStats
);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get(
  '/:id',
  requirePermission('users:read'),
  validateParams(userIdSchema),
  auditLog(AuditActions.USER_CREATE, AuditResources.USER),
  getUserById
);

/**
 * POST /api/users
 * Create new user
 */
router.post(
  '/',
  requirePermission('users:create'),
  validateBody(createUserSchema),
  auditLog(AuditActions.USER_CREATE, AuditResources.USER),
  createUser
);

/**
 * PUT /api/users/:id
 * Update user
 */
router.put(
  '/:id',
  requirePermission('users:update'),
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  auditLog(AuditActions.USER_UPDATE, AuditResources.USER),
  updateUser
);

/**
 * DELETE /api/users/:id
 * Delete user
 */
router.delete(
  '/:id',
  requirePermission('users:delete'),
  validateParams(userIdSchema),
  auditLog(AuditActions.USER_DELETE, AuditResources.USER),
  deleteUser
);

export { router as userRouter };
