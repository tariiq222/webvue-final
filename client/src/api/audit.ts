import api from './api';

// Description: Get audit logs with filtering options
// Endpoint: GET /api/audit/logs
// Request: { search?: string, category?: string, severity?: string, dateFrom?: string, dateTo?: string }
// Response: { logs: Array<{_id: string, timestamp: string, user: string, action: string, resource: string, details: string, ipAddress: string, userAgent: string, severity: string, category: string, success: boolean}> }
export const getAuditLogs = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        logs: [
          {
            _id: '1',
            timestamp: '2024-01-20T10:30:00Z',
            user: 'john.doe@company.com',
            action: 'User login successful',
            resource: '/auth/login',
            details: 'User successfully authenticated with email and password',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            severity: 'low',
            category: 'authentication',
            success: true
          },
          {
            _id: '2',
            timestamp: '2024-01-20T10:25:00Z',
            user: 'jane.smith@company.com',
            action: 'Role permissions updated',
            resource: '/roles/manager',
            details: 'Updated permissions for Manager role - added user.create permission',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            severity: 'medium',
            category: 'authorization',
            success: true
          },
          {
            _id: '3',
            timestamp: '2024-01-20T10:20:00Z',
            user: 'system',
            action: 'Module health check failed',
            resource: '/modules/security-monitor',
            details: 'Security Monitor module failed health check - CPU usage exceeded threshold',
            ipAddress: '127.0.0.1',
            userAgent: 'System/1.0',
            severity: 'high',
            category: 'system',
            success: false
          },
          {
            _id: '4',
            timestamp: '2024-01-20T10:15:00Z',
            user: 'admin@company.com',
            action: 'User account created',
            resource: '/users',
            details: 'New user account created for bob.wilson@company.com',
            ipAddress: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            severity: 'medium',
            category: 'data',
            success: true
          },
          {
            _id: '5',
            timestamp: '2024-01-20T10:10:00Z',
            user: 'unknown',
            action: 'Failed login attempt',
            resource: '/auth/login',
            details: 'Multiple failed login attempts detected from IP address',
            ipAddress: '203.0.113.1',
            userAgent: 'curl/7.68.0',
            severity: 'critical',
            category: 'authentication',
            success: false
          },
          {
            _id: '6',
            timestamp: '2024-01-20T10:05:00Z',
            user: 'admin@company.com',
            action: 'System configuration updated',
            resource: '/settings/security',
            details: 'Updated password policy settings - increased minimum length to 12 characters',
            ipAddress: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            severity: 'high',
            category: 'system',
            success: true
          },
          {
            _id: '7',
            timestamp: '2024-01-20T10:00:00Z',
            user: 'jane.smith@company.com',
            action: 'Module installed',
            resource: '/modules/analytics-dashboard',
            details: 'Analytics Dashboard module v3.0.1 installed successfully',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            severity: 'medium',
            category: 'system',
            success: true
          },
          {
            _id: '8',
            timestamp: '2024-01-20T09:55:00Z',
            user: 'john.doe@company.com',
            action: 'Data export requested',
            resource: '/export/users',
            details: 'User data export requested for compliance audit',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            severity: 'low',
            category: 'data',
            success: true
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/audit/logs');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Export audit logs to file
// Endpoint: POST /api/audit/export
// Request: { format: string, filters: object }
// Response: { success: boolean, message: string, downloadUrl: string }
export const exportAuditLogs = (filters: any) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Audit logs exported successfully',
        downloadUrl: '/downloads/audit-logs-export.csv'
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/audit/export', { filters });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}