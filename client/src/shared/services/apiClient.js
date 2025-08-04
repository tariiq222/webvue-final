/**
 * 🌐 API Client
 * عميل API
 * 
 * عميل HTTP للتعامل مع APIs الخلفية
 */

import axios from 'axios'

// إنشاء instance من axios
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 ثانية
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // إضافة token المصادقة إذا كان متوفراً
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // إضافة معرف الطلب للتتبع
    config.headers['X-Request-ID'] = generateRequestId()

    // تسجيل الطلب في وضع التطوير
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params
      })
    }

    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // تسجيل الاستجابة في وضع التطوير
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }

    return response
  },
  (error) => {
    // معالجة أخطاء الاستجابة
    const errorInfo = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method
    }

    console.error('❌ API Error:', errorInfo)

    // معالجة أخطاء المصادقة
    if (error.response?.status === 401) {
      handleAuthError()
    }

    // معالجة أخطاء الخادم
    if (error.response?.status >= 500) {
      handleServerError(error)
    }

    // معالجة أخطاء الشبكة
    if (!error.response) {
      handleNetworkError(error)
    }

    return Promise.reject(error)
  }
)

/**
 * معالجة خطأ المصادقة
 * Handle authentication error
 */
function handleAuthError() {
  // إزالة token المنتهي الصلاحية
  localStorage.removeItem('authToken')
  
  // إعادة توجيه لصفحة تسجيل الدخول
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

/**
 * معالجة خطأ الخادم
 * Handle server error
 */
function handleServerError(error) {
  // إظهار رسالة خطأ عامة
  const message = 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
  
  // يمكن إضافة نظام إشعارات هنا
  if (window.showToast) {
    window.showToast(message, 'error')
  }
}

/**
 * معالجة خطأ الشبكة
 * Handle network error
 */
function handleNetworkError(error) {
  const message = 'فشل في الاتصال بالخادم. تحقق من اتصال الإنترنت.'
  
  // يمكن إضافة نظام إشعارات هنا
  if (window.showToast) {
    window.showToast(message, 'error')
  }
}

/**
 * توليد معرف طلب فريد
 * Generate unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * دوال مساعدة للطلبات الشائعة
 * Helper functions for common requests
 */

// GET request with error handling
apiClient.safeGet = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config)
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: error.response?.data || error.message }
  }
}

// POST request with error handling
apiClient.safePost = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config)
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: error.response?.data || error.message }
  }
}

// PUT request with error handling
apiClient.safePut = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.put(url, data, config)
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: error.response?.data || error.message }
  }
}

// DELETE request with error handling
apiClient.safeDelete = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config)
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: error.response?.data || error.message }
  }
}

// Upload file with progress
apiClient.uploadFile = async (url, file, onProgress = null, additionalData = {}) => {
  const formData = new FormData()
  formData.append('file', file)
  
  // إضافة بيانات إضافية
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key])
  })

  try {
    const response = await apiClient.post(url, formData, {
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

    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: error.response?.data || error.message }
  }
}

// Download file
apiClient.downloadFile = async (url, filename = null) => {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob'
    })

    // إنشاء رابط تحميل
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.response?.data || error.message }
  }
}

// Retry request with exponential backoff
apiClient.retryRequest = async (requestFn, maxRetries = 3, baseDelay = 1000) => {
  let lastError = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }

      // حساب تأخير متزايد
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      console.log(`🔄 إعادة المحاولة ${attempt}/${maxRetries} بعد ${delay}ms`)
    }
  }

  throw lastError
}

// Batch requests
apiClient.batchRequests = async (requests, concurrency = 5) => {
  const results = []
  const errors = []

  // تقسيم الطلبات إلى مجموعات
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency)
    
    try {
      const batchResults = await Promise.allSettled(
        batch.map(request => request())
      )

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          errors.push({
            index: i + index,
            error: result.reason
          })
        }
      })
    } catch (error) {
      console.error('❌ خطأ في تنفيذ مجموعة الطلبات:', error)
    }
  }

  return { results, errors }
}

// Health check
apiClient.healthCheck = async () => {
  try {
    const response = await apiClient.get('/health', { timeout: 5000 })
    return response.status === 200
  } catch (error) {
    return false
  }
}

// Set authentication token
apiClient.setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token)
    apiClient.defaults.headers.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem('authToken')
    delete apiClient.defaults.headers.Authorization
  }
}

// Clear authentication
apiClient.clearAuth = () => {
  localStorage.removeItem('authToken')
  delete apiClient.defaults.headers.Authorization
}

export default apiClient
