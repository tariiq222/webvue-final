/**
 * 👑 Role Routes
 * مسارات الأدوار
 * 
 * Express routes for role and permission management endpoints.
 */

import { Router } from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  getRoleStats,
} from '../controllers/roleController';
import { authenticate, requirePermission } from '@/shared/middleware/auth';
import { validateBody, validateQuery, validateParams } from '@/shared/middleware/validation';
import { auditLog, AuditActions, AuditResources } from '@/shared/middleware/audit';
import {
  createRoleSchema,
  updateRoleSchema,
  roleQuerySchema,
  permissionQuerySchema,
  roleIdSchema,
} from '../validation/roleValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role and permission management operations
 */

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/roles
 * Get all roles with pagination and filtering
 */
router.get(
  '/',
  requirePermission('roles:read'),
  validateQuery(roleQuerySchema),
  auditLog(AuditActions.ROLE_CREATE, AuditResources.ROLE),
  getRoles
);

/**
 * GET /api/roles/stats
 * Get role statistics
 */
router.get(
  '/stats',
  requirePermission('roles:read'),
  auditLog(AuditActions.ROLE_CREATE, AuditResources.ROLE),
  getRoleStats
);

/**
 * GET /api/roles/permissions
 * Get all permissions
 */
router.get(
  '/permissions',
  requirePermission('permissions:read'),
  validateQuery(permissionQuerySchema),
  auditLog(AuditActions.ROLE_CREATE, AuditResources.PERMISSION),
  getPermissions
);

/**
 * GET /api/roles/:id
 * Get role by ID
 */
router.get(
  '/:id',
  requirePermission('roles:read'),
  validateParams(roleIdSchema),
  auditLog(AuditActions.ROLE_CREATE, AuditResources.ROLE),
  getRoleById
);

/**
 * POST /api/roles
 * Create new role
 */
router.post(
  '/',
  requirePermission('roles:create'),
  validateBody(createRoleSchema),
  auditLog(AuditActions.ROLE_CREATE, AuditResources.ROLE),
  createRole
);

/**
 * PUT /api/roles/:id
 * Update role
 */
router.put(
  '/:id',
  requirePermission('roles:update'),
  validateParams(roleIdSchema),
  validateBody(updateRoleSchema),
  auditLog(AuditActions.ROLE_UPDATE, AuditResources.ROLE),
  updateRole
);

/**
 * DELETE /api/roles/:id
 * Delete role
 */
router.delete(
  '/:id',
  requirePermission('roles:delete'),
  validateParams(roleIdSchema),
  auditLog(AuditActions.ROLE_DELETE, AuditResources.ROLE),
  deleteRole
);

export { router as roleRouter };
