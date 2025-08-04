/**
 * 🔐 JWT Utilities
 * أدوات JWT
 * 
 * JWT token generation, verification, and management utilities.
 */

import jwt from 'jsonwebtoken';
import { config } from '@/config/environment';
import { JwtPayload } from '@/shared/types';
import { AppError } from '@/shared/middleware/errorHandler';

/**
 * Generate access token
 * إنشاء رمز الوصول
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'webcore',
    audience: 'webcore-client',
  });
}

/**
 * Generate refresh token
 * إنشاء رمز التجديد
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'webcore',
      audience: 'webcore-client',
    }
  );
}

/**
 * Verify access token
 * التحقق من رمز الوصول
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'webcore',
      audience: 'webcore-client',
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
    } else {
      throw new AppError('Token verification failed', 401, 'TOKEN_VERIFICATION_FAILED');
    }
  }
}

/**
 * Verify refresh token
 * التحقق من رمز التجديد
 */
export function verifyRefreshToken(token: string): { userId: string; type: string } {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'webcore',
      audience: 'webcore-client',
    }) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 401, 'INVALID_TOKEN_TYPE');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    } else {
      throw new AppError('Refresh token verification failed', 401, 'REFRESH_TOKEN_VERIFICATION_FAILED');
    }
  }
}

/**
 * Extract token from Authorization header
 * استخراج الرمز من رأس التفويض
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Get token expiration time
 * الحصول على وقت انتهاء الرمز
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 * التحقق من انتهاء صلاحية الرمز
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }
  return expiration.getTime() < Date.now();
}

/**
 * Generate token pair (access + refresh)
 * إنشاء زوج الرموز (الوصول + التجديد)
 */
export function generateTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload.userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: getTokenExpiration(accessToken)?.getTime() || 0,
  };
}
