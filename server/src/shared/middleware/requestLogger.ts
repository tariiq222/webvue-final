/**
 * 📊 Request Logger Middleware
 * مسجل الطلبات
 * 
 * Middleware to log HTTP requests with timing and user information.
 */

import { Request, Response, NextFunction } from 'express';
import { logRequest } from '@/shared/utils/logger';

/**
 * Request logging middleware
 * وسطية تسجيل الطلبات
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Use res.on('finish') instead of overriding res.end
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logRequest(req, res, duration);
  });

  next();
};
