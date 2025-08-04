/**
 * 🔍 User Validation
 * التحقق من صحة المستخدمين
 * 
 * Joi validation schemas for user management endpoints.
 */

import Joi from 'joi';

/**
 * Create user validation schema
 * مخطط التحقق من إنشاء المستخدم
 */
export const createUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters',
      'any.required': 'Username is required',
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
  
  firstName: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name is required',
      'string.max': 'First name must not exceed 50 characters',
      'any.required': 'First name is required',
    }),
  
  lastName: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name is required',
      'string.max': 'Last name must not exceed 50 characters',
      'any.required': 'Last name is required',
    }),
  
  roleIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i))
    .optional()
    .messages({
      'array.base': 'Role IDs must be an array',
      'string.pattern.base': 'Each role ID must be a valid UUID',
    }),
});

/**
 * Update user validation schema
 * مخطط التحقق من تحديث المستخدم
 */
export const updateUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .optional()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters',
    }),
  
  firstName: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name cannot be empty',
      'string.max': 'First name must not exceed 50 characters',
    }),
  
  lastName: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name cannot be empty',
      'string.max': 'Last name must not exceed 50 characters',
    }),
  
  avatar: Joi.string()
    .uri()
    .allow(null, '')
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URL',
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive must be a boolean value',
    }),
  
  roleIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i))
    .optional()
    .messages({
      'array.base': 'Role IDs must be an array',
      'string.pattern.base': 'Each role ID must be a valid UUID',
    }),
});

/**
 * User query parameters validation schema
 * مخطط التحقق من معاملات استعلام المستخدمين
 */
export const userQuerySchema = Joi.object({
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
    .valid('firstName', 'lastName', 'email', 'username', 'createdAt', 'updatedAt', 'lastLoginAt')
    .default('createdAt')
    .messages({
      'any.only': 'Sort field must be one of: firstName, lastName, email, username, createdAt, updatedAt, lastLoginAt',
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"',
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive filter must be a boolean value',
    }),
  
  emailVerified: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'emailVerified filter must be a boolean value',
    }),
  
  twoFactorEnabled: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'twoFactorEnabled filter must be a boolean value',
    }),
  
  roleId: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .optional()
    .messages({
      'string.pattern.base': 'Role ID must be a valid UUID',
    }),
});

/**
 * User ID parameter validation schema
 * مخطط التحقق من معرف المستخدم
 */
export const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .required()
    .messages({
      'string.pattern.base': 'User ID must be a valid UUID',
      'any.required': 'User ID is required',
    }),
});
