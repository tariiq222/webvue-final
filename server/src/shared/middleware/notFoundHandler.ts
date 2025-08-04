/**
 * 🚫 Not Found Handler Middleware
 * معالج عدم الوجود
 * 
 * Handles 404 errors for routes that don't exist.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/utils/logger';

/**
 * 404 Not Found handler
 * معالج عدم الوجود 404
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction // Prefix with underscore to indicate intentionally unused
): void => {
  // Log the 404 request
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send 404 response
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  });
};
