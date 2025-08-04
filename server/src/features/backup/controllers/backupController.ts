/**
 * 💾 Backup Controller
 * متحكم النسخ الاحتياطي
 * 
 * HTTP request handlers for backup and recovery endpoints.
 */

import { Request, Response } from 'express';
import { BackupService } from '../services/backupService';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { sendSuccess, sendCreated, sendDeleted, sendPaginatedResponse } from '@/shared/utils/response';

const backupService = new BackupService();

/**
 * @swagger
 * /api/backup/backups:
 *   get:
 *     tags: [Backup]
 *     summary: Get all backups
 *     description: Retrieve all backups with pagination and filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [database, files, full]
 *         description: Filter by backup type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, running, completed, failed]
 *         description: Filter by backup status
 *     responses:
 *       200:
 *         description: Backups retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getBackups = asyncHandler(async (req: Request, res: Response) => {
  const result = await backupService.getBackups(req.query);
  sendPaginatedResponse(res, result.data, result.pagination, result.message);
});

/**
 * @swagger
 * /api/backup/database:
 *   post:
 *     tags: [Backup]
 *     summary: Create database backup
 *     description: Create a backup of the database
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Database backup started successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const createDatabaseBackup = asyncHandler(async (req: Request, res: Response) => {
  const createdBy = req.user!.id;
  const backup = await backupService.createDatabaseBackup(createdBy);
  sendCreated(res, { backup }, 'Database backup started successfully');
});

/**
 * @swagger
 * /api/backup/files:
 *   post:
 *     tags: [Backup]
 *     summary: Create files backup
 *     description: Create a backup of uploaded files
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Files backup started successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const createFilesBackup = asyncHandler(async (req: Request, res: Response) => {
  const createdBy = req.user!.id;
  const backup = await backupService.createFilesBackup(createdBy);
  sendCreated(res, { backup }, 'Files backup started successfully');
});

/**
 * @swagger
 * /api/backup/full:
 *   post:
 *     tags: [Backup]
 *     summary: Create full system backup
 *     description: Create a complete backup of the system
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Full backup started successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const createFullBackup = asyncHandler(async (req: Request, res: Response) => {
  const createdBy = req.user!.id;
  const backup = await backupService.createFullBackup(createdBy);
  sendCreated(res, { backup }, 'Full backup started successfully');
});

/**
 * @swagger
 * /api/backup/restore/{backupId}:
 *   post:
 *     tags: [Backup]
 *     summary: Restore from backup
 *     description: Restore system from a backup
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: backupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Backup ID
 *     responses:
 *       201:
 *         description: Restore started successfully
 *       404:
 *         description: Backup not found
 *       400:
 *         description: Backup not completed or file not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const restoreFromBackup = asyncHandler(async (req: Request, res: Response) => {
  const { backupId } = req.params;
  const restoredBy = req.user!.id;
  const restore = await backupService.restoreFromBackup(backupId, restoredBy);
  sendCreated(res, { restore }, 'Restore started successfully');
});

/**
 * @swagger
 * /api/backup/schedule:
 *   post:
 *     tags: [Backup]
 *     summary: Schedule automatic backup
 *     description: Create a scheduled backup job
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - cronExpression
 *               - enabled
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [database, files, full]
 *                 example: database
 *               cronExpression:
 *                 type: string
 *                 example: "0 2 * * *"
 *                 description: Cron expression for scheduling
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Backup schedule created successfully
 *       400:
 *         description: Invalid cron expression
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const scheduleBackup = asyncHandler(async (req: Request, res: Response) => {
  const createdBy = req.user!.id;
  const result = await backupService.scheduleBackup({
    ...req.body,
    createdBy,
  });
  sendCreated(res, result, result.message);
});

/**
 * @swagger
 * /api/backup/backups/{id}:
 *   delete:
 *     tags: [Backup]
 *     summary: Delete backup
 *     description: Delete a backup file and record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Backup ID
 *     responses:
 *       200:
 *         description: Backup deleted successfully
 *       404:
 *         description: Backup not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const deleteBackup = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await backupService.deleteBackup(id);
  sendDeleted(res, 'Backup deleted successfully');
});

/**
 * @swagger
 * /api/backup/stats:
 *   get:
 *     tags: [Backup]
 *     summary: Get backup statistics
 *     description: Retrieve backup statistics and metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup statistics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getBackupStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await backupService.getBackupStats();
  sendSuccess(res, { stats }, 'Backup statistics retrieved successfully');
});
