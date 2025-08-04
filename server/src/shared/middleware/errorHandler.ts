/**
 * ❌ Error Handler Middleware
 * معالج الأخطاء
 * 
 * Centralized error handling middleware for the WebCore application.
 * Handles all types of errors and returns appropriate responses.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/utils/logger';
import { config } from '@/config/environment';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    // Only assign code if it's defined to satisfy exactOptionalPropertyTypes
    if (code !== undefined) {
      this.code = code;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    stack?: string;
    details?: any;
  };
}

/**
 * Main error handler middleware
 * معالج الأخطاء الرئيسي
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction // Prefix with underscore to indicate intentionally unused
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code: string | undefined;
  let details: any;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    details = error.message;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
    code = 'UPLOAD_ERROR';
    details = error.message;
  }

  // Log error
  logger.error('Error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    statusCode,
    code,
  });

  // Prepare error response with proper optional property handling
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      // Only include code if it's defined to satisfy exactOptionalPropertyTypes
      ...(code !== undefined && { code }),
    },
  };

  // Include stack trace in development (only if defined)
  if (config.isDevelopment && error.stack !== undefined) {
    errorResponse.error.stack = error.stack;
  }

  // Include details if available (only if defined)
  if (details !== undefined) {
    errorResponse.error.details = details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * مُلف الأخطاء غير المتزامنة
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create validation error
 * إنشاء خطأ التحقق
 */
export const createValidationError = (message: string, details?: any): AppError => {
  const error = new AppError(message, 400, 'VALIDATION_ERROR');
  if (details) {
    (error as any).details = details;
  }
  return error;
};

/**
 * Create not found error
 * إنشاء خطأ عدم الوجود
 */
export const createNotFoundError = (resource: string): AppError => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Create unauthorized error
 * إنشاء خطأ عدم التفويض
 */
export const createUnauthorizedError = (message: string = 'Unauthorized'): AppError => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

/**
 * Create forbidden error
 * إنشاء خطأ الحظر
 */
export const createForbiddenError = (message: string = 'Forbidden'): AppError => {
  return new AppError(message, 403, 'FORBIDDEN');
};

/**
 * Create conflict error
 * إنشاء خطأ التضارب
 */
export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409, 'CONFLICT');
};

export default errorHandler;
