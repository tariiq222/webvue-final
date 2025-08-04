import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PluginDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  
  const [stats, setStats] = useState({
    totalPlugins: 0,
    activePlugins: 0,
    pendingPlugins: 0,
    errorPlugins: 0
  })
  
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  
  const [systemHealth, setSystemHealth] = useState({
    registry: 'healthy',
    upload: 'healthy',
    security: 'healthy',
    events: 'healthy'
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      await loadStats()
      await loadRecentActivity()
      await loadSystemHealth()
    } catch (error) {
      console.error('خطأ في تحميل بيانات لوحة التحكم:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    setStats({
      totalPlugins: 12,
      activePlugins: 8,
      pendingPlugins: 2,
      errorPlugins: 1
    })
  }

  const loadRecentActivity = async () => {
    setRecentActivities([
      {
        id: 1,
        type: 'upload',
        title: 'تم رفع بلوجين جديد',
        description: 'تم رفع بلوجين "Analytics Plugin" بنجاح',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'success'
      },
      {
        id: 2,
        type: 'activation',
        title: 'تم تفعيل بلوجين',
        description: 'تم تفعيل بلوجين "Email Notifications"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'success'
      }
    ])
  }

  const loadSystemHealth = async () => {
    setSystemHealth({
      registry: 'healthy',
      upload: 'healthy',
      security: 'warning',
      events: 'healthy'
    })
  }

  const refreshData = async () => {
    await loadDashboardData()
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`
    } else if (hours < 24) {
      return `منذ ${hours} ساعة`
    } else {
      return `منذ ${days} يوم`
    }
  }

  return (
    <div className="plugin-dashboard p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="dashboard-header flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
        <div className="header-content">
          <h1 className="dashboard-title text-3xl font-bold text-gray-900 flex items-center gap-3">
            <i className="fas fa-puzzle-piece text-blue-600"></i>
            إدارة البلوجينز
          </h1>
          <p className="dashboard-subtitle text-gray-600 mt-2">
            إدارة وتكوين البلوجينز الخارجية للنظام
          </p>
        </div>
        
        <div className="header-actions flex gap-3">
          <button 
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => setShowUploadModal(true)}
          >
            <i className="fas fa-upload"></i>
            رفع بلوجين جديد
          </button>
          
          <button 
            className="btn btn-secondary bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={refreshData}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
            تحديث
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="stat-icon w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <i className="fas fa-puzzle-piece text-blue-600 text-xl"></i>
          </div>
          <div className="stat-content">
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalPlugins}</h3>
            <p className="text-gray-600 text-sm">إجمالي البلوجينز</p>
          </div>
        </div>

        <div className="stat-card bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="stat-icon w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i className="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
          <div className="stat-content">
            <h3 className="text-2xl font-bold text-gray-900">{stats.activePlugins}</h3>
            <p className="text-gray-600 text-sm">البلوجينز النشطة</p>
          </div>
        </div>

        <div className="stat-card bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="stat-icon w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <i className="fas fa-clock text-yellow-600 text-xl"></i>
          </div>
          <div className="stat-content">
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingPlugins}</h3>
            <p className="text-gray-600 text-sm">في انتظار المراجعة</p>
          </div>
        </div>

        <div className="stat-card bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="stat-icon w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
          </div>
          <div className="stat-content">
            <h3 className="text-2xl font-bold text-gray-900">{stats.errorPlugins}</h3>
            <p className="text-gray-600 text-sm">بها أخطاء</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions mb-8">
        <h2 className="section-title text-xl font-semibold text-gray-900 mb-4">الإجراءات السريعة</h2>
        
        <div className="actions-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="action-card bg-white rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
               onClick={() => navigate('/plugins/upload')}>
            <div className="action-icon w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-cloud-upload-alt text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">رفع بلوجين</h3>
            <p className="text-gray-600 text-sm">رفع وتثبيت بلوجين جديد</p>
          </div>

          <div className="action-card bg-white rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
               onClick={() => navigate('/plugins/list')}>
            <div className="action-icon w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-list text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">إدارة البلوجينز</h3>
            <p className="text-gray-600 text-sm">عرض وإدارة البلوجينز المثبتة</p>
          </div>

          <div className="action-card bg-white rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
               onClick={() => navigate('/plugins/settings')}>
            <div className="action-icon w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-cog text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">الإعدادات</h3>
            <p className="text-gray-600 text-sm">تكوين إعدادات البلوجينز</p>
          </div>

          <div className="action-card bg-white rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
               onClick={() => navigate('/plugins/logs')}>
            <div className="action-icon w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file-alt text-blue-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">السجلات</h3>
            <p className="text-gray-600 text-sm">عرض سجلات النشاط والأخطاء</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity mb-8">
        <h2 className="section-title text-xl font-semibold text-gray-900 mb-4">النشاط الأخير</h2>
        
        <div className="activity-list bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="activity-item flex items-center p-4 border-b border-gray-100 last:border-b-0">
              <div className={`activity-icon w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                activity.type === 'upload' ? 'bg-blue-100' :
                activity.type === 'activation' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <i className={`${
                  activity.type === 'upload' ? 'fas fa-upload text-blue-600' :
                  activity.type === 'activation' ? 'fas fa-power-off text-green-600' : 
                  'fas fa-exclamation-circle text-red-600'
                }`}></i>
              </div>
              
              <div className="activity-content flex-1">
                <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                <p className="text-gray-600 text-sm">{activity.description}</p>
                <span className="text-gray-400 text-xs">{formatTime(activity.timestamp)}</span>
              </div>
              
              <div className={`activity-status px-3 py-1 rounded-full text-xs font-medium ${
                activity.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {activity.status === 'success' ? 'نجح' : 'فشل'}
              </div>
            </div>
          ))}
          
          {recentActivities.length === 0 && (
            <div className="no-activity text-center py-12 text-gray-500">
              <i className="fas fa-inbox text-3xl mb-4"></i>
              <p>لا توجد أنشطة حديثة</p>
            </div>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="system-health">
        <h2 className="section-title text-xl font-semibold text-gray-900 mb-4">حالة النظام</h2>
        
        <div className="health-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(systemHealth).map(([key, status]) => (
            <div key={key} className="health-item bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="health-label text-gray-600 text-sm mb-2">
                {key === 'registry' ? 'Plugin Registry' :
                 key === 'upload' ? 'Upload System' :
                 key === 'security' ? 'Security Scanner' : 'Event Bus'}
              </div>
              <div className={`health-status flex items-center gap-2 font-semibold ${
                status === 'healthy' ? 'text-green-600' :
                status === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                <i className={`${
                  status === 'healthy' ? 'fas fa-check-circle' :
                  status === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-times-circle'
                }`}></i>
                {status === 'healthy' ? 'سليم' : status === 'warning' ? 'تحذير' : 'خطأ'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PluginDashboard
