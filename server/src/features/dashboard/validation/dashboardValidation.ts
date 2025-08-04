/**
 * 🔍 Dashboard Validation
 * التحقق من صحة لوحة التحكم
 * 
 * Joi validation schemas for dashboard endpoints.
 */

import Joi from 'joi';

/**
 * Activity chart query parameters validation schema
 * مخطط التحقق من معاملات استعلام مخطط النشاط
 */
export const activityChartQuerySchema = Joi.object({
  days: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .default(30)
    .messages({
      'number.base': 'Days must be a number',
      'number.integer': 'Days must be an integer',
      'number.min': 'Days must be at least 1',
      'number.max': 'Days must not exceed 365',
    }),
});

/**
 * Recent activities query parameters validation schema
 * مخطط التحقق من معاملات استعلام الأنشطة الحديثة
 */
export const recentActivitiesQuerySchema = Joi.object({
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
