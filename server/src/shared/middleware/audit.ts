/**
 * 📊 Audit Middleware
 * وسطية التدقيق
 * 
 * Middleware for logging user actions and system events for audit purposes.
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/database/connection';
import { logger } from '@/shared/utils/logger';
import { asyncHandler } from './errorHandler';

/**
 * Audit log middleware
 * وسطية سجل التدقيق
 */
export const auditLog = (action: string, resource: string) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json to capture response
    const originalJson = res.json;
    let responseData: any;

    res.json = function(data: any) {
      responseData = data;
      return originalJson.call(this, data);
    };

    // Store original res.end to capture when response is sent
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      // Log the audit entry after response is sent
      setImmediate(async () => {
        try {
          await logAuditEntry(req, res, action, resource, responseData);
        } catch (error) {
          logger.error('Failed to log audit entry', { error });
        }
      });

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  });
};

/**
 * Log audit entry to database
 * تسجيل إدخال التدقيق في قاعدة البيانات
 */
async function logAuditEntry(
  req: Request,
  res: Response,
  action: string,
  resource: string,
  responseData: any
): Promise<void> {
  try {
    const userId = req.user?.id || null;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    // Extract resource ID from params or body
    const resourceId = req.params.id || req.body.id || null;
    
    // Prepare audit details
    const details: any = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      requestBody: sanitizeRequestBody(req.body),
      requestParams: req.params,
      requestQuery: req.query,
    };

    // Add response data if successful
    if (res.statusCode >= 200 && res.statusCode < 300 && responseData) {
      details.responseData = sanitizeResponseData(responseData);
    }

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
      },
    });

    logger.debug('Audit entry logged', {
      userId,
      action,
      resource,
      resourceId,
      statusCode: res.statusCode,
    });
  } catch (error) {
    logger.error('Failed to create audit log entry', { error });
  }
}

/**
 * Sanitize request body for logging
 * تنظيف جسم الطلب للتسجيل
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'currentPassword',
    'newPassword',
    'confirmPassword',
    'token',
    'refreshToken',
    'accessToken',
    'secret',
    'twoFactorSecret',
    'apiKey',
    'privateKey',
  ];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Sanitize response data for logging
 * تنظيف بيانات الاستجابة للتسجيل
 */
function sanitizeResponseData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Remove sensitive fields from response
  const sensitiveFields = [
    'password',
    'token',
    'refreshToken',
    'accessToken',
    'secret',
    'twoFactorSecret',
    'apiKey',
    'privateKey',
  ];

  function removeSensitiveFields(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(removeSensitiveFields);
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned = { ...obj };
      sensitiveFields.forEach(field => {
        if (cleaned[field]) {
          cleaned[field] = '[REDACTED]';
        }
      });
      
      // Recursively clean nested objects
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] && typeof cleaned[key] === 'object') {
          cleaned[key] = removeSensitiveFields(cleaned[key]);
        }
      });
      
      return cleaned;
    }
    
    return obj;
  }

  return removeSensitiveFields(sanitized);
}

/**
 * Audit actions enum
 * تعداد إجراءات التدقيق
 */
export const AuditActions = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  TWO_FA_ENABLE: 'two_fa_enable',
  TWO_FA_DISABLE: 'two_fa_disable',

  // User Management
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_ACTIVATE: 'user_activate',
  USER_DEACTIVATE: 'user_deactivate',

  // Role Management
  ROLE_CREATE: 'role_create',
  ROLE_UPDATE: 'role_update',
  ROLE_DELETE: 'role_delete',
  ROLE_ASSIGN: 'role_assign',
  ROLE_REVOKE: 'role_revoke',

  // Plugin Management
  PLUGIN_INSTALL: 'plugin_install',
  PLUGIN_UNINSTALL: 'plugin_uninstall',
  PLUGIN_ACTIVATE: 'plugin_activate',
  PLUGIN_DEACTIVATE: 'plugin_deactivate',
  PLUGIN_UPDATE: 'plugin_update',

  // Settings Management
  SETTING_CREATE: 'setting_create',
  SETTING_UPDATE: 'setting_update',
  SETTING_DELETE: 'setting_delete',

  // File Management
  FILE_UPLOAD: 'file_upload',
  FILE_DELETE: 'file_delete',

  // System
  SYSTEM_BACKUP: 'system_backup',
  SYSTEM_RESTORE: 'system_restore',
  SYSTEM_MAINTENANCE: 'system_maintenance',
} as const;

/**
 * Audit resources enum
 * تعداد موارد التدقيق
 */
export const AuditResources = {
  AUTH: 'auth',
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  PLUGIN: 'plugin',
  SETTING: 'setting',
  NOTIFICATION: 'notification',
  FILE: 'file',
  SYSTEM: 'system',
} as const;
