/**
 * 🔐 Authentication Controller
 * متحكم المصادقة
 * 
 * HTTP request handlers for authentication endpoints.
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';

const authService = new AuthService();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: User login
 *     description: Authenticate user with email/username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@webcore.dev
 *               password:
 *                 type: string
 *                 example: password123
 *               twoFactorCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, twoFactorCode } = req.body;
  const ipAddress = req.ip || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  const result = await authService.login(
    { email, password, twoFactorCode },
    ipAddress,
    userAgent
  );

  if (result.requiresTwoFactor) {
    return res.status(200).json({
      success: true,
      message: '2FA code required',
      data: {
        requiresTwoFactor: true,
        user: result.user,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      tokens: result.tokens,
    },
  });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: User registration
 *     description: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email or username already exists
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password, firstName, lastName } = req.body;

  const user = await authService.register({
    email,
    username,
    password,
    firstName,
    lastName,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user },
  });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const tokens = await authService.refreshToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: { tokens },
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: User logout
 *     description: Logout user and invalidate refresh token
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  await authService.logout(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user
 *     description: Get current authenticated user information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Authentication required
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'User information retrieved successfully',
    data: { user: req.user },
  });
});

/**
 * @swagger
 * /api/auth/2fa/setup:
 *   post:
 *     tags: [Authentication]
 *     summary: Setup 2FA
 *     description: Generate 2FA secret and QR code for setup
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup data generated successfully
 *       400:
 *         description: 2FA already enabled
 */
export const setup2FA = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const setupData = await authService.setup2FA(userId);

  res.status(200).json({
    success: true,
    message: '2FA setup data generated successfully',
    data: setupData,
  });
});

/**
 * @swagger
 * /api/auth/2fa/enable:
 *   post:
 *     tags: [Authentication]
 *     summary: Enable 2FA
 *     description: Enable 2FA for the current user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - secret
 *               - token
 *             properties:
 *               secret:
 *                 type: string
 *                 example: JBSWY3DPEHPK3PXP
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid token or 2FA already enabled
 */
export const enable2FA = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { secret, token } = req.body;

  await authService.enable2FA(userId, secret, token);

  res.status(200).json({
    success: true,
    message: '2FA enabled successfully',
  });
});

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     tags: [Authentication]
 *     summary: Disable 2FA
 *     description: Disable 2FA for the current user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid token or 2FA not enabled
 */
export const disable2FA = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { token } = req.body;

  await authService.disable2FA(userId, token);

  res.status(200).json({
    success: true,
    message: '2FA disabled successfully',
  });
});
