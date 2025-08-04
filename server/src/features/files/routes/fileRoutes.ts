/**
 * 📁 File Routes
 * مسارات الملفات
 * 
 * Express routes for file management endpoints.
 */

import { Router } from 'express';
import {
  getFiles,
  getFileById,
  uploadFile,
  uploadMultipleFiles,
  updateFile,
  deleteFile,
  getFileStats,
} from '../controllers/fileController';
import { authenticate, requirePermission } from '@/shared/middleware/auth';
import { validateBody, validateQuery, validateParams } from '@/shared/middleware/validation';
import { auditLog, AuditActions, AuditResources } from '@/shared/middleware/audit';
import { upload, validateFile, securityScan, cleanupFiles } from '@/shared/middleware/fileUpload';
import {
  fileQuerySchema,
  updateFileSchema,
  uploadFileSchema,
  fileIdSchema,
  fileStatsQuerySchema,
} from '../validation/fileValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File management operations
 */

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/files
 * Get files with pagination and filtering
 */
router.get(
  '/',
  requirePermission('files:read'),
  validateQuery(fileQuerySchema),
  auditLog(AuditActions.FILE_UPLOAD, AuditResources.FILE),
  getFiles
);

/**
 * GET /api/files/stats
 * Get file statistics
 */
router.get(
  '/stats',
  requirePermission('files:read'),
  validateQuery(fileStatsQuerySchema),
  auditLog(AuditActions.FILE_UPLOAD, AuditResources.FILE),
  getFileStats
);

/**
 * POST /api/files/upload
 * Upload single file
 */
router.post(
  '/upload',
  requirePermission('files:upload'),
  upload.single('file'),
  validateFile,
  securityScan,
  cleanupFiles,
  validateBody(uploadFileSchema),
  auditLog(AuditActions.FILE_UPLOAD, AuditResources.FILE),
  uploadFile
);

/**
 * POST /api/files/upload-multiple
 * Upload multiple files
 */
router.post(
  '/upload-multiple',
  requirePermission('files:upload'),
  upload.array('files', 10), // Maximum 10 files
  validateFile,
  securityScan,
  cleanupFiles,
  validateBody(uploadFileSchema),
  auditLog(AuditActions.FILE_UPLOAD, AuditResources.FILE),
  uploadMultipleFiles
);

/**
 * GET /api/files/:id
 * Get file by ID
 */
router.get(
  '/:id',
  requirePermission('files:read'),
  validateParams(fileIdSchema),
  auditLog(AuditActions.FILE_UPLOAD, AuditResources.FILE),
  getFileById
);

/**
 * PUT /api/files/:id
 * Update file metadata
 */
router.put(
  '/:id',
  requirePermission('files:update'),
  validateParams(fileIdSchema),
  validateBody(updateFileSchema),
  auditLog(AuditActions.FILE_UPDATE, AuditResources.FILE),
  updateFile
);

/**
 * DELETE /api/files/:id
 * Delete file
 */
router.delete(
  '/:id',
  requirePermission('files:delete'),
  validateParams(fileIdSchema),
  auditLog(AuditActions.FILE_DELETE, AuditResources.FILE),
  deleteFile
);

export { router as fileRouter };
