/**
 * 🔍 Setting Validation
 * التحقق من صحة الإعدادات
 * 
 * Joi validation schemas for settings management endpoints.
 */

import Joi from 'joi';

/**
 * Create setting validation schema
 * مخطط التحقق من إنشاء الإعداد
 */
export const createSettingSchema = Joi.object({
  key: Joi.string()
    .pattern(/^[a-zA-Z0-9._-]+$/)
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Setting key must contain only letters, numbers, dots, underscores, and hyphens',
      'string.min': 'Setting key must be at least 2 characters long',
      'string.max': 'Setting key must not exceed 100 characters',
      'any.required': 'Setting key is required',
    }),
  
  value: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.number(),
      Joi.boolean(),
      Joi.object(),
      Joi.array()
    )
    .required()
    .messages({
      'any.required': 'Setting value is required',
    }),
  
  type: Joi.string()
    .valid('string', 'number', 'boolean', 'object', 'array')
    .required()
    .messages({
      'any.only': 'Setting type must be one of: string, number, boolean, object, array',
      'any.required': 'Setting type is required',
    }),
  
  category: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Category must be at least 2 characters long',
      'string.max': 'Category must not exceed 50 characters',
      'any.required': 'Category is required',
    }),
  
  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  
  isPublic: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'isPublic must be a boolean value',
    }),
});

/**
 * Update setting validation schema
 * مخطط التحقق من تحديث الإعداد
 */
export const updateSettingSchema = Joi.object({
  value: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.number(),
      Joi.boolean(),
      Joi.object(),
      Joi.array()
    )
    .optional(),
  
  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
  
  isPublic: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isPublic must be a boolean value',
    }),
});

/**
 * Bulk update settings validation schema
 * مخطط التحقق من التحديث الجماعي للإعدادات
 */
export const bulkUpdateSettingsSchema = Joi.object({
  settings: Joi.array()
    .items(
      Joi.object({
        key: Joi.string()
          .pattern(/^[a-zA-Z0-9._-]+$/)
          .min(2)
          .max(100)
          .required()
          .messages({
            'string.pattern.base': 'Setting key must contain only letters, numbers, dots, underscores, and hyphens',
            'string.min': 'Setting key must be at least 2 characters long',
            'string.max': 'Setting key must not exceed 100 characters',
            'any.required': 'Setting key is required',
          }),
        
        value: Joi.alternatives()
          .try(
            Joi.string(),
            Joi.number(),
            Joi.boolean(),
            Joi.object(),
            Joi.array()
          )
          .required()
          .messages({
            'any.required': 'Setting value is required',
          }),
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'At least one setting is required',
      'array.max': 'Cannot update more than 50 settings at once',
      'any.required': 'Settings array is required',
    }),
});

/**
 * Setting query parameters validation schema
 * مخطط التحقق من معاملات استعلام الإعدادات
 */
export const settingQuerySchema = Joi.object({
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
    .valid('key', 'category', 'type', 'createdAt', 'updatedAt')
    .default('category')
    .messages({
      'any.only': 'Sort field must be one of: key, category, type, createdAt, updatedAt',
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('asc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"',
    }),
  
  category: Joi.string()
    .optional()
    .messages({
      'string.base': 'Category filter must be a string',
    }),
  
  isPublic: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isPublic filter must be a boolean value',
    }),
  
  isSystem: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isSystem filter must be a boolean value',
    }),
});

/**
 * Setting key parameter validation schema
 * مخطط التحقق من مفتاح الإعداد
 */
export const settingKeySchema = Joi.object({
  key: Joi.string()
    .pattern(/^[a-zA-Z0-9._-]+$/)
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Setting key must contain only letters, numbers, dots, underscores, and hyphens',
      'string.min': 'Setting key must be at least 2 characters long',
      'string.max': 'Setting key must not exceed 100 characters',
      'any.required': 'Setting key is required',
    }),
});

/**
 * Category parameter validation schema
 * مخطط التحقق من معامل الفئة
 */
export const categorySchema = Joi.object({
  category: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Category must be at least 2 characters long',
      'string.max': 'Category must not exceed 50 characters',
      'any.required': 'Category is required',
    }),
});
