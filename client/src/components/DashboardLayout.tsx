import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { DashboardHeader } from "./DashboardHeader"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 dark:from-blue-500/5 dark:to-indigo-700/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 dark:from-purple-500/5 dark:to-pink-700/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-600/5 dark:from-cyan-500/3 dark:to-blue-700/3 rounded-full blur-3xl"></div>
      </div>
      
      <DashboardHeader
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex pt-16">
        <Sidebar open={sidebarOpen} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 relative min-h-[calc(100vh-4rem)] ${
          sidebarOpen
            ? isRTL
              ? 'mr-80'
              : 'ml-80'
            : isRTL
              ? 'mr-16'
              : 'ml-16'
        }`}>
          <div className="p-6 relative z-10">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  )
}