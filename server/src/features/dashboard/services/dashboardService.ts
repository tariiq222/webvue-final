/**
 * 📊 Dashboard Service
 * خدمة لوحة التحكم
 * 
 * Business logic for dashboard analytics and statistics.
 */

import { prisma } from '@/database/connection';
import { logger } from '@/shared/utils/logger';

export class DashboardService {
  /**
   * Get dashboard overview statistics
   * الحصول على إحصائيات نظرة عامة للوحة التحكم
   */
  async getOverviewStats(): Promise<{
    users: {
      total: number;
      active: number;
      newThisMonth: number;
      growth: number;
    };
    roles: {
      total: number;
      system: number;
      custom: number;
    };
    settings: {
      total: number;
      public: number;
      system: number;
    };
    activity: {
      totalActions: number;
      todayActions: number;
      weeklyGrowth: number;
    };
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User statistics
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersLastMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    const userGrowth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : 0;

    // Role statistics
    const [totalRoles, systemRoles] = await Promise.all([
      prisma.role.count(),
      prisma.role.count({ where: { isSystem: true } }),
    ]);

    // Settings statistics
    const [totalSettings, publicSettings, systemSettings] = await Promise.all([
      prisma.setting.count(),
      prisma.setting.count({ where: { isPublic: true } }),
      prisma.setting.count({ where: { isSystem: true } }),
    ]);

    // Activity statistics
    const [totalActions, todayActions, weeklyActions, lastWeekActions] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: startOfToday },
        },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: startOfWeek },
        },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
            lt: startOfWeek,
          },
        },
      }),
    ]);

    const weeklyGrowth = lastWeekActions > 0 
      ? ((weeklyActions - lastWeekActions) / lastWeekActions) * 100 
      : 0;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        growth: Math.round(userGrowth * 100) / 100,
      },
      roles: {
        total: totalRoles,
        system: systemRoles,
        custom: totalRoles - systemRoles,
      },
      settings: {
        total: totalSettings,
        public: publicSettings,
        system: systemSettings,
      },
      activity: {
        totalActions,
        todayActions,
        weeklyGrowth: Math.round(weeklyGrowth * 100) / 100,
      },
    };
  }

  /**
   * Get user activity chart data
   * الحصول على بيانات مخطط نشاط المستخدمين
   */
  async getUserActivityChart(days: number = 30): Promise<Array<{
    date: string;
    logins: number;
    registrations: number;
    actions: number;
  }>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Get daily data
    const dailyData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const [logins, registrations, actions] = await Promise.all([
        // Count login actions
        prisma.auditLog.count({
          where: {
            action: 'login',
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        // Count user registrations
        prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        // Count all actions
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
      ]);

      dailyData.push({
        date: date.toISOString().split('T')[0],
        logins,
        registrations,
        actions,
      });
    }

    return dailyData;
  }

  /**
   * Get top active users
   * الحصول على أكثر المستخدمين نشاطاً
   */
  async getTopActiveUsers(limit: number = 10): Promise<Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
    };
    actionCount: number;
    lastActivity: Date;
  }>> {
    const topUsers = await prisma.auditLog.groupBy({
      by: ['userId'],
      _count: {
        userId: true,
      },
      _max: {
        createdAt: true,
      },
      where: {
        userId: { not: null },
      },
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: limit,
    });

    const usersWithDetails = await Promise.all(
      topUsers.map(async (userStat) => {
        const user = await prisma.user.findUnique({
          where: { id: userStat.userId! },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        });

        return {
          user: user!,
          actionCount: userStat._count.userId,
          lastActivity: userStat._max.createdAt!,
        };
      })
    );

    return usersWithDetails;
  }

  /**
   * Get recent activities
   * الحصول على الأنشطة الحديثة
   */
  async getRecentActivities(limit: number = 20): Promise<Array<{
    id: string;
    action: string;
    resource: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    createdAt: Date;
    ipAddress: string;
  }>> {
    const activities = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      resource: activity.resource,
      user: activity.user || undefined,
      createdAt: activity.createdAt,
      ipAddress: activity.ipAddress,
    }));
  }

  /**
   * Get system health metrics
   * الحصول على مقاييس صحة النظام
   */
  async getSystemHealth(): Promise<{
    database: {
      status: 'healthy' | 'warning' | 'error';
      connections: number;
      responseTime: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    storage: {
      used: number;
      total: number;
      percentage: number;
    };
    uptime: number;
  }> {
    const startTime = Date.now();
    
    // Test database connection
    let dbStatus: 'healthy' | 'warning' | 'error' = 'healthy';
    let dbResponseTime = 0;
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - startTime;
      
      if (dbResponseTime > 1000) {
        dbStatus = 'warning';
      } else if (dbResponseTime > 5000) {
        dbStatus = 'error';
      }
    } catch (error) {
      dbStatus = 'error';
      dbResponseTime = Date.now() - startTime;
    }

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
    const usedMemory = memoryUsage.heapUsed;

    // Get storage info (simplified - in production, use proper disk usage library)
    const storageUsed = 0; // Placeholder
    const storageTotal = 100 * 1024 * 1024 * 1024; // 100GB placeholder

    return {
      database: {
        status: dbStatus,
        connections: 1, // Placeholder - would need connection pool info
        responseTime: dbResponseTime,
      },
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: Math.round((usedMemory / totalMemory) * 100),
      },
      storage: {
        used: storageUsed,
        total: storageTotal,
        percentage: Math.round((storageUsed / storageTotal) * 100),
      },
      uptime: process.uptime(),
    };
  }

  /**
   * Get action distribution statistics
   * الحصول على إحصائيات توزيع الإجراءات
   */
  async getActionDistribution(): Promise<Array<{
    action: string;
    count: number;
    percentage: number;
  }>> {
    const actionStats = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    });

    const totalActions = actionStats.reduce((sum, stat) => sum + stat._count.action, 0);

    return actionStats.map(stat => ({
      action: stat.action,
      count: stat._count.action,
      percentage: Math.round((stat._count.action / totalActions) * 100 * 100) / 100,
    }));
  }

  /**
   * Get resource usage statistics
   * الحصول على إحصائيات استخدام الموارد
   */
  async getResourceUsage(): Promise<Array<{
    resource: string;
    count: number;
    percentage: number;
  }>> {
    const resourceStats = await prisma.auditLog.groupBy({
      by: ['resource'],
      _count: {
        resource: true,
      },
      orderBy: {
        _count: {
          resource: 'desc',
        },
      },
    });

    const totalResources = resourceStats.reduce((sum, stat) => sum + stat._count.resource, 0);

    return resourceStats.map(stat => ({
      resource: stat.resource,
      count: stat._count.resource,
      percentage: Math.round((stat._count.resource / totalResources) * 100 * 100) / 100,
    }));
  }
}
