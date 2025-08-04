/**
 * 🔍 Notification Validation
 * التحقق من صحة الإشعارات
 * 
 * Joi validation schemas for notification management endpoints.
 */

import Joi from 'joi';

/**
 * Create notification validation schema
 * مخطط التحقق من إنشاء الإشعار
 */
export const createNotificationSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .required()
    .messages({
      'string.pattern.base': 'User ID must be a valid UUID',
      'any.required': 'User ID is required',
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
  
  type: Joi.string()
    .max(50)
    .default('info')
    .messages({
      'string.max': 'Type must not exceed 50 characters',
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, urgent',
    }),
  
  channels: Joi.array()
    .items(Joi.string().valid('in_app', 'email', 'sms', 'push'))
    .default(['in_app'])
    .messages({
      'array.base': 'Channels must be an array',
      'any.only': 'Each channel must be one of: in_app, email, sms, push',
    }),
  
  data: Joi.object()
    .default({})
    .messages({
      'object.base': 'Data must be an object',
    }),
  
  scheduledFor: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Scheduled date must be in ISO format',
    }),
});

/**
 * Create bulk notifications validation schema
 * مخطط التحقق من إنشاء الإشعارات الجماعية
 */
export const createBulkNotificationsSchema = Joi.object({
  userIds: Joi.array()
    .items(
      Joi.string().pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    )
    .min(1)
    .max(1000)
    .required()
    .messages({
      'array.base': 'User IDs must be an array',
      'array.min': 'At least one user ID is required',
      'array.max': 'Cannot send to more than 1000 users at once',
      'string.pattern.base': 'Each user ID must be a valid UUID',
      'any.required': 'User IDs are required',
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
  
  type: Joi.string()
    .max(50)
    .default('info')
    .messages({
      'string.max': 'Type must not exceed 50 characters',
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high, urgent',
    }),
  
  channels: Joi.array()
    .items(Joi.string().valid('in_app', 'email', 'sms', 'push'))
    .default(['in_app'])
    .messages({
      'array.base': 'Channels must be an array',
      'any.only': 'Each channel must be one of: in_app, email, sms, push',
    }),
  
  data: Joi.object()
    .default({})
    .messages({
      'object.base': 'Data must be an object',
    }),
  
  scheduledFor: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Scheduled date must be in ISO format',
    }),
});

/**
 * Notification query parameters validation schema
 * مخطط التحقق من معاملات استعلام الإشعارات
 */
export const notificationQuerySchema = Joi.object({
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
  
  search: Joi.string()
    .allow('')
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term must not exceed 100 characters',
    }),
  
  sortBy: Joi.string()
    .valid('title', 'type', 'priority', 'createdAt', 'readAt')
    .default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: title, type, priority, createdAt, readAt',
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"',
    }),
  
  isRead: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isRead filter must be a boolean value',
    }),
  
  type: Joi.string()
    .optional()
    .messages({
      'string.base': 'Type filter must be a string',
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .optional()
    .messages({
      'any.only': 'Priority filter must be one of: low, medium, high, urgent',
    }),
  
  userId: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .optional()
    .messages({
      'string.pattern.base': 'User ID must be a valid UUID',
    }),
  
  channel: Joi.string()
    .valid('in_app', 'email', 'sms', 'push')
    .optional()
    .messages({
      'any.only': 'Channel filter must be one of: in_app, email, sms, push',
    }),
});

/**
 * Notification ID parameter validation schema
 * مخطط التحقق من معرف الإشعار
 */
export const notificationIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .required()
    .messages({
      'string.pattern.base': 'Notification ID must be a valid UUID',
      'any.required': 'Notification ID is required',
    }),
});
