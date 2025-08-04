import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  GitBranch,
  Package,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Network,
  RefreshCw,
  Trash2,
  Info
} from "lucide-react"
import { 
  getDependencyTree, 
  getDependents, 
  validateDependencies, 
  getDependencyStats,
  getInstallationOrder,
  checkUninstallSafety
} from "@/api/modules"
import { toast } from "@/hooks/useToast"

interface DependencyNode {
  name: string
  version?: string
  isActive?: boolean
  dependencies?: DependencyNode[]
  missing?: boolean
  maxDepthReached?: boolean
}

interface DependencyStats {
  totalModules: number
  modulesWithDependencies: number
  modulesWithDependents: number
  averageDependencies: number
  maxDependencies: number
  circularDependencies: string[][]
  orphanedModules: string[]
  criticalModules: Array<{ name: string; dependentCount: number }>
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  missingDependencies: string[]
  conflictingDependencies: string[]
  circularDependencies: string[]
}

interface ModuleDependencyManagerProps {
  moduleId?: string
  moduleName?: string
}

export function ModuleDependencyManager({ moduleId, moduleName }: ModuleDependencyManagerProps) {
  const [dependencyTree, setDependencyTree] = useState<DependencyNode | null>(null)
  const [dependents, setDependents] = useState<Array<{ name: string; version: string; isActive: boolean }>>([])
  const [stats, setStats] = useState<DependencyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [uninstallCheck, setUninstallCheck] = useState<any>(null)

  useEffect(() => {
    fetchDependencyData()
  }, [moduleId, moduleName])

  const fetchDependencyData = async () => {
    try {
      setLoading(true)
      
      const promises = []
      
      if (moduleName) {
        promises.push(getDependencyTree(moduleName))
        promises.push(getDependents(moduleName))
        promises.push(checkUninstallSafety(moduleName))
      }
      
      promises.push(getDependencyStats())
      
      const results = await Promise.all(promises)
      
      if (moduleName) {
        setDependencyTree(results[0].tree)
        setDependents(results[1].dependents)
        setUninstallCheck(results[2].safetyCheck)
        setStats(results[3].stats)
      } else {
        setStats(results[0].stats)
      }
    } catch (error) {
      console.error('Error fetching dependency data:', error)
      toast({
        title: "Error",
        description: "Failed to load dependency data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleValidateDependencies = async (dependencies: string[]) => {
    try {
      const result = await validateDependencies({
        name: 'test-module',
        dependencies
      })
      setValidationResult(result.validation)
    } catch (error) {
      console.error('Error validating dependencies:', error)
      toast({
        title: "Error",
        description: "Failed to validate dependencies",
        variant: "destructive",
      })
    }
  }

  const renderDependencyNode = (node: DependencyNode, level = 0) => {
    const indent = level * 20

    return (
      <div key={`${node.name}-${level}`} className="space-y-2">
        <div 
          className="flex items-center gap-2 p-2 rounded border"
          style={{ marginLeft: `${indent}px` }}
        >
          {node.missing ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : node.isActive ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Package className="h-4 w-4 text-gray-500" />
          )}
          
          <span className={`font-medium ${node.missing ? 'text-red-600' : ''}`}>
            {node.name}
          </span>
          
          {node.version && (
            <Badge variant="outline" className="text-xs">
              v{node.version}
            </Badge>
          )}
          
          {node.missing && (
            <Badge variant="destructive" className="text-xs">
              Missing
            </Badge>
          )}
          
          {node.maxDepthReached && (
            <Badge variant="secondary" className="text-xs">
              ...
            </Badge>
          )}
        </div>
        
        {node.dependencies && node.dependencies.map(dep => 
          renderDependencyNode(dep, level + 1)
        )}
      </div>
    )
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
        <h2 className="text-2xl font-bold">Dependency Management</h2>
        <Button variant="outline" size="sm" onClick={fetchDependencyData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {moduleName && <TabsTrigger value="tree">Dependency Tree</TabsTrigger>}
          {moduleName && <TabsTrigger value="dependents">Dependents</TabsTrigger>}
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalModules}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">With Dependencies</CardTitle>
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.modulesWithDependencies}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Dependencies</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageDependencies}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orphaned</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.orphanedModules.length}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {stats && stats.circularDependencies.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Circular Dependencies Detected:</strong> {stats.circularDependencies.length} circular dependency chains found.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {moduleName && dependencyTree && (
          <TabsContent value="tree" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Dependency Tree for {moduleName}
                </CardTitle>
                <CardDescription>
                  Visual representation of module dependencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {renderDependencyNode(dependencyTree)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {moduleName && (
          <TabsContent value="dependents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5" />
                  Modules that depend on {moduleName}
                </CardTitle>
                <CardDescription>
                  Other modules that require this module to function
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dependents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4" />
                    <p>No modules depend on this module</p>
                    <p className="text-sm">This module can be safely uninstalled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dependents.map((dependent) => (
                      <div
                        key={dependent.name}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          {dependent.isActive ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Package className="h-5 w-5 text-gray-500" />
                          )}
                          <div>
                            <div className="font-medium">{dependent.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Version {dependent.version}
                            </div>
                          </div>
                        </div>
                        <Badge variant={dependent.isActive ? "default" : "secondary"}>
                          {dependent.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {uninstallCheck && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Uninstall Safety Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {uninstallCheck.canUninstall ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>This module can be safely uninstalled</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Cannot uninstall this module</span>
                      </div>
                      <div className="space-y-1">
                        {uninstallCheck.blockers.map((blocker: string, index: number) => (
                          <div key={index} className="text-sm text-muted-foreground ml-7">
                            • {blocker}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {uninstallCheck.warnings && uninstallCheck.warnings.length > 0 && (
                    <div className="mt-4 space-y-1">
                      <div className="flex items-center gap-2 text-yellow-600">
                        <Info className="h-4 w-4" />
                        <span className="text-sm font-medium">Warnings:</span>
                      </div>
                      {uninstallCheck.warnings.map((warning: string, index: number) => (
                        <div key={index} className="text-sm text-muted-foreground ml-6">
                          • {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Critical Modules</CardTitle>
                  <CardDescription>
                    Modules with many dependents (3 or more)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.criticalModules.length === 0 ? (
                    <p className="text-muted-foreground">No critical modules found</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.criticalModules.map((module) => (
                        <div
                          key={module.name}
                          className="flex items-center justify-between p-2 rounded border"
                        >
                          <span className="font-medium">{module.name}</span>
                          <Badge variant="outline">
                            {module.dependentCount} dependents
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Orphaned Modules</CardTitle>
                  <CardDescription>
                    Modules with no dependencies or dependents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.orphanedModules.length === 0 ? (
                    <p className="text-muted-foreground">No orphaned modules found</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.orphanedModules.map((moduleName) => (
                        <div
                          key={moduleName}
                          className="flex items-center gap-2 p-2 rounded border"
                        >
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{moduleName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
