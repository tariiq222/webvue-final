/**
 * 🔔 Notification Service
 * خدمة الإشعارات
 * 
 * Business logic for notification management including creation,
 * delivery, and channel management.
 */

import { prisma } from '@/database/connection';
import { AppError } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';
import {
  calculatePagination,
  getPaginationOffset,
  getPrismaSearchFilter,
  getPrismaSortOptions,
} from '@/shared/utils/pagination';
import {
  Notification,
  CreateNotificationData,
  UpdateNotificationData,
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types';

export class NotificationService {
  /**
   * Get notifications for a user with pagination and filtering
   * الحصول على إشعارات المستخدم مع التصفح والتصفية
   */
  async getUserNotifications(
    userId: string,
    params: PaginationParams & {
      isRead?: boolean;
      type?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
    }
  ): Promise<PaginatedResponse<Notification>> {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      search,
      isRead,
      type,
      priority,
    } = params;

    // Build where clause
    const where: any = {
      userId,
      ...getPrismaSearchFilter(search, ['title', 'message']),
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    // Get total count
    const total = await prisma.notification.count({ where });

    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: getPrismaSortOptions(sortBy, sortOrder),
      skip: getPaginationOffset(page, limit),
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);

    return {
      success: true,
      data: notifications,
      pagination,
      message: 'Notifications retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all notifications (admin view) with pagination and filtering
   * الحصول على جميع الإشعارات (عرض المدير) مع التصفح والتصفية
   */
  async getAllNotifications(params: PaginationParams & {
    userId?: string;
    type?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    channel?: string;
  }): Promise<PaginatedResponse<Notification>> {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      search,
      userId,
      type,
      priority,
      channel,
    } = params;

    // Build where clause
    const where: any = {
      ...getPrismaSearchFilter(search, ['title', 'message']),
    };

    if (userId) {
      where.userId = userId;
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    if (channel) {
      where.channels = {
        has: channel,
      };
    }

    // Get total count
    const total = await prisma.notification.count({ where });

    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: getPrismaSortOptions(sortBy, sortOrder),
      skip: getPaginationOffset(page, limit),
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);

    return {
      success: true,
      data: notifications,
      pagination,
      message: 'Notifications retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create notification
   * إنشاء إشعار
   */
  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    const {
      userId,
      title,
      message,
      type = 'info',
      priority = 'medium',
      channels = ['in_app'],
      data = {},
      senderId,
      scheduledFor,
    } = notificationData;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        priority,
        channels,
        data,
        senderId,
        scheduledFor,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send notification through specified channels
    if (!scheduledFor || scheduledFor <= new Date()) {
      await this.sendNotification(notification);
    }

    logger.info('Notification created successfully', {
      notificationId: notification.id,
      userId,
      type,
      priority,
      channels,
    });

    return notification;
  }

  /**
   * Create bulk notifications
   * إنشاء إشعارات جماعية
   */
  async createBulkNotifications(
    userIds: string[],
    notificationData: Omit<CreateNotificationData, 'userId'>
  ): Promise<{ created: number; failed: number }> {
    let created = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.createNotification({ ...notificationData, userId });
        created++;
      } catch (error) {
        failed++;
        logger.error('Failed to create notification for user', { userId, error });
      }
    }

    logger.info('Bulk notifications created', { created, failed, total: userIds.length });

    return { created, failed };
  }

  /**
   * Mark notification as read
   * تمييز الإشعار كمقروء
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedNotification;
  }

  /**
   * Mark all notifications as read for a user
   * تمييز جميع الإشعارات كمقروءة للمستخدم
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    logger.info('All notifications marked as read', { userId, count: result.count });

    return { count: result.count };
  }

  /**
   * Delete notification
   * حذف الإشعار
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    logger.info('Notification deleted', { notificationId, userId });
  }

  /**
   * Get notification statistics for a user
   * الحصول على إحصائيات الإشعارات للمستخدم
   */
  async getUserNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    byType: Array<{ type: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
  }> {
    const [
      total,
      unread,
      byType,
      byPriority,
    ] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),
      prisma.notification.groupBy({
        by: ['priority'],
        where: { userId },
        _count: { priority: true },
      }),
    ]);

    return {
      total,
      unread,
      read: total - unread,
      byType: byType.map(item => ({ type: item.type, count: item._count.type })),
      byPriority: byPriority.map(item => ({ priority: item.priority, count: item._count.priority })),
    };
  }

  /**
   * Send notification through channels
   * إرسال الإشعار عبر القنوات
   */
  private async sendNotification(notification: Notification): Promise<void> {
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'in_app':
            // In-app notifications are already stored in database
            break;
          case 'email':
            await this.sendEmailNotification(notification);
            break;
          case 'sms':
            await this.sendSMSNotification(notification);
            break;
          case 'push':
            await this.sendPushNotification(notification);
            break;
          default:
            logger.warn('Unknown notification channel', { channel });
        }
      } catch (error) {
        logger.error('Failed to send notification through channel', {
          notificationId: notification.id,
          channel,
          error,
        });
      }
    }

    // Update notification as sent
    await prisma.notification.update({
      where: { id: notification.id },
      data: { sentAt: new Date() },
    });
  }

  /**
   * Send email notification
   * إرسال إشعار بريد إلكتروني
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    // This would integrate with an email service like SendGrid, AWS SES, etc.
    logger.info('Email notification sent', { notificationId: notification.id });
  }

  /**
   * Send SMS notification
   * إرسال إشعار رسالة نصية
   */
  private async sendSMSNotification(notification: Notification): Promise<void> {
    // This would integrate with an SMS service like Twilio, AWS SNS, etc.
    logger.info('SMS notification sent', { notificationId: notification.id });
  }

  /**
   * Send push notification
   * إرسال إشعار دفع
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    // This would integrate with a push notification service like Firebase, OneSignal, etc.
    logger.info('Push notification sent', { notificationId: notification.id });
  }
}
