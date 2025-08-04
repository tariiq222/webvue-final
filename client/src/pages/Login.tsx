import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/useToast"
import {
  LogIn,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  Globe,
  LightbulbIcon,
  Zap
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useSettings } from "@/contexts/SettingsContext"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { ThemeToggle } from "@/components/ui/theme-toggle"

type LoginForm = {
  email: string
  password: string
}

export function Login() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const { t, language } = useLanguage()
  const { logo, siteName, siteDescription } = useSettings()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginForm>()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/")
    }
  }, [isAuthenticated, authLoading, navigate])

  // Auto-fill demo credentials
  const handleAutoFill = () => {
    setValue('email', 'admin@webcore.com')
    setValue('password', 'admin123')

    toast({
      title: language === 'ar' ? '✨ تم ملء البيانات تلقائياً' : '✨ Auto-filled credentials',
      description: language === 'ar'
        ? 'تم إدراج بيانات المدير التجريبية'
        : 'Demo admin credentials have been filled',
      variant: "default",
    })
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true)
      await login(data.email, data.password);

      // إشعار نجاح محسن
      toast({
        title: `✅ ${t('loginSuccessTitle')}`,
        description: `🎉 ${t('loginSuccessDesc')}`,
        variant: "default",
      })
      navigate("/")
    } catch (error) {
      console.error("Login error:", error.message)

      // معالجة أخطاء محسنة مع ترجمات ذكية
      let errorTitle = `❌ ${t('loginErrorTitle')}`
      let errorDescription = t('loginErrorDesc')

      if (error?.message) {
        const errorMsg = error.message.toLowerCase()

        if (errorMsg.includes('بيانات الدخول غير صحيحة') ||
            errorMsg.includes('invalid') ||
            errorMsg.includes('incorrect')) {
          errorTitle = `⚠️ ${t('invalidCredentials')}`
          errorDescription = `🔍 ${t('checkCredentials')}`
        } else if (errorMsg.includes('connection') || errorMsg.includes('network')) {
          errorTitle = `🌐 ${t('connectionError')}`
          errorDescription = `🔄 ${t('tryAgain')}`
        } else if (errorMsg.includes('server') || errorMsg.includes('500')) {
          errorTitle = `🔧 ${t('serverError')}`
          errorDescription = `⏰ ${t('tryAgain')}`
        } else {
          errorDescription = `💡 ${error.message}`
        }
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription,
      })
    } finally {
      setLoading(false)
    }
  }

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 dark:from-blue-500/5 dark:to-indigo-700/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 dark:from-purple-500/5 dark:to-pink-700/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 dark:from-blue-500/5 dark:to-indigo-700/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 dark:from-purple-500/5 dark:to-pink-700/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-600/5 dark:from-cyan-500/3 dark:to-blue-700/3 rounded-full blur-3xl"></div>
      </div>

      {/* Header with language and theme toggles */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and title section */}
          <div className="text-center mb-8">
            {logo ? (
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                <img
                  src={logo}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain"
                  onLoad={() => console.log('Login: Logo loaded successfully')}
                  onError={(e) => {
                    console.log('Login: Logo failed to load, showing fallback')
                    // Fallback to default icon if logo fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div className="hidden inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-2xl shadow-lg">
                  <span className="text-white font-bold text-2xl">{siteName ? siteName.charAt(0).toUpperCase() : 'W'}</span>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-2xl mb-4 shadow-lg">
                <span className="text-white font-bold text-2xl">{siteName ? siteName.charAt(0).toUpperCase() : 'W'}</span>
              </div>
            )}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
              {siteName || t('webCore')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {siteDescription || t('systemTitle')}
            </p>
          </div>

          {/* Login card */}
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {t('welcomeBack')}
                </CardTitle>
              </div>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {t('loginDescription')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Demo credentials alert with auto-fill button */}
              <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50">
                <LightbulbIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div className="flex items-center justify-between gap-3">
                  <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm flex-1">
                    {language === 'ar'
                      ? 'للاختبار: admin@webcore.com / admin123'
                      : 'Demo: admin@webcore.com / admin123'
                    }
                  </AlertDescription>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFill}
                    className="h-8 px-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:text-amber-900 dark:hover:text-amber-100 transition-all duration-200 flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Zap className="h-3 w-3" />
                    {language === 'ar' ? 'ملء تلقائي' : 'Auto Fill'}
                  </Button>
                </div>
              </Alert>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    {...register("email", {
                      required: t('emailRequired'),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t('invalidEmail')
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('passwordPlaceholder')}
                      className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors pr-10"
                      {...register("password", { required: t('passwordRequired') })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-11 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? t('hidePassword') : t('showPassword')}
                      </span>
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-400 dark:to-indigo-500 dark:hover:from-blue-500 dark:hover:to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {t('loading')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {t('signIn')}
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col items-center space-y-4 pt-4">
              <Button
                variant="link"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => navigate("/register")}
              >
                {t('dontHaveAccount')} {t('signUp')}
              </Button>

              {/* Footer */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                <Globe className="w-3 h-3" />
                <span>{t('poweredBy')} {t('webCore')}</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
