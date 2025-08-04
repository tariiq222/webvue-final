/**
 * 🔐 Authentication Routes
 * مسارات المصادقة
 * 
 * Express routes for authentication endpoints.
 */

import { Router } from 'express';
import {
  login,
  register,
  refreshToken,
  logout,
  getCurrentUser,
  setup2FA,
  enable2FA,
  disable2FA,
} from '../controllers/authController';
import { authenticate } from '@/shared/middleware/auth';
import { authRateLimiter } from '@/shared/middleware/rateLimiter';
import { validateBody } from '@/shared/middleware/validation';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  logoutSchema,
  enable2FASchema,
  disable2FASchema,
} from '../validation/authValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

// Public routes (no authentication required)
router.post('/login', authRateLimiter, validateBody(loginSchema), login);
router.post('/register', authRateLimiter, validateBody(registerSchema), register);
router.post('/refresh', validateBody(refreshTokenSchema), refreshToken);

// Protected routes (authentication required)
router.use(authenticate);

router.post('/logout', validateBody(logoutSchema), logout);
router.get('/me', getCurrentUser);

// 2FA routes
router.post('/2fa/setup', setup2FA);
router.post('/2fa/enable', validateBody(enable2FASchema), enable2FA);
router.post('/2fa/disable', validateBody(disable2FASchema), disable2FA);

export { router as authRouter };
