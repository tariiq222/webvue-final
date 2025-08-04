import api from '@/api/api';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  actionUrl?: string;
  actionText?: string;
  userId: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

class InAppNotificationService {
  /**
   * Get user's notifications
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<{
    notifications: InAppNotification[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const params = new URLSearchParams();

      if (filters.isRead !== undefined) {
        params.append('isRead', filters.isRead.toString());
      }
      if (filters.type) {
        params.append('type', filters.type);
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters.offset) {
        params.append('offset', filters.offset.toString());
      }

      const response = await api.get(`/api/notifications?${params.toString()}`);

      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      return {
        notifications: response.data.notifications || [],
        total: response.data.total || 0,
        unreadCount: response.data.unreadCount || 0
      };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);

      // Enhanced error handling
      if (error?.code === 'ERR_NETWORK') {
        throw new Error('Network connection failed');
      } else if (error?.response?.status === 401) {
        throw new Error('Authentication required');
      } else if (error?.response?.status === 403) {
        throw new Error('Access denied');
      } else if (error?.response?.status >= 500) {
        throw new Error('Server error');
      }

      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/api/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/api/notifications/mark-all-read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<void> {
    try {
      await api.delete('/api/notifications/read');
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  }

  /**
   * Create a new notification (admin only)
   */
  async createNotification(notification: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    userId?: string; // If not provided, sends to all users
    actionUrl?: string;
    actionText?: string;
  }): Promise<InAppNotification> {
    try {
      const response = await api.post('/api/notifications', notification);
      return response.data.notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time notifications (WebSocket)
   */
  subscribeToNotifications(callback: (notification: InAppNotification) => void): () => void {
    // TODO: Implement WebSocket connection for real-time notifications
    console.log('WebSocket subscription for notifications not implemented yet');
    
    // Return unsubscribe function
    return () => {
      console.log('Unsubscribing from notifications');
    };
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<{
    emailNotifications: boolean;
    browserNotifications: boolean;
    soundEnabled: boolean;
    categories: string[];
  }> {
    try {
      const response = await api.get('/api/notifications/preferences');
      return response.data.preferences;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: {
    emailNotifications?: boolean;
    browserNotifications?: boolean;
    soundEnabled?: boolean;
    categories?: string[];
  }): Promise<void> {
    try {
      await api.patch('/api/notifications/preferences', preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getStatistics(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    recentActivity: Array<{
      date: string;
      count: number;
    }>;
  }> {
    try {
      const response = await api.get('/api/notifications/statistics');
      return response.data.statistics;
    } catch (error) {
      console.error('Error fetching notification statistics:', error);
      throw error;
    }
  }
}

export default new InAppNotificationService();
