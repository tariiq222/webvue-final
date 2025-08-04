/**
 * 🛡️ Security Middleware
 * وسطية الأمان
 * 
 * Additional security middleware for input sanitization,
 * XSS protection, and other security measures.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { logger } from '@/shared/utils/logger';

/**
 * Input sanitization middleware
 * وسطية تنظيف المدخلات
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Sanitize object recursively
 * تنظيف الكائن بشكل تكراري
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
}

/**
 * Sanitize string input
 * تنظيف المدخلات النصية
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }

  // Remove potential XSS patterns
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Content Security Policy middleware
 * وسطية سياسة أمان المحتوى
 */
export const contentSecurityPolicy = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  next();
};

/**
 * Request size limiter
 * محدد حجم الطلب
 */
export const requestSizeLimiter = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    
    if (contentLength > maxSize) {
      throw new AppError(
        `Request too large. Maximum size is ${maxSize} bytes`,
        413,
        'REQUEST_TOO_LARGE'
      );
    }
    
    next();
  };
};

/**
 * IP whitelist middleware
 * وسطية القائمة البيضاء للعناوين
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!allowedIPs.includes(clientIP)) {
      logger.warn('Access denied for IP', { ip: clientIP });
      throw new AppError('Access denied', 403, 'IP_NOT_ALLOWED');
    }
    
    next();
  };
};

/**
 * User agent validation
 * التحقق من وكيل المستخدم
 */
export const validateUserAgent = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.get('User-Agent');
  
  if (!userAgent) {
    throw new AppError('User-Agent header is required', 400, 'USER_AGENT_REQUIRED');
  }

  // Block known malicious user agents
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /burp/i,
    /nmap/i,
    /masscan/i,
    /zap/i,
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(userAgent)) {
      logger.warn('Malicious user agent detected', { userAgent, ip: req.ip });
      throw new AppError('Access denied', 403, 'MALICIOUS_USER_AGENT');
    }
  }

  next();
};

/**
 * Request method validation
 * التحقق من طريقة الطلب
 */
export const validateRequestMethod = (allowedMethods: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!allowedMethods.includes(req.method)) {
      throw new AppError(
        `Method ${req.method} not allowed`,
        405,
        'METHOD_NOT_ALLOWED'
      );
    }
    next();
  };
};

/**
 * Prevent parameter pollution
 * منع تلوث المعاملات
 */
export const preventParameterPollution = (req: Request, res: Response, next: NextFunction): void => {
  // Check for duplicate parameters in query string
  const url = new URL(req.url, `http://${req.get('host')}`);
  const params = new URLSearchParams(url.search);
  const paramCounts: { [key: string]: number } = {};

  for (const [key] of params) {
    paramCounts[key] = (paramCounts[key] || 0) + 1;
  }

  for (const [key, count] of Object.entries(paramCounts)) {
    if (count > 1) {
      logger.warn('Parameter pollution detected', { parameter: key, count, ip: req.ip });
      throw new AppError(
        `Duplicate parameter detected: ${key}`,
        400,
        'PARAMETER_POLLUTION'
      );
    }
  }

  next();
};

/**
 * Request timeout middleware
 * وسطية انتهاء مهلة الطلب
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout', { url: req.url, method: req.method, ip: req.ip });
        res.status(408).json({
          success: false,
          error: {
            message: 'Request timeout',
            code: 'REQUEST_TIMEOUT',
            statusCode: 408,
            timestamp: new Date().toISOString(),
          },
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * Security headers middleware
 * وسطية رؤوس الأمان
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};
