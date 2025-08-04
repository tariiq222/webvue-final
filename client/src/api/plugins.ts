/**
 * 🔌 Plugin API Client
 * عميل APIs البلوجينز
 */

import api from './api';
import { extractApiData, debugApiResponse } from '@/utils/apiHelpers';

export interface Plugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  version: string;
  author: string;
  authorEmail: string;
  category: string;
  tags: string[];
  status: 'active' | 'inactive' | 'error' | 'installing' | 'uninstalling';
  isCore: boolean;
  isVerified: boolean;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileHash: string;
  installPath: string;
  installedAt: string | null;
  lastActivated: string | null;
  lastDeactivated: string | null;
  downloads: number;
  rating: number;
  ratingCount: number;
  views: number;
  requirements: {
    minVersion: string;
    maxVersion: string | null;
    dependencies: string[];
    phpVersion: string | null;
    extensions: string[];
  };
  permissions: string[];
  securityScan: {
    status: 'pending' | 'passed' | 'failed' | 'warning';
    lastScan: string | null;
    issues: string[];
    score: number;
  };
  settings: Record<string, any>;
  defaultSettings: Record<string, any>;
  icon: string;
  screenshots: string[];
  changelog: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
  documentation: string;
  supportUrl: string;
  repositoryUrl: string;
  license: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  developerId: string | null;
  organizationId: string | null;
}

export interface PluginFilters {
  status?: string;
  category?: string;
  search?: string;
  isCore?: boolean;
  sortBy?: string;
  limit?: number;
}

export interface PluginStats {
  total: number;
  active: number;
  inactive: number;
  error: number;
  core: number;
  verified: number;
  totalDownloads: number;
  averageRating: number;
  categories: Record<string, number>;
}

export interface PluginUploadData {
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
}

/**
 * الحصول على جميع البلوجينز
 */
export const getPlugins = async (filters: PluginFilters = {}): Promise<{
  plugins: Plugin[];
  total: number;
  filters: PluginFilters;
}> => {
  try {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/api/plugins?${params.toString()}`);
    debugApiResponse(response.data, 'getPlugins');

    if (response.data.success) {
      return extractApiData(response.data);
    } else {
      throw new Error(response.data.message || 'فشل في جلب البلوجينز');
    }
  } catch (error: any) {
    console.error('Error fetching plugins:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في جلب البلوجينز');
  }
};

/**
 * الحصول على بلوجين بالمعرف
 */
export const getPluginById = async (id: string): Promise<Plugin> => {
  try {
    const response = await api.get(`/api/plugins/${id}`);

    if (response.data.success) {
      return response.data.data.plugin;
    } else {
      throw new Error(response.data.message || 'فشل في جلب البلوجين');
    }
  } catch (error: any) {
    console.error('Error fetching plugin by ID:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في جلب البلوجين');
  }
};

/**
 * الحصول على إحصائيات البلوجينز
 */
export const getPluginStats = async (): Promise<PluginStats> => {
  try {
    const response = await api.get('/api/plugins/stats');
    debugApiResponse(response.data, 'getPluginStats');

    if (response.data.success) {
      return extractApiData(response.data);
    } else {
      throw new Error(response.data.message || 'فشل في جلب الإحصائيات');
    }
  } catch (error: any) {
    console.error('Error fetching plugin stats:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في جلب الإحصائيات');
  }
};

/**
 * البحث في البلوجينز
 */
export const searchPlugins = async (query: string, filters: PluginFilters = {}): Promise<{
  plugins: Plugin[];
  total: number;
  query: string;
  filters: PluginFilters;
}> => {
  try {
    const params = new URLSearchParams();
    params.append('q', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/api/plugins/search?${params.toString()}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'فشل في البحث');
    }
  } catch (error: any) {
    console.error('Error searching plugins:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في البحث');
  }
};

/**
 * إنشاء بلوجين جديد
 */
export const createPlugin = async (pluginData: Partial<Plugin>): Promise<Plugin> => {
  try {
    const response = await api.post('/api/plugins', pluginData);
    
    if (response.data.success) {
      return response.data.data.plugin;
    } else {
      throw new Error(response.data.message || 'فشل في إنشاء البلوجين');
    }
  } catch (error: any) {
    console.error('Error creating plugin:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في إنشاء البلوجين');
  }
};

/**
 * تحديث بلوجين
 */
export const updatePlugin = async (id: string, updateData: Partial<Plugin>): Promise<Plugin> => {
  try {
    const response = await api.put(`/api/plugins/${id}`, updateData);
    
    if (response.data.success) {
      return response.data.data.plugin;
    } else {
      throw new Error(response.data.message || 'فشل في تحديث البلوجين');
    }
  } catch (error: any) {
    console.error('Error updating plugin:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في تحديث البلوجين');
  }
};

/**
 * حذف بلوجين
 */
export const deletePlugin = async (id: string): Promise<void> => {
  try {
    const response = await api.delete(`/api/plugins/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'فشل في حذف البلوجين');
    }
  } catch (error: any) {
    console.error('Error deleting plugin:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في حذف البلوجين');
  }
};

