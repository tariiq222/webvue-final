import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Shield,
  Package,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Zap,
  FileText,
  Network
} from "lucide-react"
import { useEffect, useState } from "react"
import { getDashboardStats } from "@/api/dashboard"
import { toast } from "@/hooks/useToast"
import { useLanguage } from "@/contexts/LanguageContext"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRoles: number
  totalModules: number
  activeModules: number
  systemHealth: {
    database: string
    server: string
  }
  recentActivities: Array<{
    id: string
    user: string
    action: string
    timestamp: string
    type: 'success' | 'warning' | 'error'
  }>
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching dashboard statistics')
        const data = await getDashboardStats()
        console.log('Dashboard: Received stats data:', data)

        // Handle nested data structure - extract the actual stats
        const statsData = data?.overview || data?.stats || data;
        console.log('Dashboard: Extracted stats:', statsData)

        setStats(statsData)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-slate-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
            {t('dashboard')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('welcome')}
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
          <BarChart3 className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats?.totalUsers || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {stats?.activeUsers || 0} active today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Active Roles
            </CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats?.totalRoles || 0}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Modules
            </CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats?.activeModules || 0}/{stats?.totalModules || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Active modules
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              System Health
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats?.systemHealth?.database === 'healthy' && stats?.systemHealth?.server === 'healthy' ? '100' : '75'}%
            </div>
            <Progress value={stats?.systemHealth?.database === 'healthy' && stats?.systemHealth?.server === 'healthy' ? 100 : 75} className="mt-2" />
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Database:</span>
                <span className={`font-medium ${
                  stats?.systemHealth?.database === 'healthy' ? 'text-green-600' : 
                  stats?.systemHealth?.database === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats?.systemHealth?.database || 'unknown'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Server:</span>
                <span className={`font-medium ${
                  stats?.systemHealth?.server === 'healthy' ? 'text-green-600' : 
                  stats?.systemHealth?.server === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats?.systemHealth?.server || 'unknown'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6">
        <Card className="bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest system activities and user actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.recentActivities?.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className={`p-1 rounded-full ${
                  activity.type === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                  activity.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                  'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {activity.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : activity.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    by {activity.user} • {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Settings Links */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Settings className="h-5 w-5" />
              Quick Settings Access
            </CardTitle>
            <CardDescription>
              Direct access to system configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/settings?section=integrations"
                className="flex items-center gap-2 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                <Zap className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium">Integrations</span>
              </a>
              <a
                href="/settings?section=securityMonitor"
                className="flex items-center gap-2 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                <Shield className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium">Security</span>
              </a>
              <a
                href="/settings?section=audit"
                className="flex items-center gap-2 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                <FileText className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium">Audit Logs</span>
              </a>
              <a
                href="/settings?section=apiGateway"
                className="flex items-center gap-2 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                <Network className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium">API Gateway</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}