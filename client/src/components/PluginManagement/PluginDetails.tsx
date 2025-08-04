import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface Plugin {
  id: number
  name: string
  version: string
  description: string
  author: string
  status: 'active' | 'inactive' | 'pending' | 'error'
  icon?: string
  size: number
  installedAt: Date
  lastUpdated: Date
  hasUpdate: boolean
  features?: string[]
}

interface Config {
  autoEnable: boolean
  logLevel: string
  maxMemory: number
  timeout: number
}

interface LogEntry {
  id: number
  timestamp: Date
  level: string
  message: string
}

interface Performance {
  cpu: number
  memory: number
  requests: number
  responseTime: number
}

const PluginDetails: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [logFilter, setLogFilter] = useState('all')

  const tabs = [
    { key: 'overview', label: 'نظرة عامة', icon: 'fas fa-info-circle' },
    { key: 'configuration', label: 'الإعدادات', icon: 'fas fa-cog' },
    { key: 'logs', label: 'السجلات', icon: 'fas fa-file-alt' },
    { key: 'performance', label: 'الأداء', icon: 'fas fa-chart-line' }
  ]

  const [plugin, setPlugin] = useState<Plugin>({
    id: 1,
    name: 'Analytics Dashboard',
    version: '2.1.0',
    description: 'لوحة تحكم شاملة لتحليل البيانات والإحصائيات مع دعم التقارير المتقدمة والرسوم البيانية التفاعلية',
    author: 'WebCore Team',
    status: 'active',
    icon: 'fas fa-chart-bar',
    size: 2048000,
    installedAt: new Date('2024-01-01'),
    lastUpdated: new Date('2024-01-15'),
    hasUpdate: false,
    features: [
      'تحليل البيانات في الوقت الفعلي',
      'رسوم بيانية تفاعلية',
      'تقارير مخصصة',
      'تصدير البيانات',
      'إشعارات ذكية'
    ]
  })

  const [config, setConfig] = useState<Config>({
    autoEnable: true,
    logLevel: 'info',
    maxMemory: 256,
    timeout: 30
  })

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      timestamp: new Date(),
      level: 'info',
      message: 'تم تشغيل البلوجين بنجاح'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 60000),
      level: 'warning',
      message: 'استخدام الذاكرة مرتفع: 85%'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 120000),
      level: 'error',
      message: 'فشل في الاتصال بقاعدة البيانات'
    }
  ])

  const [performance, setPerformance] = useState<Performance>({
    cpu: 15,
    memory: 128,
    requests: 1247,
    responseTime: 45
  })

  useEffect(() => {
    if (id) {
      loadPluginDetails(id)
    }
  }, [id])

  const loadPluginDetails = async (pluginId: string) => {
    // محاكاة تحميل تفاصيل البلوجين
    console.log('تحميل تفاصيل البلوجين:', pluginId)
  }

  const activatePlugin = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setPlugin(prev => ({ ...prev, status: 'active' }))
    } catch (error) {
      console.error('فشل في تفعيل البلوجين')
    } finally {
      setLoading(false)
    }
  }

  const deactivatePlugin = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPlugin(prev => ({ ...prev, status: 'inactive' }))
    } catch (error) {
      console.error('فشل في تعطيل البلوجين')
    } finally {
      setLoading(false)
    }
  }

  const openSettings = () => {
    setActiveTab('configuration')
  }

  const saveConfig = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('تم حفظ الإعدادات')
    } catch (error) {
      console.error('فشل في حفظ الإعدادات')
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const downloadLogs = () => {
    console.log('تم بدء تحميل السجلات')
  }

  const updatePlugin = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      setPlugin(prev => ({ 
        ...prev, 
        hasUpdate: false, 
        version: '2.2.0' 
      }))
    } catch (error) {
      console.error('فشل في تحديث البلوجين')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    const statusTexts: { [key: string]: string } = {
      active: 'نشط',
      inactive: 'غير نشط',
      pending: 'معلق',
      error: 'خطأ'
    }
    return statusTexts[status] || status
  }

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: string } = {
      active: 'fas fa-check-circle',
      inactive: 'fas fa-pause-circle',
      pending: 'fas fa-clock',
      error: 'fas fa-exclamation-circle'
    }
    return icons[status] || 'fas fa-question-circle'
  }

  const getUptime = () => {
    return '2 أيام، 14 ساعة'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date))
  }

  const formatLogTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredLogs = logFilter === 'all' 
    ? logs 
    : logs.filter(log => log.level === logFilter)

  return (
    <div className="plugin-details p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="details-header flex items-center gap-6 mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <button 
          className="back-btn bg-gray-100 hover:bg-gray-200 p-3 rounded-lg flex items-center gap-2 text-gray-700 font-medium"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-right"></i>
          العودة
        </button>
        
        <div className="plugin-header-info flex items-center gap-5 flex-1">
          <div className="plugin-icon w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <i className={`${plugin.icon || 'fas fa-puzzle-piece'} text-white text-2xl`}></i>
          </div>
          
          <div className="plugin-info">
            <h1 className="text-2xl font-bold text-gray-900">{plugin.name}</h1>
            <p className="text-gray-600 mt-1">{plugin.description}</p>
            <div className="plugin-meta flex items-center gap-4 mt-3">
              <span className="version text-gray-500 text-sm">الإصدار {plugin.version}</span>
              <span className="author text-gray-500 text-sm">بواسطة {plugin.author}</span>
              <span className={`status px-3 py-1 rounded-full text-xs font-medium ${
                plugin.status === 'active' ? 'bg-green-100 text-green-800' :
                plugin.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                plugin.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {getStatusText(plugin.status)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="header-actions flex gap-3">
          {plugin.status === 'inactive' && (
            <button 
              className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={activatePlugin}
              disabled={loading}
            >
              <i className="fas fa-play"></i>
              تفعيل
            </button>
          )}
          
          {plugin.status === 'active' && (
            <button 
              className="btn bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={deactivatePlugin}
              disabled={loading}
            >
              <i className="fas fa-pause"></i>
              تعطيل
            </button>
          )}
          
          <button 
            className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={openSettings}
          >
            <i className="fas fa-cog"></i>
            الإعدادات
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container mb-6">
        <div className="tabs flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button 
              key={tab.key}
              className={`tab flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.key 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Plugin Information */}
              <div className="info-card bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات البلوجين</h3>
                <div className="info-list space-y-3">
                  <div className="info-item flex justify-between">
                    <span className="label text-gray-600 font-medium">الاسم:</span>
                    <span className="value text-gray-900 font-semibold">{plugin.name}</span>
                  </div>
                  <div className="info-item flex justify-between">
                    <span className="label text-gray-600 font-medium">الإصدار:</span>
                    <span className="value text-gray-900 font-semibold">{plugin.version}</span>
                  </div>
                  <div className="info-item flex justify-between">
                    <span className="label text-gray-600 font-medium">المؤلف:</span>
                    <span className="value text-gray-900 font-semibold">{plugin.author}</span>
                  </div>
                  <div className="info-item flex justify-between">
                    <span className="label text-gray-600 font-medium">الحجم:</span>
                    <span className="value text-gray-900 font-semibold">{formatFileSize(plugin.size)}</span>
                  </div>
                  <div className="info-item flex justify-between">
                    <span className="label text-gray-600 font-medium">تاريخ التثبيت:</span>
                    <span className="value text-gray-900 font-semibold">{formatDate(plugin.installedAt)}</span>
                  </div>
                  <div className="info-item flex justify-between">
                    <span className="label text-gray-600 font-medium">آخر تحديث:</span>
                    <span className="value text-gray-900 font-semibold">{formatDate(plugin.lastUpdated)}</span>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="status-card bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">حالة البلوجين</h3>
                <div className="status-info space-y-4">
                  <div className={`status-indicator flex items-center gap-2 font-semibold ${
                    plugin.status === 'active' ? 'text-green-600' :
                    plugin.status === 'inactive' ? 'text-gray-600' :
                    plugin.status === 'error' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    <i className={getStatusIcon(plugin.status)}></i>
                    <span>{getStatusText(plugin.status)}</span>
                  </div>
                  
                  {plugin.status === 'active' && (
                    <div className="uptime flex items-center gap-2 text-gray-600 text-sm">
                      <i className="fas fa-clock"></i>
                      <span>وقت التشغيل: {getUptime()}</span>
                    </div>
                  )}
                  
                  {plugin.hasUpdate && (
                    <div className="update-available flex items-center gap-2 text-blue-600 text-sm">
                      <i className="fas fa-download"></i>
                      <span>تحديث متاح</span>
                      <button 
                        className="btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        onClick={updatePlugin}
                      >
                        تحديث الآن
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="description-card bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">الوصف</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{plugin.description}</p>
              
              {plugin.features && (
                <div className="features">
                  <h4 className="font-semibold text-gray-900 mb-2">الميزات:</h4>
                  <ul className="space-y-1">
                    {plugin.features.map((feature, index) => (
                      <li key={index} className="text-gray-700 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'configuration' && (
          <div className="configuration-tab max-w-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">إعدادات البلوجين</h3>
            
            <div className="space-y-6">
              <div className="form-group">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">تفعيل البلوجين تلقائياً</span>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={config.autoEnable}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, autoEnable: e.target.checked }))
                        saveConfig()
                      }}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      config.autoEnable ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        config.autoEnable ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </div>
                </label>
              </div>
              
              <div className="form-group">
                <label className="block text-gray-700 font-medium mb-2">مستوى السجلات</label>
                <select 
                  value={config.logLevel} 
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, logLevel: e.target.value }))
                    saveConfig()
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="error">أخطاء فقط</option>
                  <option value="warning">تحذيرات وأخطاء</option>
                  <option value="info">معلومات عامة</option>
                  <option value="debug">تفصيلي</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="block text-gray-700 font-medium mb-2">الحد الأقصى للذاكرة (MB)</label>
                <input 
                  type="number" 
                  value={config.maxMemory}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, maxMemory: parseInt(e.target.value) }))
                    saveConfig()
                  }}
                  min="64"
                  max="1024"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-700 font-medium mb-2">مهلة الاستجابة (ثانية)</label>
                <input 
                  type="number" 
                  value={config.timeout}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))
                    saveConfig()
                  }}
                  min="5"
                  max="300"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="logs-tab">
            <div className="logs-header flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold text-gray-900">سجلات البلوجين</h3>
              <div className="logs-actions flex gap-3">
                <select 
                  value={logFilter} 
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">جميع السجلات</option>
                  <option value="error">أخطاء</option>
                  <option value="warning">تحذيرات</option>
                  <option value="info">معلومات</option>
                </select>
                <button 
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                  onClick={clearLogs}
                >
                  <i className="fas fa-trash"></i>
                  مسح السجلات
                </button>
                <button 
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                  onClick={downloadLogs}
                >
                  <i className="fas fa-download"></i>
                  تحميل
                </button>
              </div>
            </div>
            
            <div className="logs-container bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id}
                  className={`log-entry flex gap-3 py-2 text-sm border-b border-gray-700 last:border-b-0 ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warning' ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <div className="log-time text-gray-500 min-w-20">{formatLogTime(log.timestamp)}</div>
                  <div className={`log-level min-w-16 font-semibold ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {log.level.toUpperCase()}
                  </div>
                  <div className="log-message flex-1">{log.message}</div>
                </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="no-logs text-center py-8 text-gray-500">
                  <i className="fas fa-file-alt text-2xl mb-3"></i>
                  <p>لا توجد سجلات</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="performance-tab">
            <div className="performance-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="metric-card bg-gray-50 rounded-xl p-5 text-center">
                <h4 className="text-gray-600 text-sm font-medium mb-2">استخدام المعالج</h4>
                <div className="metric-value text-3xl font-bold text-gray-900 mb-3">{performance.cpu}%</div>
                <div className="metric-chart w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="chart-bar h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300"
                    style={{ width: `${performance.cpu}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="metric-card bg-gray-50 rounded-xl p-5 text-center">
                <h4 className="text-gray-600 text-sm font-medium mb-2">استخدام الذاكرة</h4>
                <div className="metric-value text-3xl font-bold text-gray-900 mb-3">{performance.memory}MB</div>
                <div className="metric-chart w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="chart-bar h-full bg-gradient-to-r from-green-500 to-green-700 transition-all duration-300"
                    style={{ width: `${(performance.memory / config.maxMemory) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="metric-card bg-gray-50 rounded-xl p-5 text-center">
                <h4 className="text-gray-600 text-sm font-medium mb-2">عدد الطلبات</h4>
                <div className="metric-value text-3xl font-bold text-gray-900">{performance.requests.toLocaleString()}</div>
              </div>
              
              <div className="metric-card bg-gray-50 rounded-xl p-5 text-center">
                <h4 className="text-gray-600 text-sm font-medium mb-2">متوسط وقت الاستجابة</h4>
                <div className="metric-value text-3xl font-bold text-gray-900">{performance.responseTime}ms</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PluginDetails
