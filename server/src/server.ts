/**
 * 🚀 WebCore Server Entry Point
 * نقطة دخول خادم WebCore
 * 
 * Main server file that initializes and starts the WebCore application.
 * This file sets up the Express server, connects to the database,
 * and configures all necessary middleware and routes.
 */

import 'dotenv/config';
import { createServer } from 'http';
import app from './app';
import { logger } from '@/shared/utils/logger';
import { connectDatabase } from '@/database/connection';
import { config } from '@/config/environment';

/**
 * Start the server
 * بدء تشغيل الخادم
 */
async function startServer(): Promise<void> {
  try {
    // Connect to database
    logger.info('🗄️ Connecting to database...');
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Create HTTP server
    const server = createServer(app);

    // Start listening
    server.listen(config.port, config.host, () => {
      logger.info(`🚀 WebCore Server is running on http://${config.host}:${config.port}`);
      logger.info(`📚 API Documentation available at http://${config.host}:${config.port}/api-docs`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
