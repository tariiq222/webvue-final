/**
 * 📤 Response Utilities
 * أدوات الاستجابة
 * 
 * Standardized response formatting utilities for consistent API responses.
 */

import { Response } from 'express';
import { BaseResponse, PaginatedResponse, PaginationMeta } from '@/shared/types';

/**
 * Send success response
 * إرسال استجابة نجاح
 */
export function sendSuccess<T>(
  res: Response,
  data?: T,
  message: string = 'Operation successful',
  statusCode: number = 200
): void {
  const response: BaseResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

/**
 * Send paginated response
 * إرسال استجابة مُصفحة
 */
export function sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message: string = 'Data retrieved successfully',
  statusCode: number = 200
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    message,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

/**
 * Send created response
 * إرسال استجابة الإنشاء
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void {
  sendSuccess(res, data, message, 201);
}

/**
 * Send updated response
 * إرسال استجابة التحديث
 */
export function sendUpdated<T>(
  res: Response,
  data: T,
  message: string = 'Resource updated successfully'
): void {
  sendSuccess(res, data, message, 200);
}

/**
 * Send deleted response
 * إرسال استجابة الحذف
 */
export function sendDeleted(
  res: Response,
  message: string = 'Resource deleted successfully'
): void {
  sendSuccess(res, undefined, message, 200);
}

/**
 * Send no content response
 * إرسال استجابة بدون محتوى
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}

/**
 * Send error response
 * إرسال استجابة خطأ
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): void {
  const response = {
    success: false,
    error: {
      message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      details,
    },
  };

  res.status(statusCode).json(response);
}

/**
 * Send validation error response
 * إرسال استجابة خطأ التحقق
 */
export function sendValidationError(
  res: Response,
  errors: string[],
  message: string = 'Validation failed'
): void {
  sendError(res, message, 400, 'VALIDATION_ERROR', errors);
}

/**
 * Send unauthorized response
 * إرسال استجابة عدم التفويض
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized access'
): void {
  sendError(res, message, 401, 'UNAUTHORIZED');
}

/**
 * Send forbidden response
 * إرسال استجابة الحظر
 */
export function sendForbidden(
  res: Response,
  message: string = 'Access forbidden'
): void {
  sendError(res, message, 403, 'FORBIDDEN');
}

/**
 * Send not found response
 * إرسال استجابة عدم الوجود
 */
export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): void {
  sendError(res, message, 404, 'NOT_FOUND');
}

/**
 * Send conflict response
 * إرسال استجابة التضارب
 */
export function sendConflict(
  res: Response,
  message: string = 'Resource conflict'
): void {
  sendError(res, message, 409, 'CONFLICT');
}

/**
 * Send too many requests response
 * إرسال استجابة كثرة الطلبات
 */
export function sendTooManyRequests(
  res: Response,
  message: string = 'Too many requests'
): void {
  sendError(res, message, 429, 'TOO_MANY_REQUESTS');
}

/**
 * Send internal server error response
 * إرسال استجابة خطأ الخادم الداخلي
 */
export function sendInternalError(
  res: Response,
  message: string = 'Internal server error'
): void {
  sendError(res, message, 500, 'INTERNAL_ERROR');
}

/**
 * Send service unavailable response
 * إرسال استجابة عدم توفر الخدمة
 */
export function sendServiceUnavailable(
  res: Response,
  message: string = 'Service temporarily unavailable'
): void {
  sendError(res, message, 503, 'SERVICE_UNAVAILABLE');
}

/**
 * Response helper class
 * فئة مساعد الاستجابة
 */
export class ResponseHelper {
  constructor(private res: Response) {}

  success<T>(data?: T, message?: string, statusCode?: number) {
    return sendSuccess(this.res, data, message, statusCode);
  }

  paginated<T>(data: T[], pagination: PaginationMeta, message?: string, statusCode?: number) {
    return sendPaginatedResponse(this.res, data, pagination, message, statusCode);
  }

  created<T>(data: T, message?: string) {
    return sendCreated(this.res, data, message);
  }

  updated<T>(data: T, message?: string) {
    return sendUpdated(this.res, data, message);
  }

  deleted(message?: string) {
    return sendDeleted(this.res, message);
  }

  noContent() {
    return sendNoContent(this.res);
  }

  error(message: string, statusCode?: number, code?: string, details?: any) {
    return sendError(this.res, message, statusCode, code, details);
  }

  validationError(errors: string[], message?: string) {
    return sendValidationError(this.res, errors, message);
  }

  unauthorized(message?: string) {
    return sendUnauthorized(this.res, message);
  }

  forbidden(message?: string) {
    return sendForbidden(this.res, message);
  }

  notFound(message?: string) {
    return sendNotFound(this.res, message);
  }

  conflict(message?: string) {
    return sendConflict(this.res, message);
  }

  tooManyRequests(message?: string) {
    return sendTooManyRequests(this.res, message);
  }

  internalError(message?: string) {
    return sendInternalError(this.res, message);
  }

  serviceUnavailable(message?: string) {
    return sendServiceUnavailable(this.res, message);
  }
}
