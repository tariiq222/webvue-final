/**
 * 👤 Profile Controller
 * متحكم الملف الشخصي
 * 
 * HTTP request handlers for user profile management endpoints.
 */

import { Request, Response } from 'express';
import { ProfileService } from '../services/profileService';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { sendSuccess, sendDeleted, sendPaginatedResponse } from '@/shared/utils/response';

const profileService = new ProfileService();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get user profile
 *     description: Retrieve current user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const profile = await profileService.getProfile(userId);
  sendSuccess(res, { profile }, 'Profile retrieved successfully');
});

/**
 * @swagger
 * /api/profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update user profile
 *     description: Update current user's profile information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               username:
 *                 type: string
 *                 example: johndoe
 *               avatar:
 *                 type: string
 *                 example: /uploads/avatars/avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or username already exists
 *       401:
 *         description: Authentication required
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const profile = await profileService.updateProfile(userId, req.body);
  sendSuccess(res, { profile }, 'Profile updated successfully');
});

/**
 * @swagger
 * /api/profile/password:
 *   put:
 *     tags: [Profile]
 *     summary: Change password
 *     description: Change current user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: CurrentPass123
 *               newPassword:
 *                 type: string
 *                 example: NewSecurePass123!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or weak new password
 *       401:
 *         description: Authentication required
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await profileService.changePassword(userId, req.body);
  sendSuccess(res, undefined, 'Password changed successfully');
});

/**
 * @swagger
 * /api/profile/avatar:
 *   post:
 *     tags: [Profile]
 *     summary: Upload avatar
 *     description: Upload profile avatar image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file or file too large
 *       401:
 *         description: Authentication required
 */
export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  
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

  const result = await profileService.uploadAvatar(userId, req.file);
  sendSuccess(res, result, 'Avatar uploaded successfully');
});

/**
 * @swagger
 * /api/profile/delete:
 *   delete:
 *     tags: [Profile]
 *     summary: Delete account
 *     description: Delete current user's account permanently
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: MyPassword123
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       400:
 *         description: Invalid password or cannot delete last admin
 *       401:
 *         description: Authentication required
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { password } = req.body;
  await profileService.deleteAccount(userId, password);
  sendDeleted(res, 'Account deleted successfully');
});

/**
 * @swagger
 * /api/profile/activity:
 *   get:
 *     tags: [Profile]
 *     summary: Get activity log
 *     description: Retrieve current user's activity log
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
 *     responses:
 *       200:
 *         description: Activity log retrieved successfully
 *       401:
 *         description: Authentication required
 */
export const getActivityLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await profileService.getActivityLog(userId, req.query);
  sendPaginatedResponse(res, result.activities, result.pagination, 'Activity log retrieved successfully');
});

/**
 * @swagger
 * /api/profile/sessions:
 *   get:
 *     tags: [Profile]
 *     summary: Get user sessions
 *     description: Retrieve current user's active sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *       401:
 *         description: Authentication required
 */
export const getSessions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const sessions = await profileService.getSessions(userId);
  sendSuccess(res, { sessions }, 'Sessions retrieved successfully');
});

/**
 * @swagger
 * /api/profile/sessions/{sessionId}:
 *   delete:
 *     tags: [Profile]
 *     summary: Revoke session
 *     description: Revoke a specific user session
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *       404:
 *         description: Session not found
 *       401:
 *         description: Authentication required
 */
export const revokeSession = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { sessionId } = req.params;
  await profileService.revokeSession(userId, sessionId);
  sendSuccess(res, undefined, 'Session revoked successfully');
});

/**
 * @swagger
 * /api/profile/sessions:
 *   delete:
 *     tags: [Profile]
 *     summary: Revoke all sessions
 *     description: Revoke all user sessions (logout from all devices)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions revoked successfully
 *       401:
 *         description: Authentication required
 */
export const revokeAllSessions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await profileService.revokeAllSessions(userId);
  sendSuccess(res, undefined, 'All sessions revoked successfully');
});
