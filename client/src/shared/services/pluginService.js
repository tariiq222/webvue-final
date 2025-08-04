/**
 * 🔌 Plugin Service
 * خدمة إدارة البلوجينز
 * 
 * خدمة للتعامل مع APIs البلوجينز والعمليات المختلفة
 */

import apiClient from './apiClient'

class PluginService {
  /**
   * جلب قائمة البلوجينز
   * Get plugins list
   */
  async getPlugins(filters = {}) {
    try {
      const response = await apiClient.get('/plugins', { params: filters })
      return response.data
    } catch (error) {
      console.error('خطأ في جلب البلوجينز:', error)
      throw error
    }
  }

  /**
   * جلب تفاصيل بلوجين
   * Get plugin details
   */
  async getPlugin(pluginId) {
    try {
      const response = await apiClient.get(`/plugins/${pluginId}`)
      return response.data
    } catch (error) {
      console.error('خطأ في جلب تفاصيل البلوجين:', error)
      throw error
    }
  }

  /**
   * رفع بلوجين جديد
   * Upload new plugin
   */
  async uploadPlugin(file, metadata, onProgress) {
    try {
      const formData = new FormData()
      formData.append('plugin', file)
      formData.append('metadata', JSON.stringify(metadata))

      const response = await apiClient.post('/plugins/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(progress)
          }
        }
      })

      return response.data
    } catch (error) {
      console.error('خطأ في رفع البلوجين:', error)
      throw error
    }
  }

  /**
   * بدء رفع مجزأ
   * Start chunked upload
   */
  async startChunkedUpload(filename, size, metadata) {
    try {
      const response = await apiClient.post('/plugins/upload/start', {
        filename,
        size,
        metadata
      })
      return response.data
    } catch (error) {
      console.error('خطأ في بدء الرفع المجزأ:', error)
      throw error
    }
  }

  /**
   * رفع جزء من الملف
   * Upload file chunk
   */
  async uploadChunk(uploadId, chunkIndex, chunkData) {
    try {
      const formData = new FormData()
      formData.append('chunk', new Blob([chunkData]))
      formData.append('chunkIndex', chunkIndex)

      const response = await apiClient.post(
        `/plugins/upload/${uploadId}/chunk`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('خطأ في رفع الجزء:', error)
      throw error
    }
  }

  /**
   * الحصول على حالة الرفع
   * Get upload status
   */
  async getUploadStatus(uploadId) {
    try {
      const response = await apiClient.get(`/plugins/upload/${uploadId}/status`)
      return response.data
    } catch (error) {
      console.error('خطأ في جلب حالة الرفع:', error)
      throw error
    }
  }

  /**
   * إلغاء الرفع
   * Cancel upload
   */
  async cancelUpload(uploadId) {
    try {
      const response = await apiClient.delete(`/plugins/upload/${uploadId}`)
      return response.data
    } catch (error) {
      console.error('خطأ في إلغاء الرفع:', error)
      throw error
    }
  }

  /**
   * تفعيل بلوجين
   * Activate plugin
   */
  async activatePlugin(pluginId) {
    try {
      const response = await apiClient.post(`/plugins/${pluginId}/activate`)
      return response.data
    } catch (error) {
      console.error('خطأ في تفعيل البلوجين:', error)
      throw error
    }
  }

  /**
   * تعطيل بلوجين
   * Deactivate plugin
   */
  async deactivatePlugin(pluginId) {
    try {
      const response = await apiClient.post(`/plugins/${pluginId}/deactivate`)
      return response.data
    } catch (error) {
      console.error('خطأ في تعطيل البلوجين:', error)
      throw error
    }
  }

  /**
   * حذف بلوجين
   * Delete plugin
   */
  async deletePlugin(pluginId) {
    try {
      const response = await apiClient.delete(`/plugins/${pluginId}`)
      return response.data
    } catch (error) {
      console.error('خطأ في حذف البلوجين:', error)
      throw error
    }
  }

  /**
   * تحديث بلوجين
   * Update plugin
   */
  async updatePlugin(pluginId) {
    try {
      const response = await apiClient.post(`/plugins/${pluginId}/update`)
      return response.data
    } catch (error) {
      console.error('خطأ في تحديث البلوجين:', error)
      throw error
    }
  }

  /**
   * جلب إعدادات البلوجين
   * Get plugin configuration
   */
  async getPluginConfig(pluginId) {
    try {
      const response = await apiClient.get(`/plugins/${pluginId}/config`)
      return response.data
    } catch (error) {
      console.error('خطأ في جلب إعدادات البلوجين:', error)
      throw error
    }
  }

  /**
   * حفظ إعدادات البلوجين
   * Save plugin configuration
   */
  async savePluginConfig(pluginId, config) {
    try {
      const response = await apiClient.put(`/plugins/${pluginId}/config`, config)
      return response.data
    } catch (error) {
      console.error('خطأ في حفظ إعدادات البلوجين:', error)
      throw error
    }
  }

  /**
   * جلب سجلات البلوجين
   * Get plugin logs
   */
  async getPluginLogs(pluginId, filters = {}) {
    try {
      const response = await apiClient.get(`/plugins/${pluginId}/logs`, {
        params: filters
      })
      return response.data
    } catch (error) {
      console.error('خطأ في جلب سجلات البلوجين:', error)
      throw error
    }
  }

  /**
   * مسح سجلات البلوجين
   * Clear plugin logs
   */
  async clearPluginLogs(pluginId) {
    try {
      const response = await apiClient.delete(`/plugins/${pluginId}/logs`)
      return response.data
    } catch (error) {
      console.error('خطأ في مسح سجلات البلوجين:', error)
      throw error
    }
  }

  /**
   * جلب مقاييس أداء البلوجين
   * Get plugin performance metrics
   */
  async getPluginMetrics(pluginId) {
    try {
      const response = await apiClient.get(`/plugins/${pluginId}/metrics`)
      return response.data
    } catch (error) {
      console.error('خطأ في جلب مقاييس الأداء:', error)
      throw error
    }
  }

  /**
   * جلب إحصائيات النظام
   * Get system statistics
   */
  async getSystemStats() {
    try {
      const response = await apiClient.get('/plugins/stats')
      return response.data
    } catch (error) {
      console.error('خطأ في جلب إحصائيات النظام:', error)
      throw error
    }
  }

  /**
   * جلب حالة النظام
   * Get system health
   */
  async getSystemHealth() {
    try {
      const response = await apiClient.get('/plugins/health')
      return response.data
    } catch (error) {
      console.error('خطأ في جلب حالة النظام:', error)
      throw error
    }
  }

  /**
   * البحث في البلوجينز
   * Search plugins
   */
  async searchPlugins(query, filters = {}) {
    try {
      const response = await apiClient.get('/plugins/search', {
        params: { q: query, ...filters }
      })
      return response.data
    } catch (error) {
      console.error('خطأ في البحث:', error)
      throw error
    }
  }

  /**
   * جلب البلوجينز المتاحة للتحديث
   * Get plugins with available updates
   */
  async getPluginsWithUpdates() {
    try {
      const response = await apiClient.get('/plugins/updates')
      return response.data
    } catch (error) {
      console.error('خطأ في جلب التحديثات المتاحة:', error)
      throw error
    }
  }

  /**
   * تحديث جميع البلوجينز
   * Update all plugins
   */
  async updateAllPlugins() {
    try {
      const response = await apiClient.post('/plugins/update-all')
      return response.data
    } catch (error) {
      console.error('خطأ في تحديث جميع البلوجينز:', error)
      throw error
    }
  }

  /**
   * تصدير إعدادات البلوجينز
   * Export plugin settings
   */
  async exportPluginSettings() {
    try {
      const response = await apiClient.get('/plugins/export', {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('خطأ في تصدير الإعدادات:', error)
      throw error
    }
  }

  /**
   * استيراد إعدادات البلوجينز
   * Import plugin settings
   */
  async importPluginSettings(file) {
    try {
      const formData = new FormData()
      formData.append('settings', file)

      const response = await apiClient.post('/plugins/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      console.error('خطأ في استيراد الإعدادات:', error)
      throw error
    }
  }

  /**
   * إعادة تشغيل بلوجين
   * Restart plugin
   */
  async restartPlugin(pluginId) {
    try {
      const response = await apiClient.post(`/plugins/${pluginId}/restart`)
      return response.data
    } catch (error) {
      console.error('خطأ في إعادة تشغيل البلوجين:', error)
      throw error
    }
  }

  /**
   * فحص تبعيات البلوجين
   * Check plugin dependencies
   */
  async checkPluginDependencies(pluginId) {
    try {
      const response = await apiClient.get(`/plugins/${pluginId}/dependencies`)
      return response.data
    } catch (error) {
      console.error('خطأ في فحص التبعيات:', error)
      throw error
    }
  }

  /**
   * تثبيت تبعيات البلوجين
   * Install plugin dependencies
   */
  async installPluginDependencies(pluginId) {
    try {
      const response = await apiClient.post(`/plugins/${pluginId}/dependencies/install`)
      return response.data
    } catch (error) {
      console.error('خطأ في تثبيت التبعيات:', error)
      throw error
    }
  }
}

// إنشاء instance واحد من الخدمة
const pluginService = new PluginService()

export default pluginService
