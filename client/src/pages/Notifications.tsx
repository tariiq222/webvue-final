import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Info,
  Shield,
  User,
  Settings,
  Zap,
  Trash2,
  MarkAsRead,
  Clock,
  BellOff
} from "lucide-react"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/api/notifications"
import { toast } from "@/hooks/useToast"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

interface Notification {
  _id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'security'
  category: string
  read: boolean
  createdAt: string
  data?: Record<string, any>
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterRead, setFilterRead] = useState("all")
  const [unreadCount, setUnreadCount] = useState(0)
  const { t, language } = useLanguage()
  const isRTL = language === 'ar'

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications')
      const data = await getNotifications()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      toast({
        title: "Success",
        description: "Notification marked as read",
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      const deletedNotification = notifications.find(n => n._id === notificationId)
      setNotifications(prev => (prev || []).filter(n => n._id !== notificationId))
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const filteredNotifications = (notifications || []).filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || notification.category === filterCategory
    const matchesRead = filterRead === "all" || 
                       (filterRead === "read" && notification.read) ||
                       (filterRead === "unread" && !notification.read)
    return matchesSearch && matchesCategory && matchesRead
  })

  const getNotificationIcon = (type: string, category: string) => {
    if (type === 'security') return <Shield className="h-5 w-5 text-red-500" />
    if (type === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />
    if (type === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    
    switch (category) {
      case 'user':
        return <User className="h-5 w-5 text-blue-500" />
      case 'system':
        return <Settings className="h-5 w-5 text-purple-500" />
      case 'integration':
        return <Zap className="h-5 w-5 text-indigo-500" />
      default:
        return <Info className="h-5 w-5 text-slate-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isRTL ? 'إدارة وعرض جميع إشعارات النظام' : 'Manage and view all your system notifications'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead}
              className={cn(isRTL && "flex-row-reverse")}
            >
              <CheckCircle className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? 'تحديد الكل كمقروء' : 'Mark All as Read'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {isRTL ? 'إجمالي الإشعارات' : 'Total Notifications'}
            </CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {notifications.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              {isRTL ? 'غير مقروءة' : 'Unread'}
            </CardTitle>
            <BellOff className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {unreadCount}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              {isRTL ? 'مقروءة' : 'Read'}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {notifications.length - unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <CardContent className="pt-6">
          <div className={cn(
            "flex flex-col sm:flex-row gap-4",
            isRTL && "sm:flex-row-reverse"
          )}>
            <div className="relative flex-1">
              <Search className={cn(
                "absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400",
                isRTL ? "right-3" : "left-3"
              )} />
              <Input
                placeholder={isRTL ? "البحث في الإشعارات..." : "Search notifications..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  isRTL ? "pr-10 text-right" : "pl-10 text-left"
                )}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={isRTL ? "الفئة" : "Category"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800">
                <SelectItem value="all">{isRTL ? 'جميع الفئات' : 'All Categories'}</SelectItem>
                <SelectItem value="authentication">{isRTL ? 'المصادقة' : 'Authentication'}</SelectItem>
                <SelectItem value="system">{isRTL ? 'النظام' : 'System'}</SelectItem>
                <SelectItem value="user">{isRTL ? 'المستخدم' : 'User'}</SelectItem>
                <SelectItem value="integration">{isRTL ? 'التكامل' : 'Integration'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={isRTL ? "الحالة" : "Status"} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800">
                <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</SelectItem>
                <SelectItem value="unread">{isRTL ? 'غير مقروءة' : 'Unread'}</SelectItem>
                <SelectItem value="read">{isRTL ? 'مقروءة' : 'Read'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Bell className="h-5 w-5" />
            {isRTL ? `الإشعارات (${filteredNotifications.length})` : `Notifications (${filteredNotifications.length})`}
          </CardTitle>
          <CardDescription className={cn(isRTL && "text-right")}>
            {isRTL ? 'جميع إشعارات النظام والأنشطة' : 'All your system notifications and activities'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {isRTL ? 'لا توجد إشعارات تطابق المعايير المحددة' : 'No notifications match your current filters'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredNotifications.map((notification, index) => (
                  <div key={notification._id}>
                    <div className={cn(
                      "flex items-start gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                      !notification.read && "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500",
                      isRTL && "flex-row-reverse"
                    )}>
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        notification.read ? "bg-slate-100 dark:bg-slate-800" : "bg-white dark:bg-slate-700 shadow-sm"
                      )}>
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>

                      <div className={cn(
                        "flex-1 min-w-0",
                        isRTL && "text-right"
                      )}>
                        <div className={cn(
                          "flex items-start justify-between mb-2",
                          isRTL && "flex-row-reverse"
                        )}>
                          <h4 className={cn(
                            "font-semibold text-slate-900 dark:text-slate-100",
                            !notification.read && "text-blue-900 dark:text-blue-100"
                          )}>
                            {notification.title}
                          </h4>
                          <div className={cn(
                            "flex items-center gap-2 flex-shrink-0",
                            isRTL ? "flex-row-reverse mr-4" : "ml-4"
                          )}>
                            <Badge className={getTypeColor(notification.type)}>
                              {notification.type}
                            </Badge>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                          {notification.message}
                        </p>

                        <div className={cn(
                          "flex items-center justify-between",
                          isRTL && "flex-row-reverse"
                        )}>
                          <div className={cn(
                            "flex items-center gap-2 text-xs text-slate-500",
                            isRTL && "flex-row-reverse"
                          )}>
                            <Clock className="h-3 w-3" />
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                            <Badge variant="outline" className="capitalize">
                              {notification.category}
                            </Badge>
                          </div>

                          <div className={cn(
                            "flex items-center gap-1",
                            isRTL && "flex-row-reverse"
                          )}>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="h-8 px-2"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification._id)}
                              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < filteredNotifications.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}