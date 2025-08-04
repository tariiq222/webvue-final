/**
 * 🔍 Validation Middleware
 * وسطية التحقق من الصحة
 * 
 * Joi validation middleware for request validation.
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

/**
 * Validate request body
 * التحقق من صحة جسم الطلب
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      throw new AppError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        errorMessages
      );
    }

    req.body = value;
    next();
  };
};

/**
 * Validate request query parameters
 * التحقق من صحة معاملات الاستعلام
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      throw new AppError(
        'Query validation failed',
        400,
        'QUERY_VALIDATION_ERROR',
        errorMessages
      );
    }

    req.query = value;
    next();
  };
};

/**
 * Validate request parameters
 * التحقق من صحة معاملات الطلب
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      throw new AppError(
        'Parameter validation failed',
        400,
        'PARAMETER_VALIDATION_ERROR',
        errorMessages
      );
    }

    req.params = value;
    next();
  };
};

/**
 * Common validation schemas
 * مخططات التحقق الشائعة
 */
export const commonSchemas = {
  // UUID parameter validation
  uuidParam: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      .required()
      .messages({
        'string.pattern.base': 'Invalid ID format',
        'any.required': 'ID is required',
      }),
  }),

  // Pagination query validation
  paginationQuery: Joi.object({
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
    
    sortBy: Joi.string()
      .optional()
      .messages({
        'string.base': 'Sort field must be a string',
      }),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('asc')
      .messages({
        'any.only': 'Sort order must be either "asc" or "desc"',
      }),
    
    search: Joi.string()
      .optional()
      .allow('')
      .messages({
        'string.base': 'Search term must be a string',
      }),
  }),

  // Search query validation
  searchQuery: Joi.object({
    q: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Search query must be at least 1 character',
        'string.max': 'Search query must not exceed 100 characters',
        'any.required': 'Search query is required',
      }),
  }),
};
