/**
 * 📊 Monitoring Service
 * خدمة المراقبة
 * 
 * Business logic for system monitoring, alerts, and performance tracking.
 */

import { prisma } from '@/database/connection';
import { AppError } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';
import { config } from '@/config/environment';
import os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';
import {
  calculatePagination,
  getPaginationOffset,
  getPrismaSortOptions,
} from '@/shared/utils/pagination';
import { PaginationParams, PaginatedResponse } from '@/shared/types';

const execAsync = promisify(exec);

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
  database: {
    connections: number;
    responseTime: number;
    status: 'healthy' | 'warning' | 'error';
  };
  uptime: number;
}

export interface Alert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'database' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  threshold: number;
  currentValue: number;
  isActive: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export class MonitoringService {
  private metricsInterval: NodeJS.Timeout | null = null;
  private alertThresholds = {
    cpu: 80,
    memory: 85,
    disk: 90,
    database: 1000, // ms
  };

  /**
   * Start monitoring system metrics
   * بدء مراقبة مقاييس النظام
   */
  startMonitoring(): void {
    if (this.metricsInterval) {
      return;
    }

    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.collectSystemMetrics();
        await this.storeMetrics(metrics);
        await this.checkAlerts(metrics);
      } catch (error) {
        logger.error('Failed to collect system metrics', { error });
      }
    }, 60000); // Collect metrics every minute

    logger.info('System monitoring started');
  }

  /**
   * Stop monitoring system metrics
   * إيقاف مراقبة مقاييس النظام
   */
  stopMonitoring(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
      logger.info('System monitoring stopped');
    }
  }

  /**
   * Get current system metrics
   * الحصول على مقاييس النظام الحالية
   */
  async getCurrentMetrics(): Promise<SystemMetrics> {
    return await this.collectSystemMetrics();
  }

  /**
   * Get historical metrics
   * الحصول على المقاييس التاريخية
   */
  async getHistoricalMetrics(params: {
    startDate: Date;
    endDate: Date;
    interval?: 'minute' | 'hour' | 'day';
  }): Promise<SystemMetrics[]> {
    const { startDate, endDate, interval = 'hour' } = params;

    const metrics = await prisma.systemMetric.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Group metrics by interval if needed
    if (interval !== 'minute') {
      return this.aggregateMetrics(metrics, interval);
    }

    return metrics.map(this.formatMetric);
  }

  /**
   * Get active alerts
   * الحصول على التنبيهات النشطة
   */
  async getActiveAlerts(): Promise<Alert[]> {
    const alerts = await prisma.alert.findMany({
      where: { isActive: true },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return alerts.map(this.formatAlert);
  }

  /**
   * Get all alerts with pagination
   * الحصول على جميع التنبيهات مع التصفح
   */
  async getAllAlerts(params: PaginationParams & {
    type?: string;
    severity?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Alert>> {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      type,
      severity,
      isActive,
    } = params;

    // Build where clause
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (severity) {
      where.severity = severity;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count
    const total = await prisma.alert.count({ where });

    // Get alerts with pagination
    const alerts = await prisma.alert.findMany({
      where,
      orderBy: getPrismaSortOptions(sortBy, sortOrder),
      skip: getPaginationOffset(page, limit),
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);

    return {
      success: true,
      data: alerts.map(this.formatAlert),
      pagination,
      message: 'Alerts retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create custom alert
   * إنشاء تنبيه مخصص
   */
  async createCustomAlert(alertData: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    threshold?: number;
    currentValue?: number;
  }): Promise<Alert> {
    const alert = await prisma.alert.create({
      data: {
        ...alertData,
        isActive: true,
      },
    });

    logger.info('Custom alert created', {
      alertId: alert.id,
      type: alert.type,
      severity: alert.severity,
    });

    return this.formatAlert(alert);
  }

  /**
   * Resolve alert
   * حل التنبيه
   */
  async resolveAlert(alertId: string): Promise<Alert> {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404, 'ALERT_NOT_FOUND');
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        isActive: false,
        resolvedAt: new Date(),
      },
    });

    logger.info('Alert resolved', { alertId });

    return this.formatAlert(updatedAlert);
  }

  /**
   * Get system health summary
   * الحصول على ملخص صحة النظام
   */
  async getHealthSummary(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    components: {
      cpu: 'healthy' | 'warning' | 'critical';
      memory: 'healthy' | 'warning' | 'critical';
      disk: 'healthy' | 'warning' | 'critical';
      database: 'healthy' | 'warning' | 'critical';
    };
    activeAlerts: number;
    uptime: number;
  }> {
    const metrics = await this.getCurrentMetrics();
    const activeAlerts = await this.getActiveAlerts();

    const components = {
      cpu: this.getComponentHealth(metrics.cpu.usage, this.alertThresholds.cpu),
      memory: this.getComponentHealth(metrics.memory.percentage, this.alertThresholds.memory),
      disk: this.getComponentHealth(metrics.disk.percentage, this.alertThresholds.disk),
      database: metrics.database.status as 'healthy' | 'warning' | 'critical',
    };

    // Determine overall health
    const componentStatuses = Object.values(components);
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (componentStatuses.includes('critical')) {
      overall = 'critical';
    } else if (componentStatuses.includes('warning')) {
      overall = 'warning';
    }

    return {
      overall,
      components,
      activeAlerts: activeAlerts.length,
      uptime: metrics.uptime,
    };
  }

  /**
   * Collect system metrics
   * جمع مقاييس النظام
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date();

    // CPU metrics
    const cpuUsage = await this.getCpuUsage();
    const loadAverage = os.loadavg();
    const cores = os.cpus().length;

    // Memory metrics
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    // Disk metrics
    const diskMetrics = await this.getDiskUsage();

    // Network metrics (simplified)
    const networkMetrics = { bytesIn: 0, bytesOut: 0 };

    // Database metrics
    const databaseMetrics = await this.getDatabaseMetrics();

    // Uptime
    const uptime = process.uptime();

    return {
      timestamp,
      cpu: {
        usage: cpuUsage,
        loadAverage,
        cores,
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        percentage: memoryPercentage,
      },
      disk: diskMetrics,
      network: networkMetrics,
      database: databaseMetrics,
      uptime,
    };
  }

  /**
   * Get CPU usage percentage
   * الحصول على نسبة استخدام المعالج
   */
  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startMeasure = process.cpuUsage();
      const startTime = process.hrtime();

      setTimeout(() => {
        const endMeasure = process.cpuUsage(startMeasure);
        const endTime = process.hrtime(startTime);

        const totalTime = endTime[0] * 1000000 + endTime[1] / 1000;
        const totalCpuTime = endMeasure.user + endMeasure.system;
        const cpuPercent = (totalCpuTime / totalTime) * 100;

        resolve(Math.min(100, Math.max(0, cpuPercent)));
      }, 100);
    });
  }

  /**
   * Get disk usage
   * الحصول على استخدام القرص
   */
  private async getDiskUsage(): Promise<{
    total: number;
    used: number;
    free: number;
    percentage: number;
  }> {
    try {
      const { stdout } = await execAsync('df -h / | tail -1');
      const parts = stdout.trim().split(/\s+/);
      
      const total = this.parseSize(parts[1]);
      const used = this.parseSize(parts[2]);
      const free = this.parseSize(parts[3]);
      const percentage = parseInt(parts[4].replace('%', ''));

      return { total, used, free, percentage };
    } catch (error) {
      // Fallback for Windows or if df command fails
      return { total: 0, used: 0, free: 0, percentage: 0 };
    }
  }

  /**
   * Get database metrics
   * الحصول على مقاييس قاعدة البيانات
   */
  private async getDatabaseMetrics(): Promise<{
    connections: number;
    responseTime: number;
    status: 'healthy' | 'warning' | 'error';
  }> {
    const startTime = Date.now();
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    let responseTime = 0;

    try {
      await prisma.$queryRaw`SELECT 1`;
      responseTime = Date.now() - startTime;

      if (responseTime > 1000) {
        status = 'warning';
      }
      if (responseTime > 5000) {
        status = 'error';
      }
    } catch (error) {
      status = 'error';
      responseTime = Date.now() - startTime;
    }

    return {
      connections: 1, // Simplified - would need actual connection pool info
      responseTime,
      status,
    };
  }

  /**
   * Store metrics in database
   * تخزين المقاييس في قاعدة البيانات
   */
  private async storeMetrics(metrics: SystemMetrics): Promise<void> {
    await prisma.systemMetric.create({
      data: {
        timestamp: metrics.timestamp,
        cpuUsage: metrics.cpu.usage,
        memoryUsage: metrics.memory.percentage,
        diskUsage: metrics.disk.percentage,
        databaseResponseTime: metrics.database.responseTime,
        uptime: metrics.uptime,
        data: metrics,
      },
    });
  }

  /**
   * Check for alerts based on metrics
   * فحص التنبيهات بناءً على المقاييس
   */
  private async checkAlerts(metrics: SystemMetrics): Promise<void> {
    const checks = [
      {
        type: 'cpu',
        value: metrics.cpu.usage,
        threshold: this.alertThresholds.cpu,
        title: 'High CPU Usage',
        message: `CPU usage is ${metrics.cpu.usage.toFixed(1)}%`,
      },
      {
        type: 'memory',
        value: metrics.memory.percentage,
        threshold: this.alertThresholds.memory,
        title: 'High Memory Usage',
        message: `Memory usage is ${metrics.memory.percentage.toFixed(1)}%`,
      },
      {
        type: 'disk',
        value: metrics.disk.percentage,
        threshold: this.alertThresholds.disk,
        title: 'High Disk Usage',
        message: `Disk usage is ${metrics.disk.percentage.toFixed(1)}%`,
      },
      {
        type: 'database',
        value: metrics.database.responseTime,
        threshold: this.alertThresholds.database,
        title: 'Slow Database Response',
        message: `Database response time is ${metrics.database.responseTime}ms`,
      },
    ];

    for (const check of checks) {
      if (check.value > check.threshold) {
        await this.createAlert(check);
      }
    }
  }

  /**
   * Create alert if it doesn't exist
   * إنشاء تنبيه إذا لم يكن موجوداً
   */
  private async createAlert(alertData: {
    type: string;
    value: number;
    threshold: number;
    title: string;
    message: string;
  }): Promise<void> {
    // Check if similar alert already exists
    const existingAlert = await prisma.alert.findFirst({
      where: {
        type: alertData.type,
        isActive: true,
      },
    });

    if (existingAlert) {
      return;
    }

    const severity = this.determineSeverity(alertData.value, alertData.threshold);

    await prisma.alert.create({
      data: {
        type: alertData.type,
        severity,
        title: alertData.title,
        message: alertData.message,
        threshold: alertData.threshold,
        currentValue: alertData.value,
        isActive: true,
      },
    });

    logger.warn('Alert created', {
      type: alertData.type,
      severity,
      value: alertData.value,
      threshold: alertData.threshold,
    });
  }

  /**
   * Determine alert severity
   * تحديد شدة التنبيه
   */
  private determineSeverity(value: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = value / threshold;
    
    if (ratio >= 1.5) return 'critical';
    if (ratio >= 1.3) return 'high';
    if (ratio >= 1.1) return 'medium';
    return 'low';
  }

  /**
   * Get component health status
   * الحصول على حالة صحة المكون
   */
  private getComponentHealth(value: number, threshold: number): 'healthy' | 'warning' | 'critical' {
    if (value >= threshold * 1.2) return 'critical';
    if (value >= threshold) return 'warning';
    return 'healthy';
  }

  /**
   * Parse size string to bytes
   * تحليل سلسلة الحجم إلى بايتات
   */
  private parseSize(sizeStr: string): number {
    const units = { K: 1024, M: 1024 ** 2, G: 1024 ** 3, T: 1024 ** 4 };
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGT]?)$/);
    
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2] as keyof typeof units;
    
    return value * (units[unit] || 1);
  }

  /**
   * Format metric for response
   * تنسيق المقياس للاستجابة
   */
  private formatMetric(metric: any): SystemMetrics {
    return {
      timestamp: metric.timestamp,
      cpu: {
        usage: metric.cpuUsage,
        loadAverage: metric.data?.cpu?.loadAverage || [],
        cores: metric.data?.cpu?.cores || 0,
      },
      memory: {
        total: metric.data?.memory?.total || 0,
        used: metric.data?.memory?.used || 0,
        free: metric.data?.memory?.free || 0,
        percentage: metric.memoryUsage,
      },
      disk: {
        total: metric.data?.disk?.total || 0,
        used: metric.data?.disk?.used || 0,
        free: metric.data?.disk?.free || 0,
        percentage: metric.diskUsage,
      },
      network: metric.data?.network || { bytesIn: 0, bytesOut: 0 },
      database: {
        connections: metric.data?.database?.connections || 0,
        responseTime: metric.databaseResponseTime,
        status: metric.data?.database?.status || 'healthy',
      },
      uptime: metric.uptime,
    };
  }

  /**
   * Format alert for response
   * تنسيق التنبيه للاستجابة
   */
  private formatAlert(alert: any): Alert {
    return {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      threshold: alert.threshold,
      currentValue: alert.currentValue,
      isActive: alert.isActive,
      createdAt: alert.createdAt,
      resolvedAt: alert.resolvedAt,
    };
  }

  /**
   * Aggregate metrics by interval
   * تجميع المقاييس حسب الفترة الزمنية
   */
  private aggregateMetrics(metrics: any[], interval: 'hour' | 'day'): SystemMetrics[] {
    // This would implement proper aggregation logic
    // For now, return simplified version
    return metrics.map(this.formatMetric);
  }
}
