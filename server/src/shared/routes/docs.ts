/**
 * 📚 API Documentation Routes
 * مسارات توثيق API
 * 
 * Swagger/OpenAPI documentation setup for the WebCore API.
 */

import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from '@/config/environment';

const router = Router();

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'WebCore API',
    version: '2.0.0',
    description: 'Advanced Content Management System with Plugin Support',
    contact: {
      name: 'WebCore Team',
      email: 'support@webcore.dev',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://${config.host}:${config.port}/api`,
      description: 'Development server',
    },
    {
      url: 'https://api.webcore.dev',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Error message',
              },
              code: {
                type: 'string',
                example: 'ERROR_CODE',
              },
              statusCode: {
                type: 'integer',
                example: 400,
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-01T00:00:00.000Z',
              },
              path: {
                type: 'string',
                example: '/api/endpoint',
              },
              method: {
                type: 'string',
                example: 'GET',
              },
            },
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z',
          },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
                example: 1,
              },
              limit: {
                type: 'integer',
                example: 10,
              },
              total: {
                type: 'integer',
                example: 100,
              },
              totalPages: {
                type: 'integer',
                example: 10,
              },
              hasNext: {
                type: 'boolean',
                example: true,
              },
              hasPrev: {
                type: 'boolean',
                example: false,
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization',
    },
    {
      name: 'Users',
      description: 'User management operations',
    },
    {
      name: 'Roles',
      description: 'Role and permission management',
    },
    {
      name: 'Plugins',
      description: 'Plugin management and execution',
    },
    {
      name: 'Settings',
      description: 'System settings management',
    },
    {
      name: 'Notifications',
      description: 'In-app notification system',
    },
    {
      name: 'Health',
      description: 'System health and monitoring',
    },
  ],
};

// Options for the swagger docs
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/features/**/*.ts',
    './src/shared/routes/*.ts',
  ],
};

// Initialize swagger-jsdoc
const specs = swaggerJsdoc(options);

// Swagger UI setup
const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'WebCore API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
};

// Serve swagger docs
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(specs, swaggerUiOptions));

// Serve raw OpenAPI spec
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

export { router as docsRouter };
