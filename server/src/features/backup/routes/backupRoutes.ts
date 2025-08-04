/**
 * 💾 Backup Routes
 * مسارات النسخ الاحتياطي
 * 
 * Express routes for backup and recovery endpoints.
 */

import { Router } from 'express';
import {
  getBackups,
  createDatabaseBackup,
  createFilesBackup,
  createFullBackup,
  restoreFromBackup,
  scheduleBackup,
  deleteBackup,
  getBackupStats,
} from '../controllers/backupController';
import { authenticate, requirePermission } from '@/shared/middleware/auth';
import { validateBody, validateQuery, validateParams } from '@/shared/middleware/validation';
import { auditLog, AuditActions, AuditResources } from '@/shared/middleware/audit';
import {
  backupQuerySchema,
  scheduleBackupSchema,
  backupIdSchema,
  restoreBackupIdSchema,
} from '../validation/backupValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Backup
 *   description: Backup and recovery operations
 */

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/backup/backups
 * Get all backups with pagination and filtering
 */
router.get(
  '/backups',
  requirePermission('backup:read'),
  validateQuery(backupQuerySchema),
  auditLog(AuditActions.BACKUP_CREATE, AuditResources.BACKUP),
  getBackups
);

/**
 * GET /api/backup/stats
 * Get backup statistics
 */
router.get(
  '/stats',
  requirePermission('backup:read'),
  auditLog(AuditActions.BACKUP_CREATE, AuditResources.BACKUP),
  getBackupStats
);

/**
 * POST /api/backup/database
 * Create database backup
 */
router.post(
  '/database',
  requirePermission('backup:create'),
  auditLog(AuditActions.BACKUP_CREATE, AuditResources.BACKUP),
  createDatabaseBackup
);

/**
 * POST /api/backup/files
 * Create files backup
 */
router.post(
  '/files',
  requirePermission('backup:create'),
  auditLog(AuditActions.BACKUP_CREATE, AuditResources.BACKUP),
  createFilesBackup
);

/**
 * POST /api/backup/full
 * Create full system backup
 */
router.post(
  '/full',
  requirePermission('backup:create'),
  auditLog(AuditActions.BACKUP_CREATE, AuditResources.BACKUP),
  createFullBackup
);

/**
 * POST /api/backup/schedule
 * Schedule automatic backup
 */
router.post(
  '/schedule',
  requirePermission('backup:schedule'),
  validateBody(scheduleBackupSchema),
  auditLog(AuditActions.BACKUP_CREATE, AuditResources.BACKUP),
  scheduleBackup
);

/**
 * POST /api/backup/restore/:backupId
 * Restore from backup
 */
router.post(
  '/restore/:backupId',
  requirePermission('backup:restore'),
  validateParams(restoreBackupIdSchema),
  auditLog(AuditActions.BACKUP_RESTORE, AuditResources.BACKUP),
  restoreFromBackup
);

/**
 * DELETE /api/backup/backups/:id
 * Delete backup
 */
router.delete(
  '/backups/:id',
  requirePermission('backup:delete'),
  validateParams(backupIdSchema),
  auditLog(AuditActions.BACKUP_DELETE, AuditResources.BACKUP),
  deleteBackup
);

export { router as backupRouter };
