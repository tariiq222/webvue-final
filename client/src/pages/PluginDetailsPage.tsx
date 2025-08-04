/**
 * 🔌 Plugin Details Page
 * صفحة تفاصيل البلوجين
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Download, Star, Calendar, User, Package, Settings, Trash2, Play, Pause, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface PluginDetails {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  version: string;
  author: string;
  status: 'active' | 'inactive' | 'error';
  downloads: number;
  rating: number;
  category: string;
  size: string;
  lastUpdated: string;
  icon?: string;
  screenshots: string[];
  changelog: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
  requirements: {
    minVersion: string;
    dependencies: string[];
  };
  permissions: string[];
}

const PluginDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plugin, setPlugin] = useState<PluginDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة تحميل تفاصيل البلوجين
    const mockPlugin: PluginDetails = {
      id: id || '1',
      name: 'بلوجين إدارة المحتوى',
      description: 'بلوجين شامل لإدارة المحتوى والمقالات مع محرر متقدم',
      longDescription: `
        بلوجين إدارة المحتوى هو حل شامل ومتطور لإدارة المحتوى على موقعك. يوفر البلوجين واجهة سهلة الاستخدام 
        لإنشاء وتحرير ونشر المقالات والصفحات. يتضمن محرر نصوص متقدم مع دعم للوسائط المتعددة والتنسيق المتقدم.
        
        الميزات الرئيسية:
        • محرر نصوص WYSIWYG متقدم
        • إدارة الوسائط المتعددة
        • نظام تصنيف وعلامات
        • جدولة النشر
        • نظام مراجعة المحتوى
        • دعم متعدد اللغات
        • تحسين محركات البحث (SEO)
      `,
      version: '2.1.0',
      author: 'أحمد محمد',
      status: 'active',
      downloads: 1250,
      rating: 4.8,
      category: 'content',
      size: '2.5 MB',
      lastUpdated: '2024-01-15',
      icon: '📝',
      screenshots: [
        '/api/placeholder/600/400',
        '/api/placeholder/600/400',
        '/api/placeholder/600/400'
      ],
      changelog: [
        {
          version: '2.1.0',
          date: '2024-01-15',
          changes: [
            'إضافة محرر نصوص محسن',
            'تحسين أداء تحميل الصور',
            'إصلاح مشاكل التوافق مع المتصفحات',
            'إضافة دعم للغة العربية'
          ]
        },
        {
          version: '2.0.5',
          date: '2024-01-10',
          changes: [
            'إصلاح مشاكل الأمان',
            'تحسين واجهة المستخدم',
            'إضافة ميزة النسخ الاحتياطي التلقائي'
          ]
        }
      ],
      requirements: {
        minVersion: '1.0.0',
        dependencies: ['react', 'typescript']
      },
      permissions: [
        'قراءة وكتابة المحتوى',
        'إدارة الوسائط',
        'الوصول لقاعدة البيانات',
        'إرسال الإشعارات'
      ]
    };

    setTimeout(() => {
      setPlugin(mockPlugin);
      setLoading(false);
    }, 1000);
  }, [id]);

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
      default: return 'غير معروف';
    }
  };

  const handleToggleStatus = () => {
    if (plugin) {
      const newStatus = plugin.status === 'active' ? 'inactive' : 'active';
      setPlugin({ ...plugin, status: newStatus });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل البلوجين...</p>
        </div>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">البلوجين غير موجود</h3>
          <p className="text-gray-600 mb-4">لم يتم العثور على البلوجين المطلوب</p>
          <Button onClick={() => navigate('/plugins')}>
            العودة للبلوجينز
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={() => navigate('/plugins')} className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للبلوجينز
        </Button>
      </div>

      {/* Plugin Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
              {plugin.icon}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{plugin.name}</h1>
                <p className="text-gray-600 mb-2">{plugin.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {plugin.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    v{plugin.version}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {plugin.lastUpdated}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusColor(plugin.status)}>
                  {getStatusText(plugin.status)}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{plugin.rating}</span>
                  <span className="text-gray-500">({plugin.downloads.toLocaleString()} تحميل)</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleToggleStatus}
                className={plugin.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {plugin.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    إيقاف البلوجين
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    تفعيل البلوجين
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                الإعدادات
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تحديث
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                حذف
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="changelog">سجل التغييرات</TabsTrigger>
          <TabsTrigger value="requirements">المتطلبات</TabsTrigger>
          <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الوصف التفصيلي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line text-gray-700">{plugin.longDescription}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>لقطات الشاشة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plugin.screenshots.map((screenshot, index) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={screenshot} 
                      alt={`لقطة شاشة ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changelog">
          <Card>
            <CardHeader>
              <CardTitle>سجل التغييرات</CardTitle>
              <CardDescription>تاريخ التحديثات والتحسينات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {plugin.changelog.map((release, index) => (
                  <div key={index} className="border-r-2 border-blue-200 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">الإصدار {release.version}</h3>
                      <span className="text-sm text-gray-500">{release.date}</span>
                    </div>
                    <ul className="space-y-1">
                      {release.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>متطلبات النظام</CardTitle>
              <CardDescription>المتطلبات اللازمة لتشغيل البلوجين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">الحد الأدنى لإصدار النظام</h4>
                  <p className="text-sm text-gray-600">{plugin.requirements.minVersion}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">التبعيات المطلوبة</h4>
                  <div className="flex flex-wrap gap-2">
                    {plugin.requirements.dependencies.map((dep, index) => (
                      <Badge key={index} variant="outline">{dep}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">معلومات إضافية</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">حجم البلوجين:</span>
                      <span className="mr-2 font-medium">{plugin.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">الفئة:</span>
                      <span className="mr-2 font-medium">{plugin.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>الصلاحيات المطلوبة</CardTitle>
              <CardDescription>الصلاحيات التي يحتاجها البلوجين للعمل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plugin.permissions.map((permission, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">{permission}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginDetailsPage;
