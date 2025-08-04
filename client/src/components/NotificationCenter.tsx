import { X, Bell, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { useNavigate } from "react-router-dom"

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
}

const notifications = [
  {
    id: 1,
    type: 'security',
    title: 'Security Alert',
    message: 'Multiple failed login attempts detected',
    time: '2 minutes ago',
    read: false,
    icon: AlertTriangle,
    color: 'text-red-500'
  },
  {
    id: 2,
    type: 'system',
    title: 'Module Update Available',
    message: 'User Management module v2.1.0 is ready',
    time: '1 hour ago',
    read: false,
    icon: Info,
    color: 'text-blue-500'
  },
  {
    id: 3,
    type: 'success',
    title: 'Integration Successful',
    message: 'Google Calendar integration completed',
    time: '3 hours ago',
    read: true,
    icon: CheckCircle,
    color: 'text-green-500'
  }
]

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const isRTL = language === 'ar'

  const handleViewAllNotifications = () => {
    navigate('/notifications')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "absolute top-20 w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-slate-200/20 dark:shadow-slate-800/20",
        isRTL ? "left-4" : "right-4"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">Notifications</h3>
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm">3</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-96">
          <div className="p-2">
            {notifications.map((notification, index) => {
              const Icon = notification.icon
              return (
                <div key={notification.id}>
                  <div className={cn(
                    "p-3 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 dark:hover:from-slate-800 dark:hover:to-slate-700 cursor-pointer transition-all duration-300 hover:shadow-sm",
                    !notification.read && "bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 border-l-4 border-gradient-to-b border-blue-500"
                  )}>
                    <div className={cn(
                      "flex items-start gap-3",
                      isRTL ? "flex-row-reverse" : ""
                    )}>
                      <div className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 shadow-sm">
                        <Icon className={cn("h-4 w-4", notification.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "flex items-center justify-between",
                          isRTL ? "flex-row-reverse" : ""
                        )}>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{notification.title}</p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm animate-pulse" />
                          )}
                        </div>
                        <p className={cn(
                          "text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed",
                          isRTL ? "text-right" : "text-left"
                        )}>
                          {notification.message}
                        </p>
                        <p className={cn(
                          "text-xs text-slate-500 mt-2",
                          isRTL ? "text-right" : "text-left"
                        )}>{notification.time}</p>
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-1 bg-slate-200/50 dark:bg-slate-700/50" />}
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-blue-50/20 dark:from-slate-800/50 dark:to-slate-700/30 rounded-b-xl">
          <Button
            variant="outline"
            className="w-full bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 border-slate-200/50 dark:border-slate-600/50 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200 hover:shadow-sm rounded-xl"
            size="sm"
            onClick={handleViewAllNotifications}
          >
            View All Notifications
          </Button>
        </div>
      </div>
    </div>
  )
}