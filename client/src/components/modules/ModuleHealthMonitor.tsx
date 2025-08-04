import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Network,
  RefreshCw,
  TrendingUp,
  Zap
} from "lucide-react"
import { getModuleHealth, getMonitoringStats, getMonitoringAlerts } from "@/api/modules"
import { toast } from "@/hooks/useToast"

interface HealthMetrics {
  health: number
  status: string
  checks: {
    availability: { score: number; uptime: number }
    performance: { score: number; cpu: number; memory: number; responseTime: number }
    reliability: { score: number; errorRate: number; crashCount: number }
    security: { score: number; vulnerabilities: string[] }
    dependencies: { score: number; satisfied: string[]; missing: string[] }
  }
  metrics: {
    cpu: number
    memory: number
    responseTime: number
    uptime: number
    errorRate: number
  }
  errors: string[]
  warnings: string[]
  lastCheck: string
}

interface MonitoringStats {
  totalModules: number
  healthyModules: number
  warningModules: number
  criticalModules: number
  isMonitoring: boolean
  recentAlerts: number
  criticalAlerts: number
}

interface Alert {
  id: string
  type: 'CRITICAL' | 'WARNING'
  module: string
  message: string
  timestamp: string
}

interface ModuleHealthMonitorProps {
  moduleId?: string
}

export function ModuleHealthMonitor({ moduleId }: ModuleHealthMonitorProps) {
  const [healthData, setHealthData] = useState<HealthMetrics | null>(null)
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [moduleId])

  const fetchData = async () => {
    try {
      setRefreshing(true)
      
      if (moduleId) {
        const health = await getModuleHealth(moduleId)
        setHealthData(health.health)
      }
      
      const [stats, alertsData] = await Promise.all([
        getMonitoringStats(),
        getMonitoringAlerts({ limit: 10 })
      ])
      
      setMonitoringStats(stats.stats)
      setAlerts(alertsData.alerts)
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
      toast({
        title: "Error",
        description: "Failed to load monitoring data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-green-600"
    if (health >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthBadge = (health: number) => {
    if (health >= 80) return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
    if (health >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
    return <Badge className="bg-red-100 text-red-800">Critical</Badge>
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Health Monitoring</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {moduleId && <TabsTrigger value="details">Module Details</TabsTrigger>}
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {monitoringStats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monitoringStats.totalModules}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Healthy</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {monitoringStats.healthyModules}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Warning</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {monitoringStats.warningModules}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {monitoringStats.criticalModules}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {moduleId && healthData && (
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Overall Health
                    {getHealthBadge(healthData.health)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health Score</span>
                      <span className={getHealthColor(healthData.health)}>
                        {healthData.health}%
                      </span>
                    </div>
                    <Progress value={healthData.health} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        <span>CPU</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {healthData.metrics.cpu.toFixed(1)}%
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        <span>Memory</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {healthData.metrics.memory.toFixed(1)}MB
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        <span>Response</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {healthData.metrics.responseTime}ms
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Uptime</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {formatUptime(healthData.metrics.uptime)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Checks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(healthData.checks).map(([key, check]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{key}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={check.score} className="w-16 h-2" />
                        <span className="text-sm font-medium w-8">
                          {check.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {(healthData.errors.length > 0 || healthData.warnings.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Issues</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {healthData.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  ))}
                  {healthData.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{warning}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Latest monitoring alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No recent alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <AlertTriangle
                        className={`h-5 w-5 mt-0.5 ${
                          alert.type === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500'
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={alert.type === 'CRITICAL' ? 'destructive' : 'secondary'}
                          >
                            {alert.type}
                          </Badge>
                          <span className="font-medium">{alert.module}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
