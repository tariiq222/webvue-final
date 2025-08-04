import api from './api';
import { extractApiData, debugApiResponse } from '@/utils/apiHelpers';

// Description: Get list of all installed modules
// Endpoint: GET /api/modules
// Request: {}
// Response: { modules: Array<{_id: string, name: string, version: string, description: string, status: string, health: number, category: string, author: string, size: string, installedAt: string, lastUpdate: string, dependencies: string[]}> }
export const getModules = async (filters?: { category?: string; status?: string; search?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = queryString ? `/api/modules?${queryString}` : '/api/modules';
    
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching modules:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch modules');
  }
}

// Description: Upload and install a new module
// Endpoint: POST /api/modules/upload
// Request: FormData with module file
// Response: { success: boolean, message: string, module: {_id: string, name: string, version: string} }
export const uploadModule = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('module', file);
    
    const response = await api.post('/api/modules/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error uploading module:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to upload module');
  }
}

// Description: Toggle module active/inactive status
// Endpoint: PUT /api/modules/:id/toggle
// Request: { enabled: boolean }
// Response: { success: boolean, message: string }
export const toggleModule = async (moduleId: string, enabled: boolean) => {
  try {
    const response = await api.put(`/api/modules/${moduleId}/toggle`, { enabled });
    return response.data;
  } catch (error: any) {
    console.error('Error toggling module:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to toggle module');
  }
}

// Description: Delete/uninstall a module
// Endpoint: DELETE /api/modules/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteModule = async (moduleId: string) => {
  try {
    const response = await api.delete(`/api/modules/${moduleId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting module:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to delete module');
  }
}

// Description: Get modules that should appear in navigation
// Endpoint: GET /api/modules/navigation
// Request: {}
// Response: { modules: Array<{_id: string, name: string, icon: string, path: string, order: number}> }
export const getNavigationModules = async () => {
  try {
    const response = await api.get('/api/modules/navigation');
    debugApiResponse(response.data, 'getNavigationModules');

    // Extract data from nested structure {success, message, data}
    return extractApiData(response.data);
  } catch (error: any) {
    console.error('Error fetching navigation modules:', error);

    // Handle permission errors specifically
    if (error?.response?.status === 403) {
      const message = error?.response?.data?.message || 'Access denied';
      throw new Error(`Permission error: ${message}`);
    }

    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch navigation modules');
  }
}

// Description: Get module health and performance metrics
// Endpoint: GET /api/modules/:id/health
// Request: {}
// Response: { health: number, metrics: {cpu: number, memory: number, responseTime: number}, errors: string[] }
export const getModuleHealth = async (moduleId: string) => {
  try {
    const response = await api.get(`/api/modules/${moduleId}/health`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching module health:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch module health');
  }
}

// Monitoring APIs
export const getMonitoringStats = async () => {
  try {
    const response = await api.get('/api/modules/monitoring/stats');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching monitoring stats:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch monitoring stats');
  }
}

export const getMonitoringAlerts = async (params?: { limit?: number; type?: string }) => {
  try {
    const response = await api.get('/api/modules/monitoring/alerts', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching monitoring alerts:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch monitoring alerts');
  }
}

// Dependency APIs
export const getDependencyTree = async (moduleName: string, maxDepth?: number) => {
  try {
    const params = maxDepth ? { maxDepth } : {};
    const response = await api.get(`/api/modules/${moduleName}/dependencies/tree`, { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching dependency tree:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch dependency tree');
  }
}

export const getDependents = async (moduleName: string) => {
  try {
    const response = await api.get(`/api/modules/${moduleName}/dependents`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching dependents:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch dependents');
  }
}

export const validateDependencies = async (moduleConfig: { name: string; dependencies: string[] }) => {
  try {
    const response = await api.post('/api/modules/dependencies/validate', moduleConfig);
    return response.data;
  } catch (error: any) {
    console.error('Error validating dependencies:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to validate dependencies');
  }
}

export const getDependencyStats = async () => {
  try {
    const response = await api.get('/api/modules/dependencies/stats');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching dependency stats:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch dependency stats');
  }
}

export const checkUninstallSafety = async (moduleName: string) => {
  try {
    const response = await api.get(`/api/modules/${moduleName}/uninstall-check`);
    return response.data;
  } catch (error: any) {
    console.error('Error checking uninstall safety:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to check uninstall safety');
  }
}

// Update APIs
export const checkModuleUpdates = async (id: string) => {
  try {
    const response = await api.get(`/api/modules/${id}/check-updates`);
    return response.data;
  } catch (error: any) {
    console.error('Error checking for updates:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to check for updates');
  }
}

export const updateModule = async (id: string, updateFile: FormData) => {
  try {
    const response = await api.post(`/api/modules/${id}/update`, updateFile, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating module:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to update module');
  }
}

export const getUpdateHistory = async (id: string) => {
  try {
    const response = await api.get(`/api/modules/${id}/update-history`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching update history:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to fetch update history');
  }
}

export const bulkUpdateCheck = async (moduleIds: string[]) => {
  try {
    const response = await api.post('/api/modules/bulk-update-check', { moduleIds });
    return response.data;
  } catch (error: any) {
    console.error('Error checking bulk updates:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to check bulk updates');
  }
}