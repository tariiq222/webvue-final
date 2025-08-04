/**
 * 🔍 File Validation
 * التحقق من صحة الملفات
 * 
 * Joi validation schemas for file management endpoints.
 */

import Joi from 'joi';

/**
 * File query parameters validation schema
 * مخطط التحقق من معاملات استعلام الملفات
 */
export const fileQuerySchema = Joi.object({
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
    .valid('originalName', 'filename', 'size', 'mimetype', 'category', 'createdAt', 'updatedAt')
    .default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: originalName, filename, size, mimetype, category, createdAt, updatedAt',
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"',
    }),
  
  mimetype: Joi.string()
    .optional()
    .messages({
      'string.base': 'Mimetype filter must be a string',
    }),
  
  category: Joi.string()
    .optional()
    .messages({
      'string.base': 'Category filter must be a string',
    }),
  
  userId: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .optional()
    .messages({
      'string.pattern.base': 'User ID must be a valid UUID',
    }),
});

/**
 * Update file validation schema
 * مخطط التحقق من تحديث الملف
 */
export const updateFileSchema = Joi.object({
  originalName: Joi.string()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.min': 'Original name cannot be empty',
      'string.max': 'Original name must not exceed 255 characters',
    }),
  
  category: Joi.string()
    .valid('image', 'video', 'audio', 'document', 'spreadsheet', 'presentation', 'archive', 'other')
    .optional()
    .messages({
      'any.only': 'Category must be one of: image, video, audio, document, spreadsheet, presentation, archive, other',
    }),
  
  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
});

/**
 * Upload file validation schema
 * مخطط التحقق من رفع الملف
 */
export const uploadFileSchema = Joi.object({
  category: Joi.string()
    .valid('image', 'video', 'audio', 'document', 'spreadsheet', 'presentation', 'archive', 'other')
    .optional()
    .messages({
      'any.only': 'Category must be one of: image, video, audio, document, spreadsheet, presentation, archive, other',
    }),
});

/**
 * File ID parameter validation schema
 * مخطط التحقق من معرف الملف
 */
export const fileIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .required()
    .messages({
      'string.pattern.base': 'File ID must be a valid UUID',
      'any.required': 'File ID is required',
    }),
});

/**
 * File stats query validation schema
 * مخطط التحقق من استعلام إحصائيات الملفات
 */
export const fileStatsQuerySchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .optional()
    .messages({
      'string.pattern.base': 'User ID must be a valid UUID',
    }),
});
