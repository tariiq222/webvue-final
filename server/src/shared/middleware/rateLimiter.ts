/**
 * 🚦 Rate Limiter Middleware
 * محدد معدل الطلبات
 * 
 * Rate limiting middleware to prevent abuse and protect the API.
 */

import rateLimit from 'express-rate-limit';
import { config } from '@/config/environment';
import { logger } from '@/shared/utils/logger';

/**
 * General rate limiter
 * محدد المعدل العام
 */
export const rateLimiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs, // 15 minutes
  max: config.security.rateLimit.maxRequests, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      },
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * محدد معدل صارم لنقاط المصادقة
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts, please try again later',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      },
    });
  },
});

/**
 * Upload rate limiter
 * محدد معدل الرفع
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    success: false,
    error: {
      message: 'Too many upload attempts, please try again later',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      error: {
        message: 'Too many upload attempts, please try again later',
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        statusCode: 429,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      },
    });
  },
});
