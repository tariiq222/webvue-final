import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInAppNotifications } from '@/hooks/useInAppNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export function NotificationsPage() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
  } = useInAppNotifications();

  const isRTL = language === 'ar';

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.isRead) ||
                         (filterStatus === 'unread' && !notification.isRead);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: language === 'ar' ? ar : enUS
    });
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      info: language === 'ar' ? 'معلومات' : 'Info',
      success: language === 'ar' ? 'نجاح' : 'Success',
      warning: language === 'ar' ? 'تحذير' : 'Warning',
      error: language === 'ar' ? 'خطأ' : 'Error'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {language === 'ar' ? 'الإشعارات' : 'Notifications'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'ar' 
              ? `${unreadCount} إشعار غير مقروء من أصل ${notifications.length}`
              : `${unreadCount} unread of ${notifications.length} total`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'قراءة الكل' : 'Mark all read'}
            </Button>
          )}
          
          <Button onClick={deleteAllRead} variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'حذف المقروءة' : 'Delete read'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {language === 'ar' ? 'البحث والفلترة' : 'Search & Filter'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={language === 'ar' ? 'البحث في الإشعارات...' : 'Search notifications...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'نوع الإشعار' : 'Notification Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                <SelectItem value="info">{language === 'ar' ? 'معلومات' : 'Info'}</SelectItem>
                <SelectItem value="success">{language === 'ar' ? 'نجاح' : 'Success'}</SelectItem>
                <SelectItem value="warning">{language === 'ar' ? 'تحذير' : 'Warning'}</SelectItem>
                <SelectItem value="error">{language === 'ar' ? 'خطأ' : 'Error'}</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'حالة القراءة' : 'Read Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</SelectItem>
                <SelectItem value="unread">{language === 'ar' ? 'غير مقروء' : 'Unread'}</SelectItem>
                <SelectItem value="read">{language === 'ar' ? 'مقروء' : 'Read'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'جاري تحميل الإشعارات...' : 'Loading notifications...'}
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {language === 'ar' ? 'خطأ في تحميل الإشعارات' : 'Error Loading Notifications'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
              </Button>
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {language === 'ar' ? 'لا توجد إشعارات' : 'No Notifications'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? (language === 'ar' ? 'لا توجد إشعارات تطابق المعايير المحددة' : 'No notifications match your filters')
                  : (language === 'ar' ? 'لم تتلق أي إشعارات بعد' : 'You haven\'t received any notifications yet')
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${
                !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${
                            !notification.isRead ? 'font-bold' : ''
                          }`}>
                            {notification.title}
                          </h3>
                          <Badge variant={notification.isRead ? 'secondary' : 'default'}>
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.isRead && (
                            <Badge variant="destructive" className="text-xs">
                              {language === 'ar' ? 'جديد' : 'New'}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {formatNotificationTime(notification.createdAt)}
                        </p>

                        {/* Action Button */}
                        {notification.actionUrl && notification.actionText && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => window.location.href = notification.actionUrl!}
                          >
                            {notification.actionText}
                          </Button>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            title={language === 'ar' ? 'تحديد كمقروء' : 'Mark as read'}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-500 hover:text-red-700"
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
