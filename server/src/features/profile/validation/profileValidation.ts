/**
 * 🔍 Profile Validation
 * التحقق من صحة الملف الشخصي
 * 
 * Joi validation schemas for profile management endpoints.
 */

import Joi from 'joi';

/**
 * Update profile validation schema
 * مخطط التحقق من تحديث الملف الشخصي
 */
export const updateProfileSchema = Joi.object({
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
  
  avatar: Joi.string()
    .uri()
    .allow(null, '')
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URL',
    }),
});

/**
 * Change password validation schema
 * مخطط التحقق من تغيير كلمة المرور
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),
  
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'New password is required',
    }),
});

/**
 * Delete account validation schema
 * مخطط التحقق من حذف الحساب
 */
export const deleteAccountSchema = Joi.object({
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required to delete account',
    }),
});

/**
 * Activity log query parameters validation schema
 * مخطط التحقق من معاملات استعلام سجل النشاط
 */
export const activityLogQuerySchema = Joi.object({
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
});

/**
 * Session ID parameter validation schema
 * مخطط التحقق من معرف الجلسة
 */
export const sessionIdSchema = Joi.object({
  sessionId: Joi.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .required()
    .messages({
      'string.pattern.base': 'Session ID must be a valid UUID',
      'any.required': 'Session ID is required',
    }),
});
