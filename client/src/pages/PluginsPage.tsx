/**
 * 🔌 Plugins Page
 * صفحة البلوجينز الرئيسية
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid, List, Download, Star, Settings, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/useToast';
import { getPlugins, getPluginStats, activatePlugin, deactivatePlugin, deletePlugin, type Plugin, type PluginStats } from '../api/plugins';

// Plugin interface is now imported from API

const PluginsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [stats, setStats] = useState<PluginStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // تحميل البيانات الحقيقية
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // تحميل البلوجينز والإحصائيات بشكل متوازي
        const [pluginsResult, statsResult] = await Promise.all([
          getPlugins({ sortBy: 'name' }),
          getPluginStats()
        ]);

        setPlugins(pluginsResult.plugins);
        setStats(statsResult);

      } catch (error: any) {
        console.error('Error loading plugins data:', error);
        toast({
          title: 'خطأ',
          description: error.message || 'فشل في تحميل بيانات البلوجينز',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const categories = [
    { id: 'all', name: 'جميع الفئات', count: plugins.length },
    { id: 'content', name: 'إدارة المحتوى', count: plugins.filter(p => p?.category === 'content').length },
    { id: 'analytics', name: 'التحليلات', count: plugins.filter(p => p?.category === 'analytics').length },
    { id: 'security', name: 'الأمان', count: plugins.filter(p => p?.category === 'security').length },
    { id: 'communication', name: 'التواصل', count: plugins.filter(p => p?.category === 'communication').length },
    { id: 'utility', name: 'الأدوات', count: plugins.filter(p => p?.category === 'utility').length },
    { id: 'integration', name: 'التكامل', count: plugins.filter(p => p?.category === 'integration').length },
    { id: 'ecommerce', name: 'التجارة الإلكترونية', count: plugins.filter(p => p?.category === 'ecommerce').length }
  ];

  const filteredPlugins = plugins.filter(plugin => {
    // Ensure plugin has required properties
    if (!plugin || typeof plugin !== 'object') return false;

    const name = plugin.name || '';
    const description = plugin.description || '';
    const category = plugin.category || '';

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'error': return 'خطأ';
      case 'installing': return 'جاري التثبيت';
      case 'uninstalling': return 'جاري الإلغاء';
      default: return 'غير معروف';
    }
  };

  const handleTogglePlugin = async (plugin: Plugin) => {
    try {
      if (plugin.status === 'active') {
        await deactivatePlugin(plugin.id);
        toast({
          title: 'نجح',
          description: `تم إيقاف ${plugin.name} بنجاح`
        });
      } else {
        await activatePlugin(plugin.id);
        toast({
          title: 'نجح',
          description: `تم تفعيل ${plugin.name} بنجاح`
        });
      }

      // إعادة تحميل البيانات
      const result = await getPlugins({ sortBy: 'name' });
      setPlugins(result.plugins);

    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تغيير حالة البلوجين',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePlugin = async (plugin: Plugin) => {
    if (!confirm(`هل أنت متأكد من حذف ${plugin.name}؟`)) {
      return;
    }

    try {
      await deletePlugin(plugin.id);
      toast({
        title: 'نجح',
        description: `تم حذف ${plugin.name} بنجاح`
      });

      // إعادة تحميل البيانات
      const result = await getPlugins({ sortBy: 'name' });
      setPlugins(result.plugins);

    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف البلوجين',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البلوجينز...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة البلوجينز</h1>
          <p className="text-gray-600">اكتشف وأدر البلوجينز لتوسيع وظائف موقعك</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button onClick={() => navigate('/plugins/upload')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            رفع بلوجين
          </Button>
          <Button variant="outline" onClick={() => navigate('/plugins/marketplace')}>
            متجر البلوجينز
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي البلوجينز</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Grid className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">البلوجينز النشطة</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.active || 0}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي التحميلات</p>
                <p className="text-2xl font-bold">
                  {stats?.totalDownloads?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التقييم</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.averageRating?.toFixed(1) || '0.0'}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في البلوجينز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
          
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Plugins Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredPlugins.map(plugin => {
          // Ensure all plugin properties are safe to render
          const safePlugin = {
            id: plugin.id || '',
            name: plugin.name || 'Unknown Plugin',
            version: plugin.version || '1.0.0',
            author: plugin.author || 'Unknown Author',
            description: plugin.description || 'No description available',
            status: plugin.status || 'inactive',
            icon: plugin.icon || '🔌',
            downloads: typeof plugin.downloads === 'number' ? plugin.downloads : 0,
            rating: typeof plugin.rating === 'number' ? plugin.rating : 0,
            fileSize: typeof plugin.fileSize === 'number' ? plugin.fileSize : 0,
            isCore: Boolean(plugin.isCore)
          };

          return (
            <Card key={safePlugin.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{safePlugin.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{safePlugin.name}</CardTitle>
                      <CardDescription className="text-sm">v{safePlugin.version} • {safePlugin.author}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(safePlugin.status)}>
                    {getStatusText(safePlugin.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{safePlugin.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {safePlugin.downloads.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {safePlugin.rating.toFixed(1)}
                  </span>
                  <span>{(safePlugin.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/plugins/${safePlugin.id}`)}
                  >
                    عرض التفاصيل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePlugin(plugin)}
                    className={safePlugin.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {safePlugin.status === 'active' ? 'إيقاف' : 'تفعيل'}
                  </Button>
                  {!safePlugin.isCore && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePlugin(plugin)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد بلوجينز</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على بلوجينز تطابق معايير البحث</p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
          }}>
            مسح الفلاتر
          </Button>
        </div>
      )}
    </div>
  );
};

export default PluginsPage;
