import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Plugin {
  id: number
  name: string
  version: string
  description: string
  author: string
  status: 'active' | 'inactive' | 'pending' | 'error'
  icon?: string
  size: number
  lastUpdated: Date
  hasUpdate: boolean
  loading: boolean
}

const PluginList: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pluginToDelete, setPluginToDelete] = useState<Plugin | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'active', label: 'نشط' },
    { key: 'inactive', label: 'غير نشط' },
    { key: 'pending', label: 'معلق' },
    { key: 'error', label: 'خطأ' }
  ]

  useEffect(() => {
    loadPlugins()
  }, [])

  useEffect(() => {
    filterPlugins()
  }, [plugins, searchQuery, activeFilter, sortBy, sortDirection])

  const loadPlugins = async () => {
    setLoading(true)
    
    try {
      // محاكاة تحميل البلوجينز
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockPlugins: Plugin[] = [
        {
          id: 1,
          name: 'Analytics Dashboard',
          version: '2.1.0',
          description: 'لوحة تحكم شاملة لتحليل البيانات والإحصائيات',
          author: 'WebCore Team',
          status: 'active',
          icon: 'fas fa-chart-bar',
          size: 2048000,
          lastUpdated: new Date('2024-01-15'),
          hasUpdate: false,
          loading: false
        },
        {
          id: 2,
          name: 'Email Notifications',
          version: '1.5.2',
          description: 'نظام إرسال الإشعارات عبر البريد الإلكتروني',
          author: 'Notification Inc',
          status: 'active',
          icon: 'fas fa-envelope',
          size: 1024000,
          lastUpdated: new Date('2024-01-10'),
          hasUpdate: true,
          loading: false
        },
        {
          id: 3,
          name: 'Payment Gateway',
          version: '3.0.1',
          description: 'بوابة دفع متكاملة تدعم عدة وسائل دفع',
          author: 'PayTech Solutions',
          status: 'inactive',
          icon: 'fas fa-credit-card',
          size: 5120000,
          lastUpdated: new Date('2024-01-05'),
          hasUpdate: false,
          loading: false
        }
      ]
      
      setPlugins(mockPlugins)
      
    } catch (error) {
      console.error('خطأ في تحميل البلوجينز:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPlugins = () => {
    let filtered = [...plugins]
    
    // تطبيق البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(plugin => 
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.author.toLowerCase().includes(query)
      )
    }
    
    // تطبيق المرشح
    if (activeFilter !== 'all') {
      filtered = filtered.filter(plugin => plugin.status === activeFilter)
    }
    
    // تطبيق الترتيب
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Plugin]
      let bValue: any = b[sortBy as keyof Plugin]
      
      if (sortBy === 'lastUpdated') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setFilteredPlugins(filtered)
    setCurrentPage(1)
  }

  const getFilterCount = (filter: string) => {
    if (filter === 'all') {
      return plugins.length
    }
    return plugins.filter(plugin => plugin.status === filter).length
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
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

  const activatePlugin = async (plugin: Plugin) => {
    const updatedPlugins = plugins.map(p => 
      p.id === plugin.id ? { ...p, loading: true } : p
    )
    setPlugins(updatedPlugins)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const finalPlugins = plugins.map(p => 
        p.id === plugin.id ? { ...p, status: 'active' as const, loading: false } : p
      )
      setPlugins(finalPlugins)
      
    } catch (error) {
      console.error('خطأ في تفعيل البلوجين:', error)
    }
  }

  const deactivatePlugin = async (plugin: Plugin) => {
    const updatedPlugins = plugins.map(p => 
      p.id === plugin.id ? { ...p, loading: true } : p
    )
    setPlugins(updatedPlugins)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const finalPlugins = plugins.map(p => 
        p.id === plugin.id ? { ...p, status: 'inactive' as const, loading: false } : p
      )
      setPlugins(finalPlugins)
      
    } catch (error) {
      console.error('خطأ في تعطيل البلوجين:', error)
    }
  }

  const viewPluginDetails = (plugin: Plugin) => {
    navigate(`/plugins/${plugin.id}`)
  }

  const confirmDelete = (plugin: Plugin) => {
    setPluginToDelete(plugin)
    setShowDeleteModal(true)
    setActiveDropdown(null)
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setPluginToDelete(null)
    setDeleting(false)
  }

  const deletePlugin = async () => {
    if (!pluginToDelete) return
    
    setDeleting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const updatedPlugins = plugins.filter(p => p.id !== pluginToDelete.id)
      setPlugins(updatedPlugins)
      
      cancelDelete()
      
    } catch (error) {
      console.error('خطأ في حذف البلوجين:', error)
      setDeleting(false)
    }
  }

  // حساب البلوجينز المعروضة
  const totalPages = Math.ceil(filteredPlugins.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPlugins = filteredPlugins.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="plugin-list p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="list-header flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
        <div className="header-content">
          <h1 className="page-title text-3xl font-bold text-gray-900 flex items-center gap-3">
            <i className="fas fa-list text-blue-600"></i>
            قائمة البلوجينز
          </h1>
          <p className="page-subtitle text-gray-600 mt-2">
            إدارة وتكوين البلوجينز المثبتة في النظام
          </p>
        </div>
        
        <div className="header-actions flex gap-3">
          <button 
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => navigate('/plugins/upload')}
          >
            <i className="fas fa-plus"></i>
            إضافة بلوجين
          </button>
          
          <button 
            className="btn btn-secondary bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={loadPlugins}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
            تحديث
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section flex flex-wrap gap-6 items-center mb-8 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="search-box relative flex-1 max-w-md">
          <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="البحث في البلوجينز..."
            className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="filter-tabs flex gap-2">
          {filters.map((filter) => (
            <button 
              key={filter.key}
              className={`filter-tab flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
              <span className={`count px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter.key 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {getFilterCount(filter.key)}
              </span>
            </button>
          ))}
        </div>
        
        <div className="sort-options flex items-center gap-2">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="name">الاسم</option>
            <option value="status">الحالة</option>
            <option value="lastUpdated">آخر تحديث</option>
            <option value="size">الحجم</option>
          </select>
          
          <button 
            className="sort-direction p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            title={sortDirection === 'asc' ? 'تصاعدي' : 'تنازلي'}
          >
            <i className={`fas ${sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state text-center py-16 text-gray-500">
          <div className="loading-spinner text-3xl mb-4">
            <i className="fas fa-spinner animate-spin"></i>
          </div>
          <p>جاري تحميل البلوجينز...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPlugins.length === 0 && (
        <div className="empty-state text-center py-16 text-gray-500">
          <div className="empty-icon text-3xl mb-4">
            <i className="fas fa-puzzle-piece"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد بلوجينز</h3>
          {searchQuery ? (
            <p>لم يتم العثور على بلوجينز تطابق البحث "{searchQuery}"</p>
          ) : (
            <p>لم يتم تثبيت أي بلوجينز بعد</p>
          )}
          <button 
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mt-6"
            onClick={() => navigate('/plugins/upload')}
          >
            رفع بلوجين جديد
          </button>
        </div>
      )}

      {/* Plugins Grid */}
      {!loading && paginatedPlugins.length > 0 && (
        <div className="plugins-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedPlugins.map((plugin) => (
            <div 
              key={plugin.id}
              className={`plugin-card bg-white rounded-xl p-6 shadow-sm border-r-4 transition-all hover:shadow-md relative ${
                plugin.status === 'active' ? 'border-r-green-500' :
                plugin.status === 'inactive' ? 'border-r-gray-400' :
                plugin.status === 'error' ? 'border-r-red-500' : 'border-r-yellow-500'
              }`}
            >
              {/* Plugin Header */}
              <div className="plugin-header flex items-center gap-4 mb-4">
                <div className="plugin-icon w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <i className={`${plugin.icon || 'fas fa-puzzle-piece'} text-blue-600 text-xl`}></i>
                </div>
                
                <div className="plugin-info flex-1">
                  <h3 className="plugin-name text-lg font-semibold text-gray-900">{plugin.name}</h3>
                  <p className="plugin-version text-gray-600 text-sm">الإصدار {plugin.version}</p>
                </div>
                
                <div className="plugin-status">
                  <span className={`status-badge px-3 py-1 rounded-full text-xs font-medium ${
                    plugin.status === 'active' ? 'bg-green-100 text-green-800' :
                    plugin.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    plugin.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatusText(plugin.status)}
                  </span>
                </div>
              </div>

              {/* Plugin Description */}
              <div className="plugin-description mb-4">
                <p className="text-gray-600 text-sm line-clamp-2">{plugin.description}</p>
              </div>

              {/* Plugin Meta */}
              <div className="plugin-meta flex flex-wrap gap-4 mb-5 pt-4 border-t border-gray-100">
                <div className="meta-item flex items-center gap-1 text-gray-500 text-xs">
                  <i className="fas fa-user"></i>
                  <span>{plugin.author}</span>
                </div>
                
                <div className="meta-item flex items-center gap-1 text-gray-500 text-xs">
                  <i className="fas fa-calendar"></i>
                  <span>{formatDate(plugin.lastUpdated)}</span>
                </div>
                
                <div className="meta-item flex items-center gap-1 text-gray-500 text-xs">
                  <i className="fas fa-hdd"></i>
                  <span>{formatFileSize(plugin.size)}</span>
                </div>
              </div>

              {/* Plugin Actions */}
              <div className="plugin-actions flex gap-2">
                {plugin.status === 'inactive' && (
                  <button 
                    className="btn btn-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    onClick={() => activatePlugin(plugin)}
                    disabled={plugin.loading}
                  >
                    <i className="fas fa-play"></i>
                    تفعيل
                  </button>
                )}
                
                {plugin.status === 'active' && (
                  <button 
                    className="btn btn-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    onClick={() => deactivatePlugin(plugin)}
                    disabled={plugin.loading}
                  >
                    <i className="fas fa-pause"></i>
                    تعطيل
                  </button>
                )}
                
                <button 
                  className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-1"
                  onClick={() => viewPluginDetails(plugin)}
                >
                  <i className="fas fa-info-circle"></i>
                  التفاصيل
                </button>
                
                <div className="dropdown relative">
                  <button 
                    className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700 p-1 rounded"
                    onClick={() => setActiveDropdown(activeDropdown === plugin.id ? null : plugin.id)}
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                  
                  {activeDropdown === plugin.id && (
                    <div className="dropdown-menu absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                      <button 
                        className="dropdown-item w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => navigate(`/plugins/${plugin.id}/settings`)}
                      >
                        <i className="fas fa-cog"></i>
                        الإعدادات
                      </button>
                      
                      <button 
                        className="dropdown-item w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => navigate(`/plugins/${plugin.id}/logs`)}
                      >
                        <i className="fas fa-file-alt"></i>
                        السجلات
                      </button>
                      
                      <div className="dropdown-divider h-px bg-gray-200 my-1"></div>
                      
                      <button 
                        className="dropdown-item w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        onClick={() => confirmDelete(plugin)}
                      >
                        <i className="fas fa-trash"></i>
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Loading Overlay */}
              {plugin.loading && (
                <div className="loading-overlay absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center">
                  <div className="loading-spinner text-blue-600">
                    <i className="fas fa-spinner animate-spin text-xl"></i>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination flex justify-center items-center gap-2 mt-8">
          <button 
            className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <i className="fas fa-chevron-right"></i>
            السابق
          </button>
          
          <div className="page-numbers flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1
              return (
                <button 
                  key={page}
                  className={`page-btn w-10 h-10 rounded-lg text-sm font-medium ${
                    page === currentPage 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            })}
          </div>
          
          <button 
            className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            التالي
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={cancelDelete}>
          <div className="delete-modal bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
              <button className="close-btn text-gray-400 hover:text-gray-600" onClick={cancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-content p-6 text-center">
              <div className="warning-icon w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
              </div>
              
              <p className="text-gray-700 mb-2">
                هل أنت متأكد من حذف البلوجين 
                <strong className="text-gray-900"> "{pluginToDelete?.name}"</strong>؟
              </p>
              
              <p className="warning-text text-gray-500 text-sm">
                هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة بالبلوجين.
              </p>
            </div>
            
            <div className="modal-actions flex gap-3 p-6 border-t border-gray-200">
              <button 
                className="btn flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg"
                onClick={cancelDelete}
              >
                إلغاء
              </button>
              
              <button 
                className="btn flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                onClick={deletePlugin}
                disabled={deleting}
              >
                {deleting ? (
                  <i className="fas fa-spinner animate-spin"></i>
                ) : (
                  <i className="fas fa-trash"></i>
                )}
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PluginList
