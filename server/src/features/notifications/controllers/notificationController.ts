/**
 * 🔔 Notification Controller
 * متحكم الإشعارات
 * 
 * HTTP request handlers for notification management endpoints.
 */

import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { sendSuccess, sendCreated, sendDeleted, sendPaginatedResponse } from '@/shared/utils/response';

const notificationService = new NotificationService();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     description: Retrieve current user's notifications with pagination and filtering
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
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Authentication required
 */
export const getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await notificationService.getUserNotifications(userId, req.query);
  sendPaginatedResponse(res, result.data, result.pagination, result.message);
});

/**
 * @swagger
 * /api/notifications/all:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notifications (admin)
 *     description: Retrieve all notifications with pagination and filtering (admin only)
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
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.getAllNotifications(req.query);
  sendPaginatedResponse(res, result.data, result.pagination, result.message);
});

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Create notification
 *     description: Create a new notification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user-id-123
 *               title:
 *                 type: string
 *                 example: Welcome to WebCore
 *               message:
 *                 type: string
 *                 example: Thank you for joining our platform
 *               type:
 *                 type: string
 *                 example: welcome
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: medium
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["in_app", "email"]
 *               data:
 *                 type: object
 *                 example: {}
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-25T10:00:00Z
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const senderId = req.user!.id;
  const notification = await notificationService.createNotification({
    ...req.body,
    senderId,
  });
  sendCreated(res, { notification }, 'Notification created successfully');
});

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     tags: [Notifications]
 *     summary: Create bulk notifications
 *     description: Create notifications for multiple users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - title
 *               - message
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user-1", "user-2", "user-3"]
 *               title:
 *                 type: string
 *                 example: System Maintenance
 *               message:
 *                 type: string
 *                 example: System will be under maintenance tonight
 *               type:
 *                 type: string
 *                 example: system
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: high
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["in_app", "email"]
 *     responses:
 *       200:
 *         description: Bulk notifications created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const createBulkNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { userIds, ...notificationData } = req.body;
  const senderId = req.user!.id;
  const result = await notificationService.createBulkNotifications(userIds, {
    ...notificationData,
    senderId,
  });
  sendSuccess(res, result, 'Bulk notifications created successfully');
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Authentication required
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const notification = await notificationService.markAsRead(id, userId);
  sendSuccess(res, { notification }, 'Notification marked as read');
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     description: Mark all user notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Authentication required
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await notificationService.markAllAsRead(userId);
  sendSuccess(res, result, 'All notifications marked as read');
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     description: Delete a specific notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       401:
 *         description: Authentication required
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  await notificationService.deleteNotification(id, userId);
  sendDeleted(res, 'Notification deleted successfully');
});

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification statistics
 *     description: Retrieve notification statistics for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification statistics retrieved successfully
 *       401:
 *         description: Authentication required
 */
export const getNotificationStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const stats = await notificationService.getUserNotificationStats(userId);
  sendSuccess(res, { stats }, 'Notification statistics retrieved successfully');
});
