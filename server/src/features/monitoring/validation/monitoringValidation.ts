/**
 * 🔍 Monitoring Validation
 * التحقق من صحة المراقبة
 * 
 * Joi validation schemas for monitoring endpoints.
 */

import Joi from 'joi';

/**
 * Historical metrics query validation schema
 * مخطط التحقق من استعلام المقاييس التاريخية
 */
export const historicalMetricsQuerySchema = Joi.object({
  startDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.format': 'Start date must be in ISO format',
      'any.required': 'Start date is required',
    }),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .required()
    .messages({
      'date.format': 'End date must be in ISO format',
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required',
    }),
  
  interval: Joi.string()
    .valid('minute', 'hour', 'day')
    .default('hour')
    .messages({
      'any.only': 'Interval must be one of: minute, hour, day',
    }),
});

/**
 * Alert query parameters validation schema
 * مخطط التحقق من معاملات استعلام التنبيهات
 */
export const alertQuerySchema = Joi.object({
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
    .valid('type', 'severity', 'title', 'createdAt', 'resolvedAt')
    .default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: type, severity, title, createdAt, resolvedAt',
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"',
    }),
  
  type: Joi.string()
    .optional()
    .messages({
      'string.base': 'Type filter must be a string',
    }),
  
  severity: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .optional()
    .messages({
      'any.only': 'Severity filter must be one of: low, medium, high, critical',
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive filter must be a boolean value',
    }),
});

/**
 * Create custom alert validation schema
 * مخطط التحقق من إنشاء تنبيه مخصص
 */
export const createCustomAlertSchema = Joi.object({
  type: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Type cannot be empty',
      'string.max': 'Type must not exceed 50 characters',
      'any.required': 'Type is required',
    }),
  
  severity: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .required()
    .messages({
      'any.only': 'Severity must be one of: low, medium, high, critical',
      'any.required': 'Severity is required',
    }),
  
  title: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title must not exceed 200 characters',
      'any.required': 'Title is required',
    }),
  
  message: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message must not exceed 1000 characters',
      'any.required': 'Message is required',
    }),
  
  threshold: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Threshold must be a number',
      'number.min': 'Threshold must be non-negative',
    }),
  
  currentValue: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Current value must be a number',
      'number.min': 'Current value must be non-negative',
    }),
});

/**
 * Alert ID parameter validation schema
 * مخطط التحقق من معرف التنبيه
 */
export const alertIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .required()
    .messages({
      'string.pattern.base': 'Alert ID must be a valid UUID',
      'any.required': 'Alert ID is required',
    }),
});
