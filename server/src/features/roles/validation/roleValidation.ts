/**
 * 🔍 Role Validation
 * التحقق من صحة الأدوار
 * 
 * Joi validation schemas for role and permission management endpoints.
 */

import Joi from 'joi';

/**
 * Create role validation schema
 * مخطط التحقق من إنشاء الدور
 */
export const createRoleSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Role name must be at least 2 characters long',
      'string.max': 'Role name must not exceed 50 characters',
      'any.required': 'Role name is required',
    }),
  
  description: Joi.string()
    .max(200)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description must not exceed 200 characters',
    }),
  
  permissionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i))
    .required()
    .messages({
      'array.base': 'Permission IDs must be an array',
      'string.pattern.base': 'Each permission ID must be a valid UUID',
      'any.required': 'Permission IDs are required',
    }),
});

/**
 * Update role validation schema
 * مخطط التحقق من تحديث الدور
 */
export const updateRoleSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Role name must be at least 2 characters long',
      'string.max': 'Role name must not exceed 50 characters',
    }),
  
  description: Joi.string()
    .max(200)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description must not exceed 200 characters',
    }),
  
  permissionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i))
    .optional()
    .messages({
      'array.base': 'Permission IDs must be an array',
      'string.pattern.base': 'Each permission ID must be a valid UUID',
    }),
});

/**
 * Role query parameters validation schema
 * مخطط التحقق من معاملات استعلام الأدوار
 */
export const roleQuerySchema = Joi.object({
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
    .default(10)
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
    .valid('name', 'description', 'createdAt', 'updatedAt')
    .default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: name, description, createdAt, updatedAt',
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"',
    }),
  
  isSystem: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isSystem filter must be a boolean value',
    }),
});

/**
 * Permission query parameters validation schema
 * مخطط التحقق من معاملات استعلام الصلاحيات
 */
export const permissionQuerySchema = Joi.object({
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
    .default(50)
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
    .valid('name', 'resource', 'action', 'createdAt', 'updatedAt')
    .default('resource')
    .messages({
      'any.only': 'Sort field must be one of: name, resource, action, createdAt, updatedAt',
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('asc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"',
    }),
  
  resource: Joi.string()
    .optional()
    .messages({
      'string.base': 'Resource filter must be a string',
    }),
  
  action: Joi.string()
    .optional()
    .messages({
      'string.base': 'Action filter must be a string',
    }),
  
  isSystem: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isSystem filter must be a boolean value',
    }),
});

/**
 * Role ID parameter validation schema
 * مخطط التحقق من معرف الدور
 */
export const roleIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .required()
    .messages({
      'string.pattern.base': 'Role ID must be a valid UUID',
      'any.required': 'Role ID is required',
    }),
});
