/**
 * 📊 Monitoring Controller
 * متحكم المراقبة
 * 
 * HTTP request handlers for monitoring and alerting endpoints.
 */

import { Request, Response } from 'express';
import { MonitoringService } from '../services/monitoringService';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { sendSuccess, sendCreated, sendPaginatedResponse } from '@/shared/utils/response';

const monitoringService = new MonitoringService();

/**
 * @swagger
 * /api/monitoring/metrics/current:
 *   get:
 *     tags: [Monitoring]
 *     summary: Get current system metrics
 *     description: Retrieve current system performance metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current metrics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getCurrentMetrics = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await monitoringService.getCurrentMetrics();
  sendSuccess(res, { metrics }, 'Current metrics retrieved successfully');
});

/**
 * @swagger
 * /api/monitoring/metrics/historical:
 *   get:
 *     tags: [Monitoring]
 *     summary: Get historical metrics
 *     description: Retrieve historical system metrics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for metrics
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for metrics
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [minute, hour, day]
 *           default: hour
 *         description: Aggregation interval
 *     responses:
 *       200:
 *         description: Historical metrics retrieved successfully
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getHistoricalMetrics = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, interval } = req.query;
  
  const metrics = await monitoringService.getHistoricalMetrics({
    startDate: new Date(startDate as string),
    endDate: new Date(endDate as string),
    interval: interval as 'minute' | 'hour' | 'day',
  });
  
  sendSuccess(res, { metrics }, 'Historical metrics retrieved successfully');
});

/**
 * @swagger
 * /api/monitoring/health:
 *   get:
 *     tags: [Monitoring]
 *     summary: Get system health summary
 *     description: Retrieve overall system health status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health summary retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getHealthSummary = asyncHandler(async (req: Request, res: Response) => {
  const health = await monitoringService.getHealthSummary();
  sendSuccess(res, { health }, 'Health summary retrieved successfully');
});

/**
 * @swagger
 * /api/monitoring/alerts/active:
 *   get:
 *     tags: [Monitoring]
 *     summary: Get active alerts
 *     description: Retrieve all active system alerts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active alerts retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getActiveAlerts = asyncHandler(async (req: Request, res: Response) => {
  const alerts = await monitoringService.getActiveAlerts();
  sendSuccess(res, { alerts }, 'Active alerts retrieved successfully');
});

/**
 * @swagger
 * /api/monitoring/alerts:
 *   get:
 *     tags: [Monitoring]
 *     summary: Get all alerts
 *     description: Retrieve all alerts with pagination and filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by alert type
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by severity
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getAllAlerts = asyncHandler(async (req: Request, res: Response) => {
  const result = await monitoringService.getAllAlerts(req.query);
  sendPaginatedResponse(res, result.data, result.pagination, result.message);
});

/**
 * @swagger
 * /api/monitoring/alerts:
 *   post:
 *     tags: [Monitoring]
 *     summary: Create custom alert
 *     description: Create a custom system alert
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - severity
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 example: custom
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 example: medium
 *               title:
 *                 type: string
 *                 example: Custom Alert
 *               message:
 *                 type: string
 *                 example: This is a custom alert message
 *               threshold:
 *                 type: number
 *                 example: 80
 *               currentValue:
 *                 type: number
 *                 example: 85
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const createCustomAlert = asyncHandler(async (req: Request, res: Response) => {
  const alert = await monitoringService.createCustomAlert(req.body);
  sendCreated(res, { alert }, 'Alert created successfully');
});

/**
 * @swagger
 * /api/monitoring/alerts/{id}/resolve:
 *   put:
 *     tags: [Monitoring]
 *     summary: Resolve alert
 *     description: Mark an alert as resolved
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert resolved successfully
 *       404:
 *         description: Alert not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const resolveAlert = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const alert = await monitoringService.resolveAlert(id);
  sendSuccess(res, { alert }, 'Alert resolved successfully');
});

/**
 * @swagger
 * /api/monitoring/start:
 *   post:
 *     tags: [Monitoring]
 *     summary: Start monitoring
 *     description: Start system monitoring (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monitoring started successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const startMonitoring = asyncHandler(async (req: Request, res: Response) => {
  monitoringService.startMonitoring();
  sendSuccess(res, undefined, 'Monitoring started successfully');
});

/**
 * @swagger
 * /api/monitoring/stop:
 *   post:
 *     tags: [Monitoring]
 *     summary: Stop monitoring
 *     description: Stop system monitoring (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monitoring stopped successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const stopMonitoring = asyncHandler(async (req: Request, res: Response) => {
  monitoringService.stopMonitoring();
  sendSuccess(res, undefined, 'Monitoring stopped successfully');
});
