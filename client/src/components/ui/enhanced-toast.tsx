import * as React from "react"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { toast as originalToast } from "@/hooks/useToast"

interface EnhancedToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  duration?: number
}

const toastIcons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastColors = {
  default: "text-blue-600 dark:text-blue-400",
  destructive: "text-red-600 dark:text-red-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",
}

export function enhancedToast({ title, description, variant = 'default', duration = 5000 }: EnhancedToastProps) {
  const Icon = toastIcons[variant]
  const iconColor = toastColors[variant]

  return originalToast({
    title,
    description: (
      <div className="flex items-start gap-3 rtl:gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight">{title}</div>
          {description && (
            <div className="mt-1 text-sm opacity-90 leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>
    ),
    variant,
    duration,
  })
}

// Hook محسن للإشعارات مع دعم الترجمات
export function useEnhancedToast() {
  const { t } = useLanguage()
  
  const showSuccess = (title?: string, description?: string) => {
    enhancedToast({
      title: title || t('success'),
      description: description || t('operationSuccessful'),
      variant: 'success',
    })
  }
  
  const showError = (title?: string, description?: string) => {
    enhancedToast({
      title: title || t('error'),
      description: description || t('operationFailed'),
      variant: 'destructive',
    })
  }
  
  const showWarning = (title?: string, description?: string) => {
    enhancedToast({
      title: title || t('warning'),
      description: description || t('pleaseCheck'),
      variant: 'warning',
    })
  }
  
  const showInfo = (title?: string, description?: string) => {
    enhancedToast({
      title: title || t('info'),
      description: description || t('additionalInfo'),
      variant: 'info',
    })
  }
  
  const showLoginSuccess = () => {
    enhancedToast({
      title: t('loginSuccessTitle'),
      description: t('loginSuccessDesc'),
      variant: 'success',
    })
  }
  
  const showLoginError = (errorMessage?: string) => {
    let title = t('loginErrorTitle')
    let description = t('loginErrorDesc')
    
    if (errorMessage) {
      const errorMsg = errorMessage.toLowerCase()
      
      if (errorMsg.includes('بيانات الدخول غير صحيحة') || 
          errorMsg.includes('invalid') || 
          errorMsg.includes('incorrect')) {
        title = t('invalidCredentials')
        description = t('checkCredentials')
      } else if (errorMsg.includes('connection') || errorMsg.includes('network')) {
        title = t('connectionError')
        description = t('tryAgain')
      } else if (errorMsg.includes('server') || errorMsg.includes('500')) {
        title = t('serverError')
        description = t('tryAgain')
      } else {
        description = errorMessage
      }
    }
    
    enhancedToast({
      title,
      description,
      variant: 'destructive',
    })
  }
  
  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoginSuccess,
    showLoginError,
    enhancedToast,
  }
}

// مكون Toast محسن مع أيقونات
export function EnhancedToastContent({ 
  title, 
  description, 
  variant = 'default',
  onClose 
}: {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  onClose?: () => void
}) {
  const Icon = toastIcons[variant]
  const iconColor = toastColors[variant]
  
  return (
    <div className="flex items-start gap-3 rtl:gap-3 w-full">
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColor)} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm leading-tight">{title}</div>
        {description && (
          <div className="mt-1 text-sm opacity-90 leading-relaxed">
            {description}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
