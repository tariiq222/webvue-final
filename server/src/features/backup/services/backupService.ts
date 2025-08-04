/**
 * 💾 Backup Service
 * خدمة النسخ الاحتياطي
 * 
 * Business logic for backup and recovery operations including
 * database backups, file backups, and system restoration.
 */

import { prisma } from '@/database/connection';
import { AppError } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';
import { config } from '@/config/environment';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import AdmZip from 'adm-zip';
import cron from 'node-cron';
import {
  calculatePagination,
  getPaginationOffset,
  getPrismaSortOptions,
} from '@/shared/utils/pagination';
import { PaginationParams, PaginatedResponse } from '@/shared/types';

const execAsync = promisify(exec);

export interface BackupRecord {
  id: string;
  type: 'database' | 'files' | 'full';
  status: 'pending' | 'running' | 'completed' | 'failed';
  size: number;
  filePath: string;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface RestoreRecord {
  id: string;
  backupId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  restoredBy: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export class BackupService {
  private backupPath = config.backup?.path || './backups';
  private scheduledBackups: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  /**
   * Get all backups with pagination
   * الحصول على جميع النسخ الاحتياطية مع التصفح
   */
  async getBackups(params: PaginationParams & {
    type?: 'database' | 'files' | 'full';
    status?: 'pending' | 'running' | 'completed' | 'failed';
  }): Promise<PaginatedResponse<BackupRecord>> {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      type,
      status,
    } = params;

    // Build where clause
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.backup.count({ where });

    // Get backups with pagination
    const backups = await prisma.backup.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: getPrismaSortOptions(sortBy, sortOrder),
      skip: getPaginationOffset(page, limit),
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);

    return {
      success: true,
      data: backups.map(this.formatBackupRecord),
      pagination,
      message: 'Backups retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create database backup
   * إنشاء نسخة احتياطية من قاعدة البيانات
   */
  async createDatabaseBackup(createdBy: string): Promise<BackupRecord> {
    const backup = await prisma.backup.create({
      data: {
        type: 'database',
        status: 'pending',
        size: 0,
        filePath: '',
        createdBy,
      },
    });

    // Start backup process asynchronously
    this.performDatabaseBackup(backup.id).catch(error => {
      logger.error('Database backup failed', { backupId: backup.id, error });
    });

    return this.formatBackupRecord(backup);
  }

  /**
   * Create files backup
   * إنشاء نسخة احتياطية من الملفات
   */
  async createFilesBackup(createdBy: string): Promise<BackupRecord> {
    const backup = await prisma.backup.create({
      data: {
        type: 'files',
        status: 'pending',
        size: 0,
        filePath: '',
        createdBy,
      },
    });

    // Start backup process asynchronously
    this.performFilesBackup(backup.id).catch(error => {
      logger.error('Files backup failed', { backupId: backup.id, error });
    });

    return this.formatBackupRecord(backup);
  }

  /**
   * Create full system backup
   * إنشاء نسخة احتياطية كاملة للنظام
   */
  async createFullBackup(createdBy: string): Promise<BackupRecord> {
    const backup = await prisma.backup.create({
      data: {
        type: 'full',
        status: 'pending',
        size: 0,
        filePath: '',
        createdBy,
      },
    });

    // Start backup process asynchronously
    this.performFullBackup(backup.id).catch(error => {
      logger.error('Full backup failed', { backupId: backup.id, error });
    });

    return this.formatBackupRecord(backup);
  }

  /**
   * Restore from backup
   * الاستعادة من النسخة الاحتياطية
   */
  async restoreFromBackup(backupId: string, restoredBy: string): Promise<RestoreRecord> {
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new AppError('Backup not found', 404, 'BACKUP_NOT_FOUND');
    }

    if (backup.status !== 'completed') {
      throw new AppError('Backup is not completed', 400, 'BACKUP_NOT_COMPLETED');
    }

    if (!fs.existsSync(backup.filePath)) {
      throw new AppError('Backup file not found', 404, 'BACKUP_FILE_NOT_FOUND');
    }

    const restore = await prisma.restore.create({
      data: {
        backupId,
        status: 'pending',
        restoredBy,
      },
    });

    // Start restore process asynchronously
    this.performRestore(restore.id, backup).catch(error => {
      logger.error('Restore failed', { restoreId: restore.id, error });
    });

    return this.formatRestoreRecord(restore);
  }

  /**
   * Schedule automatic backup
   * جدولة النسخ الاحتياطي التلقائي
   */
  async scheduleBackup(schedule: {
    type: 'database' | 'files' | 'full';
    cronExpression: string;
    enabled: boolean;
    createdBy: string;
  }): Promise<{ id: string; message: string }> {
    const { type, cronExpression, enabled, createdBy } = schedule;

    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      throw new AppError('Invalid cron expression', 400, 'INVALID_CRON_EXPRESSION');
    }

    // Create schedule record
    const scheduleRecord = await prisma.backupSchedule.create({
      data: {
        type,
        cronExpression,
        enabled,
        createdBy,
      },
    });

    if (enabled) {
      this.startScheduledBackup(scheduleRecord.id, type, cronExpression, createdBy);
    }

    logger.info('Backup schedule created', {
      scheduleId: scheduleRecord.id,
      type,
      cronExpression,
      enabled,
    });

    return {
      id: scheduleRecord.id,
      message: 'Backup schedule created successfully',
    };
  }

