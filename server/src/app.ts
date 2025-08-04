/**
 * 🎯 WebCore Application Setup
 * إعداد تطبيق WebCore
 * 
 * Main application configuration file that sets up Express app
 * with all necessary middleware, routes, and error handling.
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { config } from '@/config/environment';
import { logger } from '@/shared/utils/logger';
import { errorHandler } from '@/shared/middleware/errorHandler';
import { notFoundHandler } from '@/shared/middleware/notFoundHandler';
import { rateLimiter } from '@/shared/middleware/rateLimiter';
import { requestLogger } from '@/shared/middleware/requestLogger';
import { sanitizeInput, securityHeaders, requestTimeout } from '@/shared/middleware/security';
import { healthRouter } from '@/shared/routes/health';
import { docsRouter } from '@/shared/routes/docs';
import { authRouter } from '@/features/auth/routes/authRoutes';
import { userRouter } from '@/features/users/routes/userRoutes';
import { roleRouter } from '@/features/roles/routes/roleRoutes';
import { settingRouter } from '@/features/settings/routes/settingRoutes';
import { profileRouter } from '@/features/profile/routes/profileRoutes';
import { dashboardRouter } from '@/features/dashboard/routes/dashboardRoutes';
import { pluginRouter } from '@/features/plugins/routes/pluginRoutes';
import { notificationRouter } from '@/features/notifications/routes/notificationRoutes';
import { fileRouter } from '@/features/files/routes/fileRoutes';
import { monitoringRouter } from '@/features/monitoring/routes/monitoringRoutes';
import { backupRouter } from '@/features/backup/routes/backupRoutes';

/**
 * Create and configure Express application
 * إنشاء وتكوين تطبيق Express
 */
function createApp(): Application {
  const app = express();

  // 🛡️ Security middleware
  if (config.helmet.enabled) {
    app.use(helmet({
      contentSecurityPolicy: config.helmet.csp.enabled ? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      } : false,
    }));
  }

  // 🌐 CORS configuration
  app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // 📦 Compression middleware
  if (config.compression.enabled) {
    app.use(compression({
      level: config.compression.level,
      threshold: 1024, // Only compress responses > 1KB
    }));
  }

  // 📝 Request logging
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));
  }

  // 🔧 Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 🛡️ Additional security middleware
  app.use(securityHeaders);
  app.use(sanitizeInput);
  app.use(requestTimeout(30000)); // 30 seconds timeout

  // 🚦 Rate limiting
  app.use(rateLimiter);

  // 📊 Request logging middleware
  app.use(requestLogger);

  // 🏥 Health check routes
  app.use('/health', healthRouter);

  // 📚 API documentation
  app.use('/api-docs', docsRouter);

  // 🔗 API routes
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/roles', roleRouter);
  app.use('/api/settings', settingRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/plugins', pluginRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/files', fileRouter);
  app.use('/api/monitoring', monitoringRouter);
  app.use('/api/backup', backupRouter);
  // TODO: Add remaining feature routes
  // app.use('/api/roles', rolesRouter);
  // app.use('/api/plugins', pluginsRouter);
  // app.use('/api/settings', settingsRouter);
  // app.use('/api/notifications', notificationsRouter);

  // 🚫 404 handler
  app.use(notFoundHandler);

  // ❌ Error handler (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp();
