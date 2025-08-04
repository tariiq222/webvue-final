/**
 * 🔧 Environment Configuration
 * إعدادات البيئة
 * 
 * Centralized configuration management for the WebCore application.
 * All environment variables are validated and typed here.
 */

import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string(),
  DATABASE_POOL_MIN: z.string().transform(Number).default('2'),
  DATABASE_POOL_MAX: z.string().transform(Number).default('10'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('10'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('1000'),

  // File Upload
  UPLOAD_MAX_SIZE: z.string().transform(Number).default('10485760'),
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/gif,application/pdf,application/zip'),
  UPLOAD_PATH: z.string().default('./storage/uploads'),

  // Plugin
  PLUGIN_PATH: z.string().default('./storage/plugins'),
  PLUGIN_MAX_SIZE: z.string().transform(Number).default('52428800'),
  PLUGIN_ALLOWED_TYPES: z.string().default('application/zip,application/x-zip-compressed'),

  // Redis (Optional)
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('./logs/webcore.log'),
  LOG_MAX_SIZE: z.string().default('10m'),
  LOG_MAX_FILES: z.string().transform(Number).default('5'),

  // Monitoring
  ENABLE_METRICS: z.string().transform(Boolean).default('true'),
  METRICS_PORT: z.string().transform(Number).default('9090'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CORS_CREDENTIALS: z.string().transform(Boolean).default('true'),

  // Security Headers
  HELMET_ENABLED: z.string().transform(Boolean).default('true'),
  CSP_ENABLED: z.string().transform(Boolean).default('true'),

  // Notifications
  NOTIFICATION_CLEANUP_DAYS: z.string().transform(Number).default('30'),
  NOTIFICATION_MAX_PER_USER: z.string().transform(Number).default('100'),

  // 2FA
  TWO_FA_ISSUER: z.string().default('WebCore'),
  TWO_FA_WINDOW: z.string().transform(Number).default('2'),

  // Performance
  COMPRESSION_ENABLED: z.string().transform(Boolean).default('true'),
  COMPRESSION_LEVEL: z.string().transform(Number).default('6'),

  // Email (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_SECURE: z.string().transform(Boolean).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Export typed configuration
export const config = {
  // Application
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // Database
  database: {
    url: env.DATABASE_URL,
    pool: {
      min: env.DATABASE_POOL_MIN,
      max: env.DATABASE_POOL_MAX,
    },
  },

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },

  // Security
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
  },

  // File Upload
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(','),
    path: env.UPLOAD_PATH,
  },

  // Plugin
  plugin: {
    path: env.PLUGIN_PATH,
    maxSize: env.PLUGIN_MAX_SIZE,
    allowedTypes: env.PLUGIN_ALLOWED_TYPES.split(','),
  },

  // Redis
  redis: {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
    maxSize: env.LOG_MAX_SIZE,
    maxFiles: env.LOG_MAX_FILES,
  },

  // Monitoring
  monitoring: {
    enabled: env.ENABLE_METRICS,
    port: env.METRICS_PORT,
  },

  // CORS
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: env.CORS_CREDENTIALS,
  },

  // Security Headers
  helmet: {
    enabled: env.HELMET_ENABLED,
    csp: {
      enabled: env.CSP_ENABLED,
    },
  },

  // Notifications
  notifications: {
    cleanupDays: env.NOTIFICATION_CLEANUP_DAYS,
    maxPerUser: env.NOTIFICATION_MAX_PER_USER,
  },

  // 2FA
  twoFA: {
    issuer: env.TWO_FA_ISSUER,
    window: env.TWO_FA_WINDOW,
  },

  // Performance
  compression: {
    enabled: env.COMPRESSION_ENABLED,
    level: env.COMPRESSION_LEVEL,
  },

  // Email
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
} as const;
