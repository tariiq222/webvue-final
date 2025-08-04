import api from './api';

// Description: Get all notifications for the current user
// Endpoint: GET /api/notifications
// Request: { page?: number, limit?: number, category?: string, read?: boolean }
// Response: { notifications: Array<{_id: string, title: string, message: string, type: string, category: string, read: boolean, createdAt: string, data?: object}>, total: number, unreadCount: number }
export const getNotifications = (params?: { page?: number; limit?: number; category?: string; read?: boolean }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        notifications: [
          {
            _id: '1',
            title: 'Security Alert',
            message: 'Multiple failed login attempts detected from IP 203.0.113.1',
            type: 'security',
            category: 'authentication',
            read: false,
            createdAt: '2024-01-20T10:30:00Z',
            data: { ipAddress: '203.0.113.1', attempts: 5 }
          },
          {
            _id: '2',
            title: 'Module Update Available',
            message: 'User Management module v2.1.0 is ready for installation',
            type: 'info',
            category: 'system',
            read: false,
            createdAt: '2024-01-20T09:15:00Z',
            data: { moduleId: 'user-management', version: '2.1.0' }
          },
          {
            _id: '3',
            title: 'Integration Successful',
            message: 'Google Calendar integration has been successfully configured',
            type: 'success',
            category: 'integration',
            read: true,
            createdAt: '2024-01-20T08:45:00Z',
            data: { integrationId: 'google-calendar' }
          },
          {
            _id: '4',
            title: 'User Account Created',
            message: 'New user account created for john.doe@company.com',
            type: 'info',
            category: 'user',
            read: true,
            createdAt: '2024-01-20T08:30:00Z',
            data: { userId: 'user-123', email: 'john.doe@company.com' }
          },
          {
            _id: '5',
            title: 'System Backup Completed',
            message: 'Daily system backup completed successfully',
            type: 'success',
            category: 'system',
            read: true,
            createdAt: '2024-01-20T02:00:00Z',
            data: { backupSize: '2.4GB', duration: '45 minutes' }
          }
        ],
        total: 5,
        unreadCount: 2
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/notifications', { params });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Mark notification as read
// Endpoint: PUT /api/notifications/:id/read
// Request: {}
// Response: { success: boolean, message: string }
export const markNotificationAsRead = (notificationId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Notification marked as read'
      });
    }, 300);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/notifications/${notificationId}/read`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Mark all notifications as read
// Endpoint: PUT /api/notifications/mark-all-read
// Request: {}
// Response: { success: boolean, message: string }
export const markAllNotificationsAsRead = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'All notifications marked as read'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put('/api/notifications/mark-all-read');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Delete notification
// Endpoint: DELETE /api/notifications/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteNotification = (notificationId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Notification deleted successfully'
      });
    }, 300);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/notifications/${notificationId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}