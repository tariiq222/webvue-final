/**
 * 📊 Dashboard Controller
 * متحكم لوحة التحكم
 * 
 * HTTP request handlers for dashboard and analytics endpoints.
 */

import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { sendSuccess } from '@/shared/utils/response';

const dashboardService = new DashboardService();

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard overview
 *     description: Retrieve overview statistics for the dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview statistics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const stats = await dashboardService.getOverviewStats();
  sendSuccess(res, { stats }, 'Overview statistics retrieved successfully');
});

/**
 * @swagger
 * /api/dashboard/activity-chart:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get user activity chart data
 *     description: Retrieve user activity data for charts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Number of days to include in the chart
 *     responses:
 *       200:
 *         description: Activity chart data retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getActivityChart = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const chartData = await dashboardService.getUserActivityChart(days);
  sendSuccess(res, { chartData }, 'Activity chart data retrieved successfully');
});

/**
 * @swagger
 * /api/dashboard/recent-activities:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recent activities
 *     description: Retrieve recent system activities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of activities to retrieve
 *     responses:
 *       200:
 *         description: Recent activities retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getRecentActivities = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const activities = await dashboardService.getRecentActivities(limit);
  sendSuccess(res, { activities }, 'Recent activities retrieved successfully');
});

/**
 * @swagger
 * /api/dashboard/system-health:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get system health
 *     description: Retrieve system health metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getSystemHealth = asyncHandler(async (req: Request, res: Response) => {
  const health = await dashboardService.getSystemHealth();
  sendSuccess(res, { health }, 'System health retrieved successfully');
});

/**
 * @swagger
 * /api/dashboard/action-distribution:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get action distribution
 *     description: Retrieve action distribution statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Action distribution retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getActionDistribution = asyncHandler(async (req: Request, res: Response) => {
  const distribution = await dashboardService.getActionDistribution();
  sendSuccess(res, { distribution }, 'Action distribution retrieved successfully');
});
