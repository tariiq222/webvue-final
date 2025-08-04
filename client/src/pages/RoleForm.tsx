import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import {
  ArrowLeft,
  Shield,
  Users,
  Key,
  TreePine,

  Settings,
  BarChart3,
  FileText,
  Link,
  Save,
  X
} from "lucide-react"
import { getRoles, createRole, updateRole, getRolePermissions } from "@/api/roles"
import { toast } from "@/hooks/useToast"

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  parentRole?: string
  isSystem: boolean
  createdAt: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
}

const categoryIcons = {
  users: Users,
  roles: Shield,
  modules: TreePine,
  dashboard: BarChart3,
  audit: FileText,
  settings: Settings,
  integrations: Link
}

const categoryColors = {
  users: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  roles: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  modules: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  dashboard: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  audit: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  settings: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  integrations: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
}

export function RoleForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [role, setRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    fetchPermissions()
    if (isEditing) {
      fetchRole()
    } else {
      setLoading(false)
    }
  }, [id])

  const fetchRole = async () => {
    try {
      const roles = await getRoles()
      const roleData = Array.isArray(roles) ? roles.find((r: any) => r.id === id) : roles.roles?.find((r: any) => r.id === id)
      
      if (roleData) {
        setRole(roleData)
        setFormData({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions || []
        })
      } else {
        toast({
          title: "Error",
          description: "Role not found",
          variant: "destructive",
        })
        navigate('/role-management')
      }
    } catch (error) {
      console.error('Error fetching role:', error)
      toast({
        title: "Error",
        description: "Failed to load role",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const data = await getRolePermissions()
      setPermissions(data)
      // Set first category as default active tab
      if (data.length > 0) {
        const categories = [...new Set(data.map(p => p.category))]
        if (categories.length > 0 && !activeTab) {
          setActiveTab(categories[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEditing && role) {
        await updateRole(role.id, formData)
        toast({
          title: "Success",
          description: "Role updated successfully",
        })
      } else {
        await createRole(formData)
        toast({
          title: "Success",
          description: "Role created successfully",
        })
      }
      navigate('/role-management')
    } catch (error) {
      console.error('Error saving role:', error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} role`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const getSelectedPermissionsCount = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || []
    return categoryPermissions.filter(p => formData.permissions.includes(p.id)).length
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/role-management')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Role Management
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {isEditing ? 'Edit Role' : 'Create New Role'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {isEditing ? 'Modify role permissions and settings' : 'Define a new role with specific permissions and access levels'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Information
            </CardTitle>
            <CardDescription>
              Basic details about the role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Selected Permissions</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {formData.permissions.length} permission{formData.permissions.length !== 1 ? 's' : ''} selected
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role's purpose and responsibilities"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Permissions
            </CardTitle>
            <CardDescription>
              Configure what this role can access and do in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-wrap gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg mb-6 h-auto">
                {Object.keys(permissionsByCategory).map((category) => {
                  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Key
                  const selectedCount = getSelectedPermissionsCount(category)
                  const totalCount = permissionsByCategory[category]?.length || 0
                  const colorClass = categoryColors[category as keyof typeof categoryColors] || categoryColors.settings
                  
                  return (
                    <TabsTrigger 
                      key={category} 
                      value={category} 
                      className="flex-1 min-w-[140px] flex flex-col items-center gap-3 h-auto py-5 px-4 rounded-xl border-0 bg-transparent data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 dark:data-[state=active]:bg-slate-700 transition-all duration-300 hover:bg-white/70 dark:hover:bg-slate-700/70 hover:scale-102 cursor-pointer group"
                    >
                      <div className={`p-3 rounded-xl ${colorClass} transition-all duration-300 group-hover:scale-110 group-data-[state=active]:scale-110`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="capitalize text-sm font-semibold text-slate-700 dark:text-slate-300 group-data-[state=active]:text-slate-900 dark:group-data-[state=active]:text-slate-100">
                          {category}
                        </span>
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {selectedCount}/{totalCount}
                            </span>
                            {selectedCount > 0 && (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          {selectedCount === totalCount && totalCount > 0 && (
                            <div className="text-green-600 dark:text-green-400">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {selectedCount > 0 && (
                          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${(selectedCount / totalCount) * 100}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
                const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Key
                const colorClass = categoryColors[category as keyof typeof categoryColors] || categoryColors.settings
                
                return (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{category} Permissions</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {getSelectedPermissionsCount(category)} of {categoryPermissions.length} permissions selected
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      {categoryPermissions.map((permission) => (
                        <div 
                          key={permission.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{permission.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {permission.id}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {permission.description}
                            </p>
                          </div>
                          <Switch
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/role-management')}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving || !formData.name.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : (isEditing ? 'Update Role' : 'Create Role')}
          </Button>
        </div>
      </form>
    </div>
  )
}
