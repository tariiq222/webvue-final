import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileUpload } from "@/components/ui/file-upload"
import { DualLanguageInput } from "@/components/ui/dual-language-input"
import {
  Building2,
  Settings,
  Shield,
  Bell,
  Mail,
  Zap,
  FileText,
  Save,
  Globe,
  Clock,
  Phone,
  Link,
  Image,
  Key,
  Users,
  Calendar,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { useSettings } from "@/contexts/SettingsContext"
import { toast } from "@/hooks/useToast"
import {
  getSystemSettings,
  updateSystemSettings,
  uploadLogo,
  deleteLogo,
  getTimezones,
  type SystemSettings as SystemSettingsType
} from "@/api/settings"
import { getAuditLogs } from "@/api/audit"


type SettingsSection =
  | 'company'
  | 'system'
  | 'security'
  | 'notifications'
  | 'email'
  | 'integrations'
  | 'audit'
  | 'securityMonitor'
  | 'apiGateway'

interface AuditLog {
  _id: string
  timestamp: string
  user: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  success: boolean
}

const settingsSections = [
  {
    id: 'company' as SettingsSection,
    name: 'إعدادات الشركة',
    nameEn: 'Company Settings',
    icon: Building2,
    description: 'إدارة معلومات الشركة والهوية البصرية',
    descriptionEn: 'Manage company information and visual identity'
  },
  {
    id: 'system' as SettingsSection,
    name: 'إعدادات النظام',
    nameEn: 'System Settings',
    icon: Settings,
    description: 'الإعدادات العامة للنظام واللغة',
    descriptionEn: 'General system settings and language preferences'
  },
  {
    id: 'security' as SettingsSection,
    name: 'الأمان والحماية',
    nameEn: 'Security & Protection',
    icon: Shield,
    description: 'إعدادات الأمان وسياسات الحماية',
    descriptionEn: 'Security settings and protection policies'
  },
  {
    id: 'notifications' as SettingsSection,
    name: 'الإشعارات والتنبيهات',
    nameEn: 'Notifications & Alerts',
    icon: Bell,
    description: 'إدارة الإشعارات وإعدادات البريد الإلكتروني',
    descriptionEn: 'Manage notifications and email settings'
  },

  {
    id: 'email' as SettingsSection,
    name: 'قوالب البريد الإلكتروني',
    nameEn: 'Email Templates',
    icon: Mail,
    description: 'إدارة قوالب الرسائل الإلكترونية',
    descriptionEn: 'Manage email message templates'
  },
  {
    id: 'integrations' as SettingsSection,
    name: 'التكاملات الخارجية',
    nameEn: 'External Integrations',
    icon: Zap,
    description: 'إدارة التكاملات والخدمات الخارجية',
    descriptionEn: 'Manage integrations and external services'
  },
  {
    id: 'audit' as SettingsSection,
    name: 'سجلات التدقيق',
    nameEn: 'Audit Logs',
    icon: FileText,
    description: 'مراقبة وتتبع أنشطة النظام',
    descriptionEn: 'Monitor and track system activities'
  },
  {
    id: 'securityMonitor' as SettingsSection,
    name: 'مراقب الأمان',
    nameEn: 'Security Monitor',
    icon: Shield,
    description: 'كشف التهديدات والاستجابة التلقائية',
    descriptionEn: 'Threat detection and automated response'
  },
  {
    id: 'apiGateway' as SettingsSection,
    name: 'بوابة API',
    nameEn: 'API Gateway',
    icon: Zap,
    description: 'إدارة التوجيه والأمان لجميع APIs',
    descriptionEn: 'Manage routing and security for all APIs'
  }
]

export function SettingsPage() {
  const { t, language } = useLanguage()
  const { refreshSettings } = useSettings()
  const [activeSection, setActiveSection] = useState<SettingsSection>('company')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSettingsType | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [timezones, setTimezones] = useState<any[]>([])
  
  // File upload states
  const [logoFiles, setLogoFiles] = useState<{
    primary: File | null
    secondary: File | null
    favicon: File | null
  }>({
    primary: null,
    secondary: null,
    favicon: null
  })
  
  const [logoPreviews, setLogoPreviews] = useState<{
    primary: string
    secondary: string
    favicon: string
  }>({
    primary: '',
    secondary: '',
    favicon: ''
  })

  useEffect(() => {
    loadSettings()
    loadTimezones()

    // Check for URL parameters to navigate to specific section
    const urlParams = new URLSearchParams(window.location.search)
    const section = urlParams.get('section')
    if (section && ['company', 'system', 'security', 'notifications', 'email', 'integrations', 'audit', 'securityMonitor', 'apiGateway'].includes(section)) {
      setActiveSection(section as SettingsSection)
    }
  }, [])

  useEffect(() => {
    if (activeSection === 'audit') {
      loadAuditLogs()
    }
  }, [activeSection])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await getSystemSettings()

      // Ensure data exists and has required properties
      const safeData = data || {};

      // Ensure all required properties exist with default values
      const defaultSettings = {
        company: {
          name: { en: '', ar: '' },
          phone: '',
          description: { en: '', ar: '' },
          supportEmail: '',
          website: '',
          ...(safeData.company || {})
        },
        general: {
          language: 'en',
          timezone: 'UTC',
          ...(safeData.general || {})
        },
        security: {
          passwordMinLength: 8,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          passwordRequireSpecial: true,
          twoFactorRequired: false,
          ipWhitelist: [],
          ...(safeData.security || {})
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          adminEmail: '',
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          ...(safeData.notifications || {})
        },
        branding: {
          primaryLogo: '',
          secondaryLogo: '',
          favicon: '',
          ...(safeData.branding || {})
        },
        ...safeData
      }

      setSettings(defaultSettings)

      // Set logo previews
      if (defaultSettings.branding) {
        setLogoPreviews({
          primary: defaultSettings.branding.primaryLogo || '',
          secondary: defaultSettings.branding.secondaryLogo || '',
          favicon: defaultSettings.branding.favicon || ''
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في تحميل الإعدادات" : "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTimezones = async () => {
    try {
      const data = await getTimezones()
      setTimezones(data)
    } catch (error) {
      console.error('Error loading timezones:', error)
    }
  }

  const loadAuditLogs = async () => {
    try {
      const data = await getAuditLogs({ page: 1, limit: 50 })
      setAuditLogs(data.logs || [])
    } catch (error) {
      console.error('Error loading audit logs:', error)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      
      // Upload logos if any files are selected
      const updatedSettings = { ...settings }

      for (const [key, file] of Object.entries(logoFiles)) {
        if (file) {
          try {
            console.log(`Uploading ${key} logo...`)
            const uploadResult = await uploadLogo(file, key as 'primary' | 'secondary' | 'favicon')
            console.log(`Upload result for ${key}:`, uploadResult)

            if (key === 'primary') {
              updatedSettings.branding.primaryLogo = uploadResult.logoUrl
            } else if (key === 'secondary') {
              updatedSettings.branding.secondaryLogo = uploadResult.logoUrl
            } else if (key === 'favicon') {
              updatedSettings.branding.favicon = uploadResult.logoUrl
            }
          } catch (error) {
            console.error(`Failed to upload ${key} logo:`, error)
            toast({
              title: language === 'ar' ? 'خطأ' : 'Error',
              description: language === 'ar' ? `فشل في رفع ${key === 'primary' ? 'الشعار الرئيسي' : key === 'secondary' ? 'الشعار الثانوي' : 'أيقونة الموقع'}` : `Failed to upload ${key} logo`,
              variant: 'destructive'
            })
            // Continue with other uploads
          }
        }
      }
      
      await updateSystemSettings(updatedSettings)

      // Reload settings from server to ensure consistency
      await loadSettings()

      // Refresh the global settings context to update UI components
      await refreshSettings()

      // Clear file selections
      setLogoFiles({ primary: null, secondary: null, favicon: null })

      toast({
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' ? "تم حفظ جميع الإعدادات بنجاح" : "All settings have been saved successfully",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: language === 'ar' ? "خطأ في الحفظ" : "Save Error",
        description: language === 'ar' ? "فشل في حفظ الإعدادات، يرجى المحاولة مرة أخرى" : "Failed to save settings, please try again",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoFileSelect = (type: 'primary' | 'secondary' | 'favicon', file: File | null) => {
    setLogoFiles(prev => ({ ...prev, [type]: file }))

    if (file) {
      // Additional safety checks
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 2 ميجابايت' : 'Image is too large. Please choose an image smaller than 2MB',
          variant: 'destructive'
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'يرجى اختيار ملف صورة صحيح' : 'Please choose a valid image file',
          variant: 'destructive'
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreviews(prev => ({ ...prev, [type]: e.target?.result as string }))
      }
      reader.onerror = () => {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'فشل في قراءة الملف' : 'Failed to read file',
          variant: 'destructive'
        })
      }
      reader.readAsDataURL(file)
    } else {
      // Reset to original preview
      if (settings?.branding) {
        const originalUrl = type === 'primary'
          ? settings.branding.primaryLogo
          : type === 'secondary'
          ? settings.branding.secondaryLogo
          : settings.branding.favicon
        setLogoPreviews(prev => ({ ...prev, [type]: originalUrl || '' }))
      }
    }
  }

  const handleDeleteLogo = async (type: 'primary' | 'secondary' | 'favicon') => {
    try {
      console.log(`Deleting ${type} logo...`)

      // Show loading state
      const logoTypeNames = {
        primary: language === 'ar' ? 'الشعار الرئيسي' : 'Primary Logo',
        secondary: language === 'ar' ? 'الشعار الثانوي' : 'Secondary Logo',
        favicon: language === 'ar' ? 'أيقونة الموقع' : 'Website Icon'
      }

      await deleteLogo(type)

      // Update local state immediately for better UX
      setLogoPreviews(prev => ({ ...prev, [type]: '' }))

      // Reload settings to ensure consistency
      await loadSettings()

      // Refresh global settings context
      await refreshSettings()

      toast({
        title: language === 'ar' ? 'تم بنجاح' : 'Success',
        description: language === 'ar'
          ? `تم حذف ${logoTypeNames[type]} بنجاح`
          : `${logoTypeNames[type]} deleted successfully`
      })
    } catch (error: any) {
      console.error(`Failed to delete ${type} logo:`, error)

      // Show specific error message
      const errorMessage = error.message || (language === 'ar' ? 'فشل في حذف الشعار' : 'Failed to delete logo')

      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
            {t('settings')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {language === 'ar' ? 'إدارة شاملة لإعدادات النظام ومعلومات الشركة' : 'Comprehensive management of system settings and company information'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Vertical Sidebar */}
        <div className="w-80 space-y-2">
          <Card className="p-2">
            <div className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {language === 'ar' ? section.name : section.nameEn}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {language === 'ar' ? section.description : section.descriptionEn}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const section = settingsSections.find(s => s.id === activeSection)
                  const Icon = section?.icon || Settings
                  return (
                    <>
                      <Icon className="h-5 w-5" />
                      {language === 'ar' ? section?.name : section?.nameEn}
                    </>
                  )
                })()}
              </CardTitle>
              <CardDescription>
                {(() => {
                  const section = settingsSections.find(s => s.id === activeSection)
                  return language === 'ar' ? section?.description : section?.descriptionEn
                })()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Settings */}
              {activeSection === 'company' && settings && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DualLanguageInput
                      label={language === 'ar' ? 'اسم الشركة' : 'Company Name'}
                      value={settings?.company?.name || { en: '', ar: '' }}
                      onChange={(value) => setSettings(prev => prev ? {
                        ...prev,
                        company: { ...prev.company, name: value }
                      } : prev)}
                      placeholder={{ en: "Enter company name", ar: "أدخل اسم الشركة" }}
                      required
                    />

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                      <Input
                        value={settings?.company?.phone || ''}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          company: { ...prev.company, phone: e.target.value }
                        } : prev)}
                        placeholder="+966 50 123 4567"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <DualLanguageInput
                    label={language === 'ar' ? 'وصف الشركة' : 'Company Description'}
                    value={settings?.company?.description || { en: '', ar: '' }}
                    onChange={(value) => setSettings(prev => prev ? {
                      ...prev,
                      company: { ...prev.company, description: value }
                    } : prev)}
                    placeholder={{ en: "Enter company description", ar: "أدخل وصف الشركة" }}
                    type="textarea"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'البريد الإلكتروني الرسمي' : 'Official Email'}</Label>
                      <Input
                        type="email"
                        value={settings?.company?.supportEmail || ''}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          company: { ...prev.company, supportEmail: e.target.value }
                        } : prev)}
                        placeholder="info@company.com"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'موقع الويب' : 'Website'}</Label>
                      <Input
                        type="url"
                        value={settings?.company?.website || ''}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          company: { ...prev.company, website: e.target.value }
                        } : prev)}
                        placeholder="https://company.com"
                      />
                    </div>
                  </div>

                  {/* Logo Uploads */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{language === 'ar' ? 'الشعارات والهوية البصرية' : 'Logos & Visual Identity'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FileUpload
                        label={language === 'ar' ? 'الشعار الرئيسي' : 'Primary Logo'}
                        accept="image/*"
                        maxSize={5}
                        onFileSelect={(file) => handleLogoFileSelect('primary', file)}
                        onDelete={() => handleDeleteLogo('primary')}
                        preview={logoPreviews.primary}
                      />

                      <FileUpload
                        label={language === 'ar' ? 'الشعار الثانوي' : 'Secondary Logo'}
                        accept="image/*"
                        maxSize={5}
                        onFileSelect={(file) => handleLogoFileSelect('secondary', file)}
                        onDelete={() => handleDeleteLogo('secondary')}
                        preview={logoPreviews.secondary}
                      />

                      <FileUpload
                        label={language === 'ar' ? 'أيقونة الموقع (Favicon)' : 'Website Icon (Favicon)'}
                        accept="image/*"
                        maxSize={2}
                        onFileSelect={(file) => handleLogoFileSelect('favicon', file)}
                        onDelete={() => handleDeleteLogo('favicon')}
                        preview={logoPreviews.favicon}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings */}
              {activeSection === 'system' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'اللغة الافتراضية للنظام' : 'Default System Language'}</Label>
                      <Select
                        value={settings?.general?.language || 'en'}
                        onValueChange={(value) => setSettings(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, language: value }
                        } : prev)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'المنطقة الزمنية للنظام' : 'System Timezone'}</Label>
                      <Select
                        value={settings?.general?.timezone || 'UTC'}
                        onValueChange={(value) => setSettings(prev => prev ? {
                          ...prev,
                          general: { ...prev.general, timezone: value }
                        } : prev)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'تنسيق التاريخ' : 'Date Format'}</Label>
                      <Select defaultValue="DD/MM/YYYY">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'تنسيق الوقت' : 'Time Format'}</Label>
                      <Select defaultValue="24">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 ساعة</SelectItem>
                          <SelectItem value="24">24 ساعة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الحد الأدنى لطول كلمة المرور (أحرف)' : 'Minimum Password Length (characters)'}</Label>
                      <Input
                        type="number"
                        min="6"
                        max="50"
                        value={settings?.security?.passwordMinLength || 8}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                        } : prev)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'مهلة انتهاء الجلسة (دقيقة)' : 'Session Timeout (minutes)'}</Label>
                      <Input
                        type="number"
                        min="5"
                        max="1440"
                        value={settings?.security?.sessionTimeout || 30}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                        } : prev)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الحد الأقصى لمحاولات تسجيل الدخول الفاشلة' : 'Maximum Failed Login Attempts'}</Label>
                      <Input
                        type="number"
                        min="3"
                        max="10"
                        value={settings?.security?.maxLoginAttempts || 5}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                        } : prev)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{language === 'ar' ? 'طلب أحرف خاصة في كلمة المرور' : 'Require Special Characters in Password'}</Label>
                        <p className="text-sm text-slate-500">{language === 'ar' ? 'يتطلب استخدام رموز خاصة في كلمة المرور' : 'Require the use of special characters in passwords'}</p>
                      </div>
                      <Switch
                        checked={settings.security.passwordRequireSpecial}
                        onCheckedChange={(checked) => setSettings(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, passwordRequireSpecial: checked }
                        } : prev)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</Label>
                        <p className="text-sm text-slate-500">{language === 'ar' ? 'طلب المصادقة الثنائية لجميع المستخدمين' : 'Require two-factor authentication for all users'}</p>
                      </div>
                      <Switch
                        checked={settings.security.twoFactorRequired}
                        onCheckedChange={(checked) => setSettings(prev => prev ? {
                          ...prev,
                          security: { ...prev.security, twoFactorRequired: checked }
                        } : prev)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>قائمة عناوين IP المسموحة</Label>
                    <Textarea
                      value={settings?.security?.ipWhitelist?.join('\n') || ''}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        security: { ...prev.security, ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) }
                      } : prev)}
                      placeholder="192.168.1.1&#10;10.0.0.1&#10;..."
                      rows={4}
                    />
                    <p className="text-sm text-slate-500">عنوان IP واحد في كل سطر</p>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</Label>
                        <p className="text-sm text-slate-500">{language === 'ar' ? 'تفعيل إرسال التنبيهات والإشعارات عبر البريد الإلكتروني' : 'Enable sending alerts and notifications via email'}</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailEnabled}
                        onCheckedChange={(checked) => setSettings(prev => prev ? {
                          ...prev,
                          notifications: { ...prev.notifications, emailEnabled: checked }
                        } : prev)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{language === 'ar' ? 'إشعارات الرسائل النصية' : 'SMS Notifications'}</Label>
                        <p className="text-sm text-slate-500">{language === 'ar' ? 'تفعيل إرسال التنبيهات والإشعارات عبر الرسائل النصية (SMS)' : 'Enable sending alerts and notifications via SMS'}</p>
                      </div>
                      <Switch
                        checked={settings.notifications.smsEnabled}
                        onCheckedChange={(checked) => setSettings(prev => prev ? {
                          ...prev,
                          notifications: { ...prev.notifications, smsEnabled: checked }
                        } : prev)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{language === 'ar' ? 'الإشعارات الفورية' : 'Push Notifications'}</Label>
                        <p className="text-sm text-slate-500">{language === 'ar' ? 'تفعيل الإشعارات الفورية في المتصفح' : 'Enable push notifications in browser'}</p>
                      </div>
                      <Switch
                        checked={settings.notifications.pushEnabled}
                        onCheckedChange={(checked) => setSettings(prev => prev ? {
                          ...prev,
                          notifications: { ...prev.notifications, pushEnabled: checked }
                        } : prev)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Templates */}
              {activeSection === 'email' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>بريد المرسل</Label>
                      <Input
                        type="email"
                        value={settings?.notifications?.adminEmail || ''}
                        onChange={(e) => setSettings(prev => prev ? {
                          ...prev,
                          notifications: { ...prev.notifications, adminEmail: e.target.value }
                        } : prev)}
                        placeholder="noreply@company.com"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{language === 'ar' ? 'تفعيل الإرسال الفعلي' : 'Enable Email Sending'}</Label>
                        <p className="text-sm text-slate-500">{language === 'ar' ? 'تفعيل إرسال رسائل البريد الإلكتروني' : 'Enable sending email messages'}</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailEnabled}
                        onCheckedChange={(checked) => setSettings(prev => prev ? {
                          ...prev,
                          notifications: { ...prev.notifications, emailEnabled: checked }
                        } : prev)}
                      />
                    </div>
                  </div>

                  <Tabs defaultValue="welcome" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="welcome">{language === 'ar' ? 'رسالة الترحيب' : 'Welcome Message'}</TabsTrigger>
                      <TabsTrigger value="reset">{language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Password Reset'}</TabsTrigger>
                      <TabsTrigger value="alerts">{language === 'ar' ? 'تنبيهات النظام' : 'System Alerts'}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="welcome" className="space-y-4">
                      <DualLanguageInput
                        label="موضوع الرسالة"
                        value={{
                          en: settings.emailTemplates?.welcome?.subject?.en || '',
                          ar: settings.emailTemplates?.welcome?.subject?.ar || ''
                        }}
                        onChange={(value) => setSettings(prev => prev ? {
                          ...prev,
                          emailTemplates: {
                            ...prev.emailTemplates,
                            welcome: {
                              enabled: prev.emailTemplates?.welcome?.enabled || true,
                              subject: value,
                              body: prev.emailTemplates?.welcome?.body || { en: '', ar: '' }
                            }
                          }
                        } : prev)}
                        placeholder={{ en: "Welcome Subject", ar: "موضوع الترحيب" }}
                      />

                      <DualLanguageInput
                        label="محتوى الرسالة"
                        value={{
                          en: settings.emailTemplates?.welcome?.body?.en || '',
                          ar: settings.emailTemplates?.welcome?.body?.ar || ''
                        }}
                        onChange={(value) => setSettings(prev => prev ? {
                          ...prev,
                          emailTemplates: {
                            ...prev.emailTemplates,
                            welcome: {
                              enabled: prev.emailTemplates?.welcome?.enabled || true,
                              subject: prev.emailTemplates?.welcome?.subject || { en: '', ar: '' },
                              body: value
                            }
                          }
                        } : prev)}
                        placeholder={{ en: "Welcome message body...", ar: "محتوى رسالة الترحيب..." }}
                        type="textarea"
                      />
                    </TabsContent>

                    <TabsContent value="reset" className="space-y-4">
                      <DualLanguageInput
                        label="موضوع الرسالة"
                        value={{
                          en: settings.emailTemplates?.passwordReset?.subject?.en || '',
                          ar: settings.emailTemplates?.passwordReset?.subject?.ar || ''
                        }}
                        onChange={(value) => setSettings(prev => prev ? {
                          ...prev,
                          emailTemplates: {
                            ...prev.emailTemplates,
                            passwordReset: {
                              enabled: prev.emailTemplates?.passwordReset?.enabled || true,
                              subject: value,
                              body: prev.emailTemplates?.passwordReset?.body || { en: '', ar: '' }
                            }
                          }
                        } : prev)}
                        placeholder={{ en: "Password Reset Subject", ar: "موضوع إعادة تعيين كلمة المرور" }}
                      />

                      <DualLanguageInput
                        label="محتوى الرسالة"
                        value={{
                          en: settings.emailTemplates?.passwordReset?.body?.en || '',
                          ar: settings.emailTemplates?.passwordReset?.body?.ar || ''
                        }}
                        onChange={(value) => setSettings(prev => prev ? {
                          ...prev,
                          emailTemplates: {
                            ...prev.emailTemplates,
                            passwordReset: {
                              enabled: prev.emailTemplates?.passwordReset?.enabled || true,
                              subject: prev.emailTemplates?.passwordReset?.subject || { en: '', ar: '' },
                              body: value
                            }
                          }
                        } : prev)}
                        placeholder={{ en: "Password reset message body...", ar: "محتوى رسالة إعادة تعيين كلمة المرور..." }}
                        type="textarea"
                      />
                    </TabsContent>

                    <TabsContent value="alerts" className="space-y-4">
                      <DualLanguageInput
                        label="موضوع الرسالة"
                        value={{
                          en: settings.emailTemplates?.systemAlert?.subject?.en || '',
                          ar: settings.emailTemplates?.systemAlert?.subject?.ar || ''
                        }}
                        onChange={(value) => setSettings(prev => prev ? {
                          ...prev,
                          emailTemplates: {
                            ...prev.emailTemplates,
                            systemAlert: {
                              enabled: prev.emailTemplates?.systemAlert?.enabled || true,
                              subject: value,
                              body: prev.emailTemplates?.systemAlert?.body || { en: '', ar: '' }
                            }
                          }
                        } : prev)}
                        placeholder={{ en: "Alert Subject", ar: "موضوع التنبيه" }}
                      />

                      <DualLanguageInput
                        label="محتوى الرسالة"
                        value={{
                          en: settings.emailTemplates?.systemAlert?.body?.en || '',
                          ar: settings.emailTemplates?.systemAlert?.body?.ar || ''
                        }}
                        onChange={(value) => setSettings(prev => prev ? {
                          ...prev,
                          emailTemplates: {
                            ...prev.emailTemplates,
                            systemAlert: {
                              enabled: prev.emailTemplates?.systemAlert?.enabled || true,
                              subject: prev.emailTemplates?.systemAlert?.subject || { en: '', ar: '' },
                              body: value
                            }
                          }
                        } : prev)}
                        placeholder={{ en: "Alert message body...", ar: "محتوى رسالة التنبيه..." }}
                        type="textarea"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              )}



              {/* Integrations */}
              {activeSection === 'integrations' && (
                <div className="space-y-8">
                  {/* SMTP Settings */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {language === 'ar' ? 'إعدادات SMTP' : 'SMTP Settings'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {language === 'ar' ? 'إعدادات خادم البريد الإلكتروني للنظام' : 'Email server configuration for system notifications'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                            {language === 'ar' ? 'خادم البريد الإلكتروني' : 'Email Server Configuration'}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {language === 'ar' ? 'إعداد خادم SMTP لإرسال الإشعارات' : 'Configure SMTP server for sending notifications'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'عنوان خادم SMTP' : 'SMTP Server Address'}</Label>
                            <Input
                              value={settings?.notifications?.smtpHost || ''}
                              onChange={(e) => setSettings(prev => prev ? {
                                ...prev,
                                notifications: { ...prev.notifications, smtpHost: e.target.value }
                              } : prev)}
                              placeholder="smtp.gmail.com"
                              className="bg-slate-50 dark:bg-slate-700"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'رقم منفذ SMTP' : 'SMTP Port Number'}</Label>
                            <Input
                              type="number"
                              value={settings?.notifications?.smtpPort || 587}
                              onChange={(e) => setSettings(prev => prev ? {
                                ...prev,
                                notifications: { ...prev.notifications, smtpPort: parseInt(e.target.value) }
                              } : prev)}
                              placeholder="587"
                              className="bg-slate-50 dark:bg-slate-700"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'اسم المستخدم لـ SMTP' : 'SMTP Username'}</Label>
                            <Input
                              value={settings?.notifications?.smtpUser || ''}
                              onChange={(e) => setSettings(prev => prev ? {
                                ...prev,
                                notifications: { ...prev.notifications, smtpUser: e.target.value }
                              } : prev)}
                              placeholder="username@gmail.com"
                              className="bg-slate-50 dark:bg-slate-700"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
                            <Input
                              type="password"
                              value={settings?.notifications?.smtpPassword || ''}
                              onChange={(e) => setSettings(prev => prev ? {
                                ...prev,
                                notifications: { ...prev.notifications, smtpPassword: e.target.value }
                              } : prev)}
                              placeholder="••••••••"
                              className="bg-slate-50 dark:bg-slate-700"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {language === 'ar' ? 'الاتصال آمن (TLS/SSL)' : 'Secure connection (TLS/SSL)'}
                          </div>
                          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            {language === 'ar' ? 'اختبار الاتصال' : 'Test Connection'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SMS Provider Settings */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {language === 'ar' ? 'إعدادات مقدم خدمة الرسائل النصية' : 'SMS Provider Settings'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {language === 'ar' ? 'إعدادات خدمة الرسائل النصية للإشعارات' : 'SMS service configuration for notifications'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                            {language === 'ar' ? 'خدمة الرسائل النصية' : 'SMS Service Configuration'}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {language === 'ar' ? 'إعداد مقدم خدمة الرسائل النصية' : 'Configure SMS service provider'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'مفتاح API' : 'API Key'}</Label>
                            <Input
                              placeholder={language === 'ar' ? 'مفتاح API للرسائل النصية' : 'SMS API Key'}
                              className="bg-slate-50 dark:bg-slate-700"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'رقم المرسل' : 'Sender Number'}</Label>
                            <Input
                              placeholder={language === 'ar' ? 'رقم المرسل' : 'Sender Number'}
                              className="bg-slate-50 dark:bg-slate-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{language === 'ar' ? 'مقدم الخدمة' : 'Service Provider'}</Label>
                          <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                            <option value="">{language === 'ar' ? 'اختر مقدم الخدمة' : 'Select Provider'}</option>
                            <option value="twilio">Twilio</option>
                            <option value="nexmo">Vonage (Nexmo)</option>
                            <option value="aws-sns">AWS SNS</option>
                            <option value="custom">{language === 'ar' ? 'مخصص' : 'Custom'}</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                            {language === 'ar' ? 'يتطلب تفعيل الخدمة' : 'Service activation required'}
                          </div>
                          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            {language === 'ar' ? 'إرسال رسالة تجريبية' : 'Send Test Message'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calendar & Meeting Integrations */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {language === 'ar' ? 'تكاملات التقويم والاجتماعات' : 'Calendar & Meeting Integrations'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {language === 'ar' ? 'ربط النظام مع خدمات التقويم والاجتماعات الخارجية' : 'Connect with external calendar and meeting services'}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* API Keys Section */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              {language === 'ar' ? 'مفاتيح API للتقويم' : 'Calendar API Keys'}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {language === 'ar' ? 'إعداد مفاتيح الوصول للخدمات الخارجية' : 'Configure access keys for external services'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'مفتاح Google Calendar API' : 'Google Calendar API Key'}</Label>
                            <Input
                              placeholder={language === 'ar' ? 'مفتاح Google Calendar API' : 'Google Calendar API Key'}
                              className="w-full bg-slate-50 dark:bg-slate-700"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'رابط Zapier Webhook' : 'Zapier Webhook URL'}</Label>
                            <Input
                              placeholder="https://hooks.zapier.com/..."
                              className="w-full bg-slate-50 dark:bg-slate-700"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              {language === 'ar' ? 'تشفير آمن للمفاتيح' : 'Secure key encryption'}
                            </div>
                            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                              {language === 'ar' ? 'التحقق من المفاتيح' : 'Verify Keys'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Meeting Platforms Section */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-slate-900 dark:text-slate-100">
                          {language === 'ar' ? 'منصات الاجتماعات' : 'Meeting Platforms'}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Webex Card */}
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-semibold text-slate-900 dark:text-slate-100">Cisco Webex</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {language === 'ar' ? 'منصة اجتماعات احترافية' : 'Professional meeting platform'}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                              {language === 'ar'
                                ? 'تكامل مع Cisco Webex لإنشاء وإدارة الاجتماعات المرئية بشكل تلقائي'
                                : 'Integration with Cisco Webex to automatically create and manage video meetings'
                              }
                            </p>
                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              {language === 'ar' ? 'جاهز للتكامل' : 'Ready for integration'}
                            </div>
                          </div>

                          {/* Google Meet Card */}
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-semibold text-slate-900 dark:text-slate-100">Google Meet</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {language === 'ar' ? 'منصة Google للاجتماعات' : 'Google meeting platform'}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                              {language === 'ar'
                                ? 'تكامل مع Google Meet وGoogle Calendar لجدولة الاجتماعات تلقائياً'
                                : 'Integration with Google Meet and Google Calendar for automatic meeting scheduling'
                              }
                            </p>
                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              {language === 'ar' ? 'جاهز للتكامل' : 'Ready for integration'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Integrations */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {language === 'ar' ? 'تكاملات إضافية' : 'Additional Integrations'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {language === 'ar' ? 'تكاملات أخرى مع الخدمات الخارجية' : 'Other external service integrations'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Slack Card */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52-2.523A2.528 2.528 0 0 1 5.042 10.1a2.528 2.528 0 0 1 2.52 2.542 2.528 2.528 0 0 1-2.52 2.523zm6.906 4.402c-.98 0-1.781-.8-1.781-1.78 0-.98.8-1.781 1.781-1.781.98 0 1.781.8 1.781 1.781 0 .98-.8 1.78-1.781 1.78zm6.906-4.402a2.528 2.528 0 0 1-2.52-2.523A2.528 2.528 0 0 1 18.954 10.1a2.528 2.528 0 0 1 2.52 2.542 2.528 2.528 0 0 1-2.52 2.523z"/>
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-semibold text-slate-900 dark:text-slate-100">Slack</h5>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {language === 'ar' ? 'منصة التواصل الفريقي' : 'Team communication'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                          {language === 'ar'
                            ? 'إرسال الإشعارات والتحديثات إلى قنوات Slack المحددة'
                            : 'Send notifications and updates to specified Slack channels'
                          }
                        </p>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          {language === 'ar' ? 'يتطلب إعداد' : 'Requires setup'}
                        </div>
                      </div>

                      {/* Microsoft Teams Card */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.625 5.25H3.375C2.339 5.25 1.5 6.089 1.5 7.125v9.75c0 1.036.839 1.875 1.875 1.875h17.25c1.036 0 1.875-.839 1.875-1.875v-9.75c0-1.036-.839-1.875-1.875-1.875zM12 14.25L3.75 8.625h16.5L12 14.25z"/>
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-semibold text-slate-900 dark:text-slate-100">Microsoft Teams</h5>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {language === 'ar' ? 'منصة Microsoft للتعاون' : 'Microsoft collaboration'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                          {language === 'ar'
                            ? 'تكامل شامل مع Microsoft Teams للاجتماعات والإشعارات'
                            : 'Complete integration with Microsoft Teams for meetings and notifications'
                          }
                        </p>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {language === 'ar' ? 'جاهز للتكامل' : 'Ready for integration'}
                        </div>
                      </div>

                      {/* WhatsApp Business Card */}
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-semibold text-slate-900 dark:text-slate-100">WhatsApp Business</h5>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {language === 'ar' ? 'واتساب للأعمال' : 'Business messaging'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                          {language === 'ar'
                            ? 'إرسال الإشعارات والرسائل عبر WhatsApp Business API'
                            : 'Send notifications and messages via WhatsApp Business API'
                          }
                        </p>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                          {language === 'ar' ? 'يتطلب موافقة' : 'Requires approval'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit Logs */}
              {activeSection === 'audit' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{language === 'ar' ? 'سجل الأنشطة' : 'Activity Log'}</h3>
                      <p className="text-sm text-slate-500">{language === 'ar' ? 'عرض جميع أنشطة النظام وأحداث الأمان' : 'View all system activities and security events'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع المستويات</SelectItem>
                          <SelectItem value="critical">حرج</SelectItem>
                          <SelectItem value="high">عالي</SelectItem>
                          <SelectItem value="medium">متوسط</SelectItem>
                          <SelectItem value="low">منخفض</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        تصفية
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                          <TableHead>{language === 'ar' ? 'المستخدم' : 'User'}</TableHead>
                          <TableHead>{language === 'ar' ? 'الإجراء' : 'Action'}</TableHead>
                          <TableHead>{language === 'ar' ? 'عنوان IP' : 'IP Address'}</TableHead>
                          <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                              لا توجد سجلات متاحة
                            </TableCell>
                          </TableRow>
                        ) : (
                          auditLogs.slice(0, 10).map((log) => (
                            <TableRow key={log._id}>
                              <TableCell>
                                {new Date(log.timestamp).toLocaleDateString('ar-SA')}
                              </TableCell>
                              <TableCell>{log.user}</TableCell>
                              <TableCell>{log.action}</TableCell>
                              <TableCell>{log.ipAddress}</TableCell>
                              <TableCell>
                                <Badge variant={log.success ? "default" : "destructive"}>
                                  {log.success ? "نجح" : "فشل"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Security Monitor Settings */}
              {activeSection === 'securityMonitor' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                        {language === 'ar' ? 'مراقب الأمان المتقدم' : 'Advanced Security Monitor'}
                      </h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {language === 'ar'
                        ? 'نظام شامل لكشف التهديدات وتحليل السلوك والاستجابة التلقائية للحماية من الهجمات السيبرانية'
                        : 'Comprehensive system for threat detection, behavior analysis, and automated response to protect against cyber attacks'
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {language === 'ar' ? 'كشف التهديدات' : 'Threat Detection'}
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>{language === 'ar' ? 'كشف الهجمات العنيفة' : 'Brute Force Detection'}</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>{language === 'ar' ? 'كشف حقن SQL' : 'SQL Injection Detection'}</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>{language === 'ar' ? 'كشف XSS' : 'XSS Detection'}</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>{language === 'ar' ? 'كشف DDoS' : 'DDoS Detection'}</Label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {language === 'ar' ? 'الاستجابة التلقائية' : 'Automated Response'}
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>{language === 'ar' ? 'الحظر التلقائي' : 'Auto Block'}</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>{language === 'ar' ? 'تحديد معدل الطلبات' : 'Rate Limiting'}</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>{language === 'ar' ? 'تفعيل Captcha' : 'Enable Captcha'}</Label>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>{language === 'ar' ? 'مدة الحظر (ثانية)' : 'Block Duration (seconds)'}</Label>
                          <Input type="number" defaultValue="3600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'ar' ? 'إعدادات التشفير' : 'Encryption Settings'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'خوارزمية التشفير' : 'Encryption Algorithm'}</Label>
                        <Select defaultValue="aes-256">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aes-256">AES-256</SelectItem>
                            <SelectItem value="aes-192">AES-192</SelectItem>
                            <SelectItem value="aes-128">AES-128</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'دورة تدوير المفاتيح (أيام)' : 'Key Rotation (days)'}</Label>
                        <Input type="number" defaultValue="90" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Gateway Settings */}
              {activeSection === 'apiGateway' && (
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-900 dark:text-green-100">
                        {language === 'ar' ? 'بوابة API المتقدمة' : 'Advanced API Gateway'}
                      </h3>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {language === 'ar'
                        ? 'إدارة شاملة للتوجيه والأمان والأداء لجميع واجهات برمجة التطبيقات'
                        : 'Comprehensive management of routing, security, and performance for all APIs'
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {language === 'ar' ? 'إعدادات عامة' : 'General Settings'}
                      </h4>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>{language === 'ar' ? 'منفذ الخادم' : 'Server Port'}</Label>
                          <Input type="number" defaultValue="3000" />
                        </div>
                        <div className="space-y-2">
                          <Label>{language === 'ar' ? 'مهلة الطلب (ms)' : 'Request Timeout (ms)'}</Label>
                          <Input type="number" defaultValue="30000" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>{language === 'ar' ? 'تفعيل HTTPS' : 'Enable HTTPS'}</Label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>{language === 'ar' ? 'تفعيل HTTP/2' : 'Enable HTTP/2'}</Label>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {language === 'ar' ? 'تحديد معدل الطلبات' : 'Rate Limiting'}
                      </h4>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>{language === 'ar' ? 'تفعيل تحديد المعدل' : 'Enable Rate Limiting'}</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>{language === 'ar' ? 'النافذة الزمنية (ms)' : 'Window (ms)'}</Label>
                          <Input type="number" defaultValue="900000" />
                        </div>
                        <div className="space-y-2">
                          <Label>{language === 'ar' ? 'الحد الأقصى للطلبات' : 'Max Requests'}</Label>
                          <Input type="number" defaultValue="1000" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {language === 'ar' ? 'إعدادات CORS' : 'CORS Settings'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'المصادر المسموحة' : 'Allowed Origins'}</Label>
                        <Textarea
                          placeholder="https://example.com, https://app.example.com"
                          defaultValue="*"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{language === 'ar' ? 'الطرق المسموحة' : 'Allowed Methods'}</Label>
                        <Textarea
                          placeholder="GET, POST, PUT, DELETE"
                          defaultValue="GET, POST, PUT, DELETE, OPTIONS"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ جميع الإعدادات' : 'Save All Settings')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
