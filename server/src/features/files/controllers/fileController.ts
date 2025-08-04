/**
 * 📁 File Controller
 * متحكم الملفات
 * 
 * HTTP request handlers for file management endpoints.
 */

import { Request, Response } from 'express';
import { FileService } from '../services/fileService';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { sendSuccess, sendCreated, sendDeleted, sendPaginatedResponse } from '@/shared/utils/response';

const fileService = new FileService();

/**
 * @swagger
 * /api/files:
 *   get:
 *     tags: [Files]
 *     summary: Get files
 *     description: Retrieve files with pagination and filtering
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filename
 *       - in: query
 *         name: mimetype
 *         schema:
 *           type: string
 *         description: Filter by mimetype
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by uploader (admin only)
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getFiles = asyncHandler(async (req: Request, res: Response) => {
  const result = await fileService.getFiles(req.query);
  sendPaginatedResponse(res, result.data, result.pagination, result.message);
});

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Get file by ID
 *     description: Retrieve a specific file by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File retrieved successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Authentication required
 */
export const getFileById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = await fileService.getFileById(id);
  sendSuccess(res, { file }, 'File retrieved successfully');
});

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Upload file
 *     description: Upload a single file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               category:
 *                 type: string
 *                 description: File category (optional)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or file too large
 *       409:
 *         description: Duplicate file
 *       401:
 *         description: Authentication required
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'No file uploaded',
        code: 'NO_FILE_UPLOADED',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      },
    });
  }

  const uploadedBy = req.user!.id;
  const { category } = req.body;
  const file = await fileService.uploadFile(req.file, uploadedBy, category);
  sendCreated(res, { file }, 'File uploaded successfully');
});

/**
 * @swagger
 * /api/files/upload-multiple:
 *   post:
 *     tags: [Files]
 *     summary: Upload multiple files
 *     description: Upload multiple files at once
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload
 *               category:
 *                 type: string
 *                 description: File category (optional)
 *     responses:
 *       200:
 *         description: Files upload completed
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Authentication required
 */
export const uploadMultipleFiles = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'No files uploaded',
        code: 'NO_FILES_UPLOADED',
        statusCode: 400,
        timestamp: new Date().toISOString(),
      },
    });
  }

  const uploadedBy = req.user!.id;
  const { category } = req.body;
  const result = await fileService.uploadMultipleFiles(req.files, uploadedBy, category);
  sendSuccess(res, result, 'Files upload completed');
});

/**
 * @swagger
 * /api/files/{id}:
 *   put:
 *     tags: [Files]
 *     summary: Update file metadata
 *     description: Update file metadata
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalName:
 *                 type: string
 *                 example: document.pdf
 *               category:
 *                 type: string
 *                 example: document
 *               description:
 *                 type: string
 *                 example: Important document
 *     responses:
 *       200:
 *         description: File updated successfully
 *       404:
 *         description: File not found
 *       403:
 *         description: Access denied
 *       401:
 *         description: Authentication required
 */
export const updateFile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const file = await fileService.updateFile(id, req.body, userId);
  sendSuccess(res, { file }, 'File updated successfully');
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     tags: [Files]
 *     summary: Delete file
 *     description: Delete a file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       403:
 *         description: Access denied
 *       401:
 *         description: Authentication required
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  await fileService.deleteFile(id, userId);
  sendDeleted(res, 'File deleted successfully');
});

/**
 * @swagger
 * /api/files/stats:
 *   get:
 *     tags: [Files]
 *     summary: Get file statistics
 *     description: Retrieve file statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Get stats for specific user (admin only)
 *     responses:
 *       200:
 *         description: File statistics retrieved successfully
 *       401:
 *         description: Authentication required
 */
export const getFileStats = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.query;
  const stats = await fileService.getFileStats(userId as string);
  sendSuccess(res, { stats }, 'File statistics retrieved successfully');
});