  /**
   * Delete backup
   * حذف النسخة الاحتياطية
   */
  async deleteBackup(backupId: string): Promise<void> {
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new AppError('Backup not found', 404, 'BACKUP_NOT_FOUND');
    }

    // Delete physical file
    if (fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
    }

    // Delete backup record
    await prisma.backup.delete({
      where: { id: backupId },
    });

    logger.info('Backup deleted', { backupId });
  }

  /**
   * Get backup statistics
   * الحصول على إحصائيات النسخ الاحتياطي
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    byType: Array<{ type: string; count: number; size: number }>;
    byStatus: Array<{ status: string; count: number }>;
    lastBackup?: Date;
  }> {
    const [
      totalBackups,
      totalSizeResult,
      byType,
      byStatus,
      lastBackup,
    ] = await Promise.all([
      prisma.backup.count(),
      prisma.backup.aggregate({
        _sum: { size: true },
      }),
      prisma.backup.groupBy({
        by: ['type'],
        _count: { type: true },
        _sum: { size: true },
      }),
      prisma.backup.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.backup.findFirst({
        where: { status: 'completed' },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true },
      }),
    ]);

    return {
      totalBackups,
      totalSize: totalSizeResult._sum.size || 0,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.type,
        size: item._sum.size || 0,
      })),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      lastBackup: lastBackup?.completedAt,
    };
  }

  /**
   * Perform database backup
   * تنفيذ النسخ الاحتياطي لقاعدة البيانات
   */
  private async performDatabaseBackup(backupId: string): Promise<void> {
    try {
      await prisma.backup.update({
        where: { id: backupId },
        data: { status: 'running' },
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `database-backup-${timestamp}.sql`;
      const filePath = path.join(this.backupPath, filename);

      // Create database dump (PostgreSQL example)
      const databaseUrl = config.database.url;
      const command = `pg_dump "${databaseUrl}" > "${filePath}"`;
      
      await execAsync(command);

      // Get file size
      const stats = fs.statSync(filePath);
      const size = stats.size;

      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'completed',
          size,
          filePath,
          completedAt: new Date(),
        },
      });

      logger.info('Database backup completed', { backupId, size });
    } catch (error) {
      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Perform files backup
   * تنفيذ النسخ الاحتياطي للملفات
   */
  private async performFilesBackup(backupId: string): Promise<void> {
    try {
      await prisma.backup.update({
        where: { id: backupId },
        data: { status: 'running' },
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `files-backup-${timestamp}.zip`;
      const filePath = path.join(this.backupPath, filename);

      // Create zip archive of upload directory
      const zip = new AdmZip();
      const uploadPath = config.upload.path;

      if (fs.existsSync(uploadPath)) {
        zip.addLocalFolder(uploadPath, 'uploads');
      }

      zip.writeZip(filePath);

      // Get file size
      const stats = fs.statSync(filePath);
      const size = stats.size;

      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'completed',
          size,
          filePath,
          completedAt: new Date(),
        },
      });

      logger.info('Files backup completed', { backupId, size });
    } catch (error) {
      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Perform full system backup
   * تنفيذ النسخ الاحتياطي الكامل للنظام
   */
  private async performFullBackup(backupId: string): Promise<void> {
    try {
      await prisma.backup.update({
        where: { id: backupId },
        data: { status: 'running' },
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `full-backup-${timestamp}.zip`;
      const filePath = path.join(this.backupPath, filename);

      // Create comprehensive backup
      const zip = new AdmZip();

      // Add database dump
      const dbFilename = `database-${timestamp}.sql`;
      const dbPath = path.join(this.backupPath, dbFilename);
      const databaseUrl = config.database.url;
      await execAsync(`pg_dump "${databaseUrl}" > "${dbPath}"`);
      zip.addLocalFile(dbPath, '', 'database.sql');

      // Add files
      const uploadPath = config.upload.path;
      if (fs.existsSync(uploadPath)) {
        zip.addLocalFolder(uploadPath, 'uploads');
      }

      // Add configuration (without sensitive data)
      const configData = {
        version: process.env.npm_package_version,
        timestamp: new Date().toISOString(),
        type: 'full_backup',
      };
      zip.addFile('config.json', Buffer.from(JSON.stringify(configData, null, 2)));

      zip.writeZip(filePath);

      // Clean up temporary database file
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }

      // Get file size
      const stats = fs.statSync(filePath);
      const size = stats.size;

      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'completed',
          size,
          filePath,
          completedAt: new Date(),
        },
      });

      logger.info('Full backup completed', { backupId, size });
    } catch (error) {
      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Perform restore operation
   * تنفيذ عملية الاستعادة
   */
  private async performRestore(restoreId: string, backup: any): Promise<void> {
    try {
      await prisma.restore.update({
        where: { id: restoreId },
        data: { status: 'running' },
      });

      switch (backup.type) {
        case 'database':
          await this.restoreDatabase(backup.filePath);
          break;
        case 'files':
          await this.restoreFiles(backup.filePath);
          break;
        case 'full':
          await this.restoreFullSystem(backup.filePath);
          break;
      }

      await prisma.restore.update({
        where: { id: restoreId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });

      logger.info('Restore completed', { restoreId, backupType: backup.type });
    } catch (error) {
      await prisma.restore.update({
        where: { id: restoreId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  /**
   * Restore database from backup
   * استعادة قاعدة البيانات من النسخة الاحتياطية
   */
  private async restoreDatabase(filePath: string): Promise<void> {
    const databaseUrl = config.database.url;
    const command = `psql "${databaseUrl}" < "${filePath}"`;
    await execAsync(command);
  }

  /**
   * Restore files from backup
   * استعادة الملفات من النسخة الاحتياطية
   */
  private async restoreFiles(filePath: string): Promise<void> {
    const zip = new AdmZip(filePath);
    const uploadPath = config.upload.path;
    
    // Clear existing files
    if (fs.existsSync(uploadPath)) {
      fs.rmSync(uploadPath, { recursive: true });
    }
    
    // Extract backup
    zip.extractAllTo(path.dirname(uploadPath), true);
  }

  /**
   * Restore full system from backup
   * استعادة النظام الكامل من النسخة الاحتياطية
   */
  private async restoreFullSystem(filePath: string): Promise<void> {
    const zip = new AdmZip(filePath);
    const tempDir = path.join(this.backupPath, 'temp-restore');
    
    // Extract to temporary directory
    zip.extractAllTo(tempDir, true);
    
    // Restore database
    const dbFile = path.join(tempDir, 'database.sql');
    if (fs.existsSync(dbFile)) {
      await this.restoreDatabase(dbFile);
    }
    
    // Restore files
    const uploadsDir = path.join(tempDir, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const uploadPath = config.upload.path;
      if (fs.existsSync(uploadPath)) {
        fs.rmSync(uploadPath, { recursive: true });
      }
      fs.renameSync(uploadsDir, uploadPath);
    }
    
    // Clean up
    fs.rmSync(tempDir, { recursive: true });
  }

  /**
   * Start scheduled backup
   * بدء النسخ الاحتياطي المجدول
   */
  private startScheduledBackup(
    scheduleId: string,
    type: 'database' | 'files' | 'full',
    cronExpression: string,
    createdBy: string
  ): void {
    const task = cron.schedule(cronExpression, async () => {
      try {
        switch (type) {
          case 'database':
            await this.createDatabaseBackup(createdBy);
            break;
          case 'files':
            await this.createFilesBackup(createdBy);
            break;
          case 'full':
            await this.createFullBackup(createdBy);
            break;
        }
        logger.info('Scheduled backup completed', { scheduleId, type });
      } catch (error) {
        logger.error('Scheduled backup failed', { scheduleId, type, error });
      }
    }, { scheduled: false });

    this.scheduledBackups.set(scheduleId, task);
    task.start();

    logger.info('Scheduled backup started', { scheduleId, type, cronExpression });
  }

  /**
   * Format backup record for response
   * تنسيق سجل النسخة الاحتياطية للاستجابة
   */
  private formatBackupRecord(backup: any): BackupRecord {
    return {
      id: backup.id,
      type: backup.type,
      status: backup.status,
      size: backup.size,
      filePath: backup.filePath,
      createdBy: backup.createdBy,
      createdAt: backup.createdAt,
      completedAt: backup.completedAt,
      error: backup.error,
    };
  }

  /**
   * Format restore record for response
   * تنسيق سجل الاستعادة للاستجابة
   */
  private formatRestoreRecord(restore: any): RestoreRecord {
    return {
      id: restore.id,
      backupId: restore.backupId,
      status: restore.status,
      restoredBy: restore.restoredBy,
      createdAt: restore.createdAt,
      completedAt: restore.completedAt,
      error: restore.error,
    };
  }
}
