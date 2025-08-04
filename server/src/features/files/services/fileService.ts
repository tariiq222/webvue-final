/**
 * 📁 File Service
 * خدمة الملفات
 * 
 * Business logic for file management operations including upload,
 * download, organization, and security.
 */

import { prisma } from '@/database/connection';
import { AppError } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';
import { config } from '@/config/environment';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import crypto from 'crypto';
import sharp from 'sharp';
import {
  calculatePagination,
  getPaginationOffset,
  getPrismaSearchFilter,
  getPrismaSortOptions,
} from '@/shared/utils/pagination';
import { UploadedFile, CreateFileData, UpdateFileData, PaginationParams, PaginatedResponse } from '@/shared/types';

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);

export class FileService {
  private uploadPath = config.upload.path;
  private maxFileSize = config.upload.maxFileSize;
  private allowedTypes = config.upload.allowedTypes;

  /**
   * Get files with pagination and filtering
   * الحصول على الملفات مع التصفح والتصفية
   */
  async getFiles(params: PaginationParams & {
    userId?: string;
    mimetype?: string;
    category?: string;
  }): Promise<PaginatedResponse<UploadedFile>> {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      search,
      userId,
      mimetype,
      category,
    } = params;

    // Build where clause
    const where: any = {
      ...getPrismaSearchFilter(search, ['originalName', 'filename']),
    };

    if (userId) {
      where.uploadedBy = userId;
    }

    if (mimetype) {
      where.mimetype = { contains: mimetype };
    }

    if (category) {
      where.category = category;
    }

    // Get total count
    const total = await prisma.uploadedFile.count({ where });

    // Get files with pagination
    const files = await prisma.uploadedFile.findMany({
      where,
      include: {
        uploader: {
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
      data: files,
      pagination,
      message: 'Files retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get file by ID
   * الحصول على ملف بالمعرف
   */
  async getFileById(id: string): Promise<UploadedFile> {
    const file = await prisma.uploadedFile.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    return file;
  }

  /**
   * Upload file
   * رفع ملف
   */
  async uploadFile(file: Express.Multer.File, uploadedBy: string, category?: string): Promise<UploadedFile> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate file hash for duplicate detection
      const fileHash = await this.generateFileHash(file.path);

      // Check for duplicate files
      const existingFile = await prisma.uploadedFile.findFirst({
        where: { hash: fileHash },
      });

      if (existingFile) {
        // Remove uploaded file since it's a duplicate
        await unlinkAsync(file.path);
        throw new AppError('File already exists', 409, 'DUPLICATE_FILE');
      }

      // Generate secure filename
      const secureFilename = this.generateSecureFilename(file.originalname);
      const finalPath = path.join(this.uploadPath, secureFilename);

      // Move file to final location
      fs.renameSync(file.path, finalPath);

      // Generate thumbnail for images
      let thumbnailUrl: string | null = null;
      if (this.isImage(file.mimetype)) {
        thumbnailUrl = await this.generateThumbnail(finalPath, secureFilename);
      }

      // Create file record
      const uploadedFile = await prisma.uploadedFile.create({
        data: {
          originalName: file.originalname,
          filename: secureFilename,
          mimetype: file.mimetype,
          size: file.size,
          path: finalPath,
          url: `/uploads/${secureFilename}`,
          thumbnailUrl,
          hash: fileHash,
          category: category || this.categorizeFile(file.mimetype),
          uploadedBy,
        },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      logger.info('File uploaded successfully', {
        fileId: uploadedFile.id,
        filename: uploadedFile.filename,
        size: uploadedFile.size,
        uploadedBy,
      });

      return uploadedFile;
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(file.path)) {
        await unlinkAsync(file.path);
      }
      throw error;
    }
  }

  /**
   * Upload multiple files
   * رفع ملفات متعددة
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[], 
    uploadedBy: string, 
    category?: string
  ): Promise<{ uploaded: UploadedFile[]; failed: Array<{ filename: string; error: string }> }> {
    const uploaded: UploadedFile[] = [];
    const failed: Array<{ filename: string; error: string }> = [];

    for (const file of files) {
      try {
        const uploadedFile = await this.uploadFile(file, uploadedBy, category);
        uploaded.push(uploadedFile);
      } catch (error) {
        failed.push({
          filename: file.originalname,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info('Multiple files upload completed', {
      uploaded: uploaded.length,
      failed: failed.length,
      total: files.length,
      uploadedBy,
    });

    return { uploaded, failed };
  }

  /**
   * Update file metadata
   * تحديث بيانات الملف الوصفية
   */
  async updateFile(id: string, updateData: UpdateFileData, userId: string): Promise<UploadedFile> {
    const file = await prisma.uploadedFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    // Check if user owns the file or has admin permissions
    if (file.uploadedBy !== userId) {
      // This would check for admin permissions in a real implementation
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    const updatedFile = await prisma.uploadedFile.update({
      where: { id },
      data: updateData,
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info('File metadata updated', {
      fileId: id,
      updatedFields: Object.keys(updateData),
      userId,
    });

    return updatedFile;
  }

  /**
   * Delete file
   * حذف الملف
   */
  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await prisma.uploadedFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    // Check if user owns the file or has admin permissions
    if (file.uploadedBy !== userId) {
      // This would check for admin permissions in a real implementation
      throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      await unlinkAsync(file.path);
    }

    // Delete thumbnail if exists
    if (file.thumbnailUrl) {
      const thumbnailPath = path.join(this.uploadPath, 'thumbnails', path.basename(file.thumbnailUrl));
      if (fs.existsSync(thumbnailPath)) {
        await unlinkAsync(thumbnailPath);
      }
    }

    // Delete file record
    await prisma.uploadedFile.delete({
      where: { id },
    });

    logger.info('File deleted successfully', {
      fileId: id,
      filename: file.filename,
      userId,
    });
  }

  /**
   * Get file statistics
   * الحصول على إحصائيات الملفات
   */
  async getFileStats(userId?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: Array<{ category: string; count: number; size: number }>;
    byMimetype: Array<{ mimetype: string; count: number }>;
  }> {
    const where = userId ? { uploadedBy: userId } : {};

    const [
      totalFiles,
      totalSizeResult,
      byCategory,
      byMimetype,
    ] = await Promise.all([
      prisma.uploadedFile.count({ where }),
      prisma.uploadedFile.aggregate({
        where,
        _sum: { size: true },
      }),
      prisma.uploadedFile.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
        _sum: { size: true },
      }),
      prisma.uploadedFile.groupBy({
        by: ['mimetype'],
        where,
        _count: { mimetype: true },
      }),
    ]);

    return {
      totalFiles,
      totalSize: totalSizeResult._sum.size || 0,
      byCategory: byCategory.map(item => ({
        category: item.category,
        count: item._count.category,
        size: item._sum.size || 0,
      })),
      byMimetype: byMimetype.map(item => ({
        mimetype: item.mimetype,
        count: item._count.mimetype,
      })),
    };
  }

  /**
   * Validate uploaded file
   * التحقق من صحة الملف المرفوع
   */
  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new AppError(
        `File size exceeds maximum allowed size of ${this.maxFileSize} bytes`,
        400,
        'FILE_TOO_LARGE'
      );
    }

    // Check file type
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new AppError(
        `File type ${file.mimetype} is not allowed`,
        400,
        'INVALID_FILE_TYPE'
      );
    }
  }

  /**
   * Generate file hash for duplicate detection
   * توليد هاش الملف لاكتشاف التكرار
   */
  private async generateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Generate secure filename
   * توليد اسم ملف آمن
   */
  private generateSecureFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Check if file is an image
   * فحص ما إذا كان الملف صورة
   */
  private isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  /**
   * Generate thumbnail for images
   * توليد صورة مصغرة للصور
   */
  private async generateThumbnail(filePath: string, filename: string): Promise<string> {
    try {
      const thumbnailDir = path.join(this.uploadPath, 'thumbnails');
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }

      const thumbnailFilename = `thumb_${filename}`;
      const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

      await sharp(filePath)
        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return `/uploads/thumbnails/${thumbnailFilename}`;
    } catch (error) {
      logger.error('Failed to generate thumbnail', { filePath, error });
      return null;
    }
  }

  /**
   * Categorize file based on mimetype
   * تصنيف الملف حسب نوع MIME
   */
  private categorizeFile(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('pdf')) return 'document';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'spreadsheet';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'presentation';
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar')) return 'archive';
    return 'other';
  }
}
