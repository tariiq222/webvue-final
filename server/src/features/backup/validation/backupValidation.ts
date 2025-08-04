/**
 * 🔍 Backup Validation
 * التحقق من صحة النسخ الاحتياطي
 * 
 * Joi validation schemas for backup and recovery endpoints.
 */

import Joi from 'joi';

/**
 * Backup query parameters validation schema
 * مخطط التحقق من معاملات استعلام النسخ الاحتياطية
 */
export const backupQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100',
    }),
  
  sortBy: Joi.string()
    .valid('type', 'status', 'size', 'createdAt', 'completedAt')
    .default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: type, status, size, createdAt, completedAt',
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"',
    }),
  
  type: Joi.string()
    .valid('database', 'files', 'full')
    .optional()
    .messages({
      'any.only': 'Type filter must be one of: database, files, full',
    }),
  
  status: Joi.string()
    .valid('pending', 'running', 'completed', 'failed')
    .optional()
    .messages({
      'any.only': 'Status filter must be one of: pending, running, completed, failed',
    }),
});

/**
 * Schedule backup validation schema
 * مخطط التحقق من جدولة النسخ الاحتياطي
 */
export const scheduleBackupSchema = Joi.object({
  type: Joi.string()
    .valid('database', 'files', 'full')
    .required()
    .messages({
      'any.only': 'Type must be one of: database, files, full',
      'any.required': 'Type is required',
    }),
  
  cronExpression: Joi.string()
    .pattern(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid cron expression format',
      'any.required': 'Cron expression is required',
    }),
  
  enabled: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Enabled must be a boolean value',
      'any.required': 'Enabled is required',
    }),
});

/**
 * Backup ID parameter validation schema
 * مخطط التحقق من معرف النسخة الاحتياطية
 */
export const backupIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .required()
    .messages({
      'string.pattern.base': 'Backup ID must be a valid UUID',
      'any.required': 'Backup ID is required',
    }),
});

/**
 * Restore backup ID parameter validation schema
 * مخطط التحقق من معرف النسخة الاحتياطية للاستعادة
 */
export const restoreBackupIdSchema = Joi.object({
  backupId: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .required()
    .messages({
      'string.pattern.base': 'Backup ID must be a valid UUID',
      'any.required': 'Backup ID is required',
    }),
});
