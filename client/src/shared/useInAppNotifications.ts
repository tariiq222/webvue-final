import { useState, useEffect, useCallback } from 'react';
import inAppNotificationService, { InAppNotification, NotificationFilters } from '@/services/inAppNotificationService';

interface UseInAppNotificationsReturn {
  notifications: InAppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  loadNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export function useInAppNotifications(
  initialFilters: NotificationFilters = { limit: 20 }
): UseInAppNotificationsReturn {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFailureTime, setLastFailureTime] = useState<number>(0);

  // Load notifications
  const loadNotifications = useCallback(async (filters: NotificationFilters = initialFilters) => {
    // Prevent rapid retries - wait at least 2 minutes after last failure
    const now = Date.now();
    if (lastFailureTime && (now - lastFailureTime) < 120000) {
      console.log('Skipping notification request - too soon after last failure');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await inAppNotificationService.getNotifications(filters);
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      setLastFailureTime(0); // Reset failure time on success
    } catch (err: any) {
      console.error('Error loading notifications:', err);

      // More specific error handling
      let errorMessage = 'Failed to load notifications';
      if (err?.code === 'ERR_NETWORK') {
        errorMessage = 'Network connection failed. Please check your connection.';
      } else if (err?.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err?.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view notifications.';
      } else if (err?.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLastFailureTime(now); // Record failure time
    } finally {
      setLoading(false);
    }
  }, [initialFilters]); // Remove lastFailureTime dependency to prevent infinite loop

  // Refresh unread count only
  const refreshUnreadCount = useCallback(async () => {
    // Prevent rapid retries - wait at least 30 seconds after last failure
    const now = Date.now();
    if (lastFailureTime && (now - lastFailureTime) < 30000) {
      console.log('Skipping unread count request - too soon after last failure');
      return;
    }

    try {
      const count = await inAppNotificationService.getUnreadCount();
      setUnreadCount(count);
      setLastFailureTime(0); // Reset failure time on success
    } catch (err) {
      console.error('Error refreshing unread count:', err);
      setLastFailureTime(now); // Record failure time
    }
  }, []); // Remove lastFailureTime dependency

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await inAppNotificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await inAppNotificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await inAppNotificationService.deleteNotification(notificationId);
      
      // Update local state
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (notificationToDelete && !notificationToDelete.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, [notifications]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      await inAppNotificationService.deleteAllRead();
      
      // Update local state - keep only unread notifications
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete read notifications');
    }
  }, []);

  // Load notifications on mount only
  useEffect(() => {
    loadNotifications();
  }, []); // Empty dependency array to run only once on mount

  // Set up real-time subscription (when implemented)
  useEffect(() => {
    const unsubscribe = inAppNotificationService.subscribeToNotifications((newNotification) => {
      // Add new notification to the beginning of the list
      setNotifications(prev => [newNotification, ...prev]);
      
      // Update unread count if notification is unread
      if (!newNotification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, []);

  // Periodic refresh of unread count (every 2 minutes to reduce server load)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if not currently loading to prevent multiple concurrent requests
      if (!loading) {
        refreshUnreadCount();
      }
    }, 120000); // Increased to 2 minutes

    return () => clearInterval(interval);
  }, [refreshUnreadCount, loading]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshUnreadCount
  };
}
