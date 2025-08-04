import api from './api';
import { extractApiData, debugApiResponse } from '@/utils/apiHelpers';

// Description: Get dashboard statistics
// Endpoint: GET /api/dashboard/stats
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/dashboard/stats');
    debugApiResponse(response.data, 'getDashboardStats');

    // Extract data from nested structure {success, message, data}
    return extractApiData(response.data);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get recent activity
// Endpoint: GET /api/dashboard/recent-activity
export const getRecentActivity = async () => {
  try {
    const response = await api.get('/api/dashboard/recent-activity');
    debugApiResponse(response.data, 'getRecentActivity');

    // Extract data from nested structure {success, message, data}
    return extractApiData(response.data);
  } catch (error: any) {
    console.error('Error fetching recent activity:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};
