import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Package,
  Plus,
  Search,
  Upload,
  Download,
  Play,
  Pause,
  Settings,
  MoreHorizontal,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  GitBranch,
  RefreshCw,
  BarChart3
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { getModules, uploadModule, toggleModule, deleteModule, getModuleHealth } from "@/api/modules"
import { toast } from "@/hooks/useToast"
import { ModuleHealthMonitor } from "@/components/modules/ModuleHealthMonitor"
import { ModuleDependencyManager } from "@/components/modules/ModuleDependencyManager"
import { ModuleUpdateManager } from "@/components/modules/ModuleUpdateManager"

interface Module {
  _id: string
  name: string
  version: string
  description: string
  status: 'active' | 'inactive' | 'error' | 'updating'
  health: number
  category: string
  author: string
  size: string
  installedAt: string
  lastUpdate: string
  dependencies: string[]
}

export function ModuleManagement() {
  const { t } = useLanguage()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      console.log('Fetching modules list')
      const data = await getModules()
      setModules(data.modules)
    } catch (error) {
      console.error('Error fetching modules:', error)
      toast({
        title: "Error",
        description: "Failed to load modules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleModule = async (moduleId: string, enabled: boolean) => {
    try {
      console.log('Toggling module:', moduleId, enabled)
      await toggleModule(moduleId, enabled)
      toast({
        title: "Success",
        description: `Module ${enabled ? 'activated' : 'deactivated'} successfully`,
      })
      fetchModules()
    } catch (error) {
      console.error('Error toggling module:', error)
      toast({
        title: "Error",
        description: "Failed to toggle module",
        variant: "destructive",
      })
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    try {
      console.log('Deleting module:', moduleId)
      await deleteModule(moduleId)
      toast({
        title: "Success",
        description: "Module deleted successfully",
      })
      fetchModules()
    } catch (error) {
      console.error('Error deleting module:', error)
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      })
    }
  }

  const filteredModules = (modules || []).filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || module.category === filterCategory
    const matchesStatus = filterStatus === "all" || module.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Error</Badge>
      case 'updating':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Updating</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-green-600"
    if (health >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
            {t('moduleManagement')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('installConfigureMonitor')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 btn-icon-start" />
            {t('browseLibrary')}
          </Button>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                <Upload className="h-4 w-4 btn-icon-start" />
                {t('uploadModule')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-slate-900">
              <DialogHeader>
                <DialogTitle>{t('uploadNewModule')}</DialogTitle>
                <DialogDescription>
                  {t('uploadModulePackage')}
                </DialogDescription>
              </DialogHeader>
              <ModuleUploadForm onClose={() => setUploadDialogOpen(false)} onSuccess={fetchModules} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {t('totalModules')}
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {modules.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              {t('activeModules')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {(modules || []).filter(m => m.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              {t('issues')}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {(modules || []).filter(m => m.status === 'error').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {t('avgHealth')}
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {Math.round(modules.reduce((sum, m) => sum + m.health, 0) / modules.length || 0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 tabs-list">
          <TabsTrigger value="modules" className="flex items-center gap-2 tab-trigger">
            <Package className="h-4 w-4 tab-icon" />
            {t('modules')}
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2 tab-trigger">
            <Activity className="h-4 w-4 tab-icon" />
            {t('health')}
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="flex items-center gap-2 tab-trigger">
            <GitBranch className="h-4 w-4 tab-icon" />
            {t('dependencies')}
          </TabsTrigger>
          <TabsTrigger value="updates" className="flex items-center gap-2 tab-trigger">
            <RefreshCw className="h-4 w-4 tab-icon" />
            {t('updates')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 tab-trigger">
            <BarChart3 className="h-4 w-4 tab-icon" />
            {t('analytics')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4 tab-content">
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 title-icon" />
                {t('installedModules')} ({filteredModules.length})
              </CardTitle>
              <CardDescription>
                {t('manageAndMonitorModules')}
              </CardDescription>
            </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 search-icon" />
              <Input
                placeholder={t('searchModules')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-with-icon-start"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md bg-white dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="all">{t('allCategories')}</option>
              <option value="authentication">{t('authentication')}</option>
              <option value="integration">{t('integration')}</option>
              <option value="analytics">{t('analytics')}</option>
              <option value="security">{t('security')}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md bg-white dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="all">{t('allStatus')}</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredModules.map((module) => (
                <Card key={module._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">{module.version}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800">
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="mr-2 h-4 w-4" />
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteModule(module._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Uninstall
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(module.status)}
                        <Badge variant="outline" className="capitalize">{module.category}</Badge>
                      </div>
                      <Switch
                        checked={module.status === 'active'}
                        onCheckedChange={(checked) => handleToggleModule(module._id, checked)}
                        disabled={module.status === 'updating'}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t('health')}</span>
                        <span className={getHealthColor(module.health)}>{module.health}%</span>
                      </div>
                      <Progress value={module.health} className="h-2" />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>{t('author')}:</span>
                        <span>{module.author}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('size')}:</span>
                        <span>{module.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Installed:</span>
                        <span>{new Date(module.installedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4 tab-content">
          <ModuleHealthMonitor />
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4 tab-content">
          <ModuleDependencyManager modules={modules} />
        </TabsContent>

        <TabsContent value="updates" className="space-y-4 tab-content">
          <ModuleUpdateManager modules={modules} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 tab-content">
          <Card>
            <CardHeader>
              <CardTitle>{t('moduleAnalytics')}</CardTitle>
              <CardDescription>
                {t('detailedAnalyticsInsights')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>{t('analyticsDashboardComingSoon')}</p>
                <p className="text-sm">{t('trackModuleUsageMetrics')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ModuleUploadForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    try {
      console.log('Uploading module file:', file.name)
      await uploadModule(file)
      toast({
        title: "Success",
        description: "Module uploaded and installed successfully. The page will refresh to update navigation.",
      })
      onSuccess()
      onClose()
      // Refresh the page to update the sidebar navigation
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error uploading module:', error)
      toast({
        title: "Error",
        description: "Failed to upload module",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="module-file">Module Package (.zip)</Label>
        <Input
          id="module-file"
          type="file"
          accept=".zip"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload & Install'}
        </Button>
      </div>
    </form>
  )
}