import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  ArrowUp,
  FileText,
  Shield,
  Zap
} from "lucide-react"
import { 
  checkModuleUpdates, 
  updateModule, 
  getUpdateHistory,
  bulkUpdateCheck
} from "@/api/modules"
import { toast } from "@/hooks/useToast"

interface UpdateInfo {
  moduleId: string
  currentVersion: string
  availableVersion: string
  hasUpdate: boolean
  updateSize: number
  releaseNotes: string[]
  compatibility: {
    breaking: boolean
    dependencies: string[]
  }
  lastChecked: string
}

interface UpdateHistory {
  version: string
  updateDate: string
  updateType: string
  updatedBy: string
  notes: string[]
}

interface ModuleUpdateManagerProps {
  moduleId?: string
  moduleName?: string
  modules?: Array<{ id: string; name: string; version: string }>
}

export function ModuleUpdateManager({ moduleId, moduleName, modules }: ModuleUpdateManagerProps) {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [updateHistory, setUpdateHistory] = useState<UpdateHistory[]>([])
  const [bulkUpdates, setBulkUpdates] = useState<UpdateInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (moduleId) {
      fetchUpdateInfo()
      fetchUpdateHistory()
    }
  }, [moduleId])

  const fetchUpdateInfo = async () => {
    if (!moduleId) return
    
    try {
      setLoading(true)
      const response = await checkModuleUpdates(moduleId)
      setUpdateInfo(response.updateInfo)
    } catch (error) {
      console.error('Error checking for updates:', error)
      toast({
        title: "Error",
        description: "Failed to check for updates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUpdateHistory = async () => {
    if (!moduleId) return
    
    try {
      const response = await getUpdateHistory(moduleId)
      setUpdateHistory(response.history)
    } catch (error) {
      console.error('Error fetching update history:', error)
    }
  }

  const handleBulkUpdateCheck = async () => {
    if (!modules) return
    
    try {
      setLoading(true)
      const moduleIds = modules.map(m => m.id)
      const response = await bulkUpdateCheck(moduleIds)
      setBulkUpdates(response.updateChecks.filter((update: UpdateInfo) => update.hasUpdate))
    } catch (error) {
      console.error('Error checking bulk updates:', error)
      toast({
        title: "Error",
        description: "Failed to check for bulk updates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateModule = async () => {
    if (!moduleId || !selectedFile) return
    
    try {
      setUpdating(true)
      const formData = new FormData()
      formData.append('updateFile', selectedFile)
      
      const response = await updateModule(moduleId, formData)
      
      toast({
        title: "Success",
        description: "Module updated successfully",
      })
      
      setUpdateDialogOpen(false)
      setSelectedFile(null)
      fetchUpdateInfo()
      fetchUpdateHistory()
    } catch (error) {
      console.error('Error updating module:', error)
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getUpdateBadge = (hasUpdate: boolean, breaking: boolean) => {
    if (!hasUpdate) return <Badge variant="outline">Up to date</Badge>
    if (breaking) return <Badge variant="destructive">Breaking Update</Badge>
    return <Badge className="bg-blue-100 text-blue-800">Update Available</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Update Management</h2>
        <div className="flex gap-2">
          {modules && (
            <Button variant="outline" onClick={handleBulkUpdateCheck} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Check All Updates
            </Button>
          )}
          {moduleId && (
            <Button variant="outline" onClick={fetchUpdateInfo} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Check Updates
            </Button>
          )}
        </div>
      </div>

      {moduleId && updateInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Update Status</span>
              {getUpdateBadge(updateInfo.hasUpdate, updateInfo.compatibility.breaking)}
            </CardTitle>
            <CardDescription>
              Current version: {updateInfo.currentVersion}
              {updateInfo.hasUpdate && ` → Available: ${updateInfo.availableVersion}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {updateInfo.hasUpdate ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Update Size</span>
                    </div>
                    <div className="text-lg">{formatFileSize(updateInfo.updateSize * 1024 * 1024)}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Last Checked</span>
                    </div>
                    <div className="text-lg">
                      {new Date(updateInfo.lastChecked).toLocaleString()}
                    </div>
                  </div>
                </div>

                {updateInfo.compatibility.breaking && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Breaking Changes:</strong> This update contains breaking changes that may affect compatibility.
                    </AlertDescription>
                  </Alert>
                )}

                {updateInfo.compatibility.dependencies.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Dependency Issues:</strong> {updateInfo.compatibility.dependencies.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Release Notes
                  </h4>
                  <ul className="space-y-1">
                    {updateInfo.releaseNotes.map((note, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {note}
                      </li>
                    ))}
                  </ul>
                </div>

                <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Update Module
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Module</DialogTitle>
                      <DialogDescription>
                        Upload the update file to update {moduleName} to version {updateInfo.availableVersion}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="updateFile">Update File</Label>
                        <Input
                          id="updateFile"
                          type="file"
                          accept=".zip"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setUpdateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateModule}
                          disabled={!selectedFile || updating}
                        >
                          {updating ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Update
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>Module is up to date</p>
                <p className="text-sm">No updates available at this time</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {modules && bulkUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Updates</CardTitle>
            <CardDescription>
              {bulkUpdates.length} modules have updates available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bulkUpdates.map((update) => (
                <div
                  key={update.moduleId}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      {modules.find(m => m.id === update.moduleId)?.name || 'Unknown Module'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {update.currentVersion} → {update.availableVersion}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {update.compatibility.breaking && (
                      <Badge variant="destructive" className="text-xs">
                        Breaking
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(update.updateSize * 1024 * 1024)}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {updateHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Update History</CardTitle>
            <CardDescription>
              Previous updates and changes for this module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {updateHistory.map((update, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <div className="flex-shrink-0 mt-1">
                    {update.updateType === 'current' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {update.version}</span>
                      <Badge variant="outline" className="text-xs">
                        {update.updateType}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Updated by {update.updatedBy} on{' '}
                      {new Date(update.updateDate).toLocaleDateString()}
                    </div>
                    {update.notes.length > 0 && (
                      <ul className="text-sm text-muted-foreground">
                        {update.notes.map((note, noteIndex) => (
                          <li key={noteIndex}>• {note}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
