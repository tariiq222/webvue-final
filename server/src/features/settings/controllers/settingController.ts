/**
 * ⚙️ Setting Controller
 * متحكم الإعدادات
 * 
 * HTTP request handlers for settings management endpoints.
 */

import { Request, Response } from 'express';
import { SettingService } from '../services/settingService';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { sendSuccess, sendCreated, sendDeleted, sendPaginatedResponse } from '@/shared/utils/response';

const settingService = new SettingService();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get all settings
 *     description: Retrieve all settings with pagination and filtering
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
 *         description: Search term for key, description, or category
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filter by public/private settings
 *       - in: query
 *         name: isSystem
 *         schema:
 *           type: boolean
 *         description: Filter by system/custom settings
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const result = await settingService.getSettings(req.query);
  sendPaginatedResponse(res, result.data, result.pagination, result.message);
});

/**
 * @swagger
 * /api/settings/public:
 *   get:
 *     tags: [Settings]
 *     summary: Get public settings
 *     description: Retrieve all public settings (no authentication required)
 *     responses:
 *       200:
 *         description: Public settings retrieved successfully
 */
export const getPublicSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingService.getPublicSettings();
  sendSuccess(res, { settings }, 'Public settings retrieved successfully');
});

/**
 * @swagger
 * /api/settings/categories:
 *   get:
 *     tags: [Settings]
 *     summary: Get setting categories
 *     description: Retrieve all setting categories with counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await settingService.getCategories();
  sendSuccess(res, { categories }, 'Categories retrieved successfully');
});

/**
 * @swagger
 * /api/settings/category/{category}:
 *   get:
 *     tags: [Settings]
 *     summary: Get settings by category
 *     description: Retrieve all settings in a specific category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *     responses:
 *       200:
 *         description: Category settings retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getSettingsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const settings = await settingService.getSettingsByCategory(category);
  sendSuccess(res, { settings }, `Settings for category '${category}' retrieved successfully`);
});

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     tags: [Settings]
 *     summary: Get setting by key
 *     description: Retrieve a specific setting by its key
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *     responses:
 *       200:
 *         description: Setting retrieved successfully
 *       404:
 *         description: Setting not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getSettingByKey = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const setting = await settingService.getSettingByKey(key);
  sendSuccess(res, { setting }, 'Setting retrieved successfully');
});

/**
 * @swagger
 * /api/settings:
 *   post:
 *     tags: [Settings]
 *     summary: Create new setting
 *     description: Create a new system setting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *               - type
 *               - category
 *             properties:
 *               key:
 *                 type: string
 *                 example: app.maintenance_mode
 *               value:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: boolean
 *                   - type: object
 *                   - type: array
 *                 example: false
 *               type:
 *                 type: string
 *                 enum: [string, number, boolean, object, array]
 *                 example: boolean
 *               category:
 *                 type: string
 *                 example: application
 *               description:
 *                 type: string
 *                 example: Enable/disable maintenance mode
 *               isPublic:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Setting created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Setting key already exists
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const createSetting = asyncHandler(async (req: Request, res: Response) => {
  const createdBy = req.user?.id;
  const setting = await settingService.createSetting(req.body, createdBy);
  sendCreated(res, { setting }, 'Setting created successfully');
});

/**
 * @swagger
 * /api/settings/{key}:
 *   put:
 *     tags: [Settings]
 *     summary: Update setting
 *     description: Update an existing setting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: boolean
 *                   - type: object
 *                   - type: array
 *                 example: true
 *               description:
 *                 type: string
 *                 example: Updated description
 *               isPublic:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Setting updated successfully
 *       400:
 *         description: Validation error or system setting
 *       404:
 *         description: Setting not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const updateSetting = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  const setting = await settingService.updateSetting(key, req.body);
  sendSuccess(res, { setting }, 'Setting updated successfully');
});

/**
 * @swagger
 * /api/settings/{key}:
 *   delete:
 *     tags: [Settings]
 *     summary: Delete setting
 *     description: Delete an existing setting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *     responses:
 *       200:
 *         description: Setting deleted successfully
 *       404:
 *         description: Setting not found
 *       400:
 *         description: Cannot delete system setting
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const deleteSetting = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;
  await settingService.deleteSetting(key);
  sendDeleted(res, 'Setting deleted successfully');
});

/**
 * @swagger
 * /api/settings/bulk:
 *   put:
 *     tags: [Settings]
 *     summary: Bulk update settings
 *     description: Update multiple settings at once
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - settings
 *             properties:
 *               settings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - key
 *                     - value
 *                   properties:
 *                     key:
 *                       type: string
 *                       example: app.name
 *                     value:
 *                       oneOf:
 *                         - type: string
 *                         - type: number
 *                         - type: boolean
 *                         - type: object
 *                         - type: array
 *                       example: WebCore
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: One or more settings not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const bulkUpdateSettings = asyncHandler(async (req: Request, res: Response) => {
  const { settings } = req.body;
  await settingService.bulkUpdateSettings(settings);
  sendSuccess(res, undefined, 'Settings updated successfully');
});