/**
 * تفعيل بلوجين
 */
export const activatePlugin = async (id: string): Promise<void> => {
  try {
    const response = await api.post(`/api/plugins/${id}/activate`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'فشل في تفعيل البلوجين');
    }
  } catch (error: any) {
    console.error('Error activating plugin:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في تفعيل البلوجين');
  }
};

/**
 * إيقاف بلوجين
 */
export const deactivatePlugin = async (id: string): Promise<void> => {
  try {
    const response = await api.post(`/api/plugins/${id}/deactivate`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'فشل في إيقاف البلوجين');
    }
  } catch (error: any) {
    console.error('Error deactivating plugin:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في إيقاف البلوجين');
  }
};

/**
 * الحصول على حالة البلوجين
 */
export const getPluginStatus = async (id: string): Promise<{
  id: string;
  name: string;
  status: string;
  lastActivated: string | null;
  lastDeactivated: string | null;
  securityScan: any;
}> => {
  try {
    const response = await api.get(`/api/plugins/${id}/status`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'فشل في جلب حالة البلوجين');
    }
  } catch (error: any) {
    console.error('Error fetching plugin status:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في جلب حالة البلوجين');
  }
};

/**
 * رفع ملف بلوجين
 */
export const uploadPlugin = async (file: File, metadata: PluginUploadData): Promise<Plugin> => {
  try {
    const formData = new FormData();
    formData.append('plugin', file);

    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await api.post('/api/plugins/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return response.data.data.plugin;
    } else {
      throw new Error(response.data.message || 'فشل في رفع البلوجين');
    }
  } catch (error: any) {
    console.error('Error uploading plugin:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في رفع البلوجين');
  }
};

/**
 * تثبيت بلوجين
 */
export const installPlugin = async (id: string): Promise<void> => {
  try {
    const response = await api.post(`/api/plugins/${id}/install`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'فشل في تثبيت البلوجين');
    }
  } catch (error: any) {
    console.error('Error installing plugin:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في تثبيت البلوجين');
  }
};

/**
 * إلغاء تثبيت بلوجين
 */
export const uninstallPlugin = async (id: string): Promise<void> => {
  try {
    const response = await api.post(`/api/plugins/${id}/uninstall`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'فشل في إلغاء تثبيت البلوجين');
    }
  } catch (error: any) {
    console.error('Error uninstalling plugin:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في إلغاء تثبيت البلوجين');
  }
};

/**
 * فحص سلامة البلوجين
 */
export const checkPluginIntegrity = async (id: string): Promise<{
  valid: boolean;
  issues: string[];
}> => {
  try {
    const response = await api.get(`/api/plugins/${id}/integrity`);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'فشل في فحص سلامة البلوجين');
    }
  } catch (error: any) {
    console.error('Error checking plugin integrity:', error);
    throw new Error(error.response?.data?.message || error.message || 'فشل في فحص سلامة البلوجين');
  }
};
