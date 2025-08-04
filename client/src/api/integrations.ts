import api from './api';

// Description: Get list of all integrations
// Endpoint: GET /api/integrations
// Request: {}
// Response: { integrations: Array<{_id: string, name: string, description: string, category: string, status: string, icon: string, provider: string, lastSync: string, config: object}> }
export const getIntegrations = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        integrations: [
          {
            _id: '1',
            name: 'Google Calendar',
            description: 'Sync events and manage calendar appointments',
            category: 'calendar',
            status: 'connected',
            icon: 'calendar',
            provider: 'google',
            lastSync: '2024-01-20T10:30:00Z',
            config: {
              apiKey: '***hidden***',
              endpoint: 'https://www.googleapis.com/calendar/v3'
            }
          },
          {
            _id: '2',
            name: 'Zoom Meetings',
            description: 'Create and manage video conferences',
            category: 'communication',
            status: 'connected',
            icon: 'video',
            provider: 'zoom',
            lastSync: '2024-01-20T09:15:00Z',
            config: {
              apiKey: '***hidden***',
              endpoint: 'https://api.zoom.us/v2'
            }
          },
          {
            _id: '3',
            name: 'Webex Teams',
            description: 'Team collaboration and video meetings',
            category: 'communication',
            status: 'disconnected',
            icon: 'video',
            provider: 'webex',
            lastSync: '2024-01-19T14:20:00Z',
            config: {
              apiKey: '',
              endpoint: 'https://webexapis.com/v1'
            }
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/integrations');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Toggle integration on/off
// Endpoint: PUT /api/integrations/:id/toggle
// Request: { enabled: boolean }
// Response: { success: boolean, message: string }
export const toggleIntegration = (integrationId: string, enabled: boolean) => {
  // Mocking the response with realistic behavior
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate occasional failures for testing
      if (Math.random() < 0.05) { // 5% failure rate
        reject(new Error('Network error or service unavailable'));
        return;
      }

      resolve({
        success: true,
        message: `Integration ${enabled ? 'connected' : 'disconnected'} successfully`,
        data: {
          integrationId,
          status: enabled ? 'connected' : 'disconnected',
          lastUpdated: new Date().toISOString()
        }
      });
    }, 300); // Reduced delay for better UX
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/integrations/${integrationId}/toggle`, { enabled });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Configure integration settings
// Endpoint: PUT /api/integrations/:id/config
// Request: { config: object }
// Response: { success: boolean, message: string }
export const configureIntegration = (integrationId: string, config: any) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Integration configured successfully'
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put(`/api/integrations/${integrationId}/config`, { config });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Test integration connection
// Endpoint: POST /api/integrations/:id/test
// Request: {}
// Response: { success: boolean, message: string, testResults: object }
export const testIntegration = (integrationId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Integration test completed successfully',
        testResults: {
          connectionStatus: 'success',
          responseTime: 120,
          lastTested: new Date().toISOString()
        }
      });
    }, 1500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post(`/api/integrations/${integrationId}/test`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}