import { Bell, Menu, Search, User, LogOut, UserCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ThemeToggle } from "./ui/theme-toggle"
import { LanguageToggle } from "./ui/language-toggle"
import { InAppNotifications } from "./InAppNotifications"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useSettings } from "@/contexts/SettingsContext"
import { useNavigate } from "react-router-dom"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface DashboardHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function DashboardHeader({ sidebarOpen, setSidebarOpen }: DashboardHeaderProps) {
  const { logout, user } = useAuth()
  const { t } = useLanguage()
  const { logo, siteName } = useSettings()
  const navigate = useNavigate()

  const handleLogout = () => {
    console.log('User logging out')
    logout()
    navigate("/login")
  }

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('DashboardHeader: Logo failed to load, showing fallback')
    // Hide the broken image and show the fallback
    e.currentTarget.style.display = 'none';
    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 shadow-sm shadow-slate-200/20 dark:shadow-slate-800/20">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 rounded-xl transition-all duration-200 hover:shadow-sm"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
              {logo && (
                <img
                  src={logo}
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                  onError={handleLogoError}
                  onLoad={() => console.log('DashboardHeader: Logo loaded successfully')}
                />
              )}
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 items-center justify-center shadow-lg ${logo ? 'hidden' : 'flex'}`}>
                <span className="text-white font-bold text-sm">{siteName ? siteName.charAt(0).toUpperCase() : 'W'}</span>
              </div>
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
              {siteName}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('search')}
              className="pl-10 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-slate-200/50 dark:border-slate-600/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:shadow-lg focus:border-blue-300 dark:focus:border-blue-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />

          <InAppNotifications />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-200 hover:shadow-sm">
                <Avatar className="h-8 w-8 shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white text-sm font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-xl shadow-slate-200/20 dark:shadow-slate-800/20" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-3">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">{user?.name || 'المستخدم'}</p>
                  <p className="w-[200px] truncate text-sm text-slate-600 dark:text-slate-400">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg mx-1 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200">
                <UserCircle className="mr-2 h-4 w-4" />
                ملفي
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
              <DropdownMenuItem onClick={handleLogout} className="rounded-lg mx-1 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 text-red-600 dark:text-red-400 transition-all duration-200">
                <LogOut className="mr-2 h-4 w-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}