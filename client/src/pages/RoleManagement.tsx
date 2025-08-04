import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Shield,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  AlertTriangle
} from "lucide-react"
import { getRoles, deleteRole } from "@/api/roles"
import { toast } from "@/hooks/useToast"
import { useLanguage } from "@/contexts/LanguageContext"

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

export function RoleManagement() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      console.log('Fetching roles list')
      const data = await getRoles()
      console.log('RoleManagement: Received roles data:', data)

      // Ensure data is always an array
      const rolesArray = Array.isArray(data) ? data : [];
      setRoles(rolesArray)
      console.log('RoleManagement: Set roles array:', rolesArray.length, 'roles')
    } catch (error) {
      console.error('Error fetching roles:', error)
      setRoles([])
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) {
      return
    }

    try {
      console.log('Deleting role:', roleId)
      await deleteRole(roleId)
      toast({
        title: "Success",
        description: "Role deleted successfully",
      })
      fetchRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      })
    }
  }

  // Ensure roles is always an array before filtering
  const safeRoles = Array.isArray(roles) ? roles : [];
  const filteredRoles = safeRoles.filter(role => {
    if (!role || typeof role !== 'object') return false;
    const name = role.name || '';
    const description = role.description || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           description.toLowerCase().includes(searchTerm.toLowerCase());
  })

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 title-icon" />
                {t('roleManagement')}
              </CardTitle>
              <CardDescription>
                {t('configureRolesPermissions')}
              </CardDescription>
            </div>
            <Button
              onClick={() => navigate('/role-management/new')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <Plus className="h-4 w-4 btn-icon-start" />
              {t('createNewRole')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 h-4 w-4 text-slate-500 search-icon" />
              <Input
                placeholder={t('searchRoles')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-with-icon-start"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{t('users')}</TableHead>
                  <TableHead>{t('permissions')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead>{t('created')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                        {t('loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-slate-400" />
                        <div className="text-slate-500">
                          {searchTerm ? t('noRolesFoundSearch') : t('noRolesFound')}
                        </div>
                        {!searchTerm && (
                          <Button
                            onClick={() => navigate('/role-management/new')}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4 btn-icon-start" />
                            {t('createFirstRole')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-slate-500">{role.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 icon-start" />
                          {role.userCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {role.permissions?.length || 0} {t('permissionsCount')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {role.isSystem ? (
                          <Badge variant="outline">{t('system')}</Badge>
                        ) : (
                          <Badge variant="secondary">{t('custom')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-500">
                          {new Date(role.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/role-management/edit/${role.id}`)}
                            >
                              <Edit className="h-4 w-4 dropdown-icon" />
                              {t('edit')}
                            </DropdownMenuItem>
                            {!role.isSystem && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 dropdown-icon" />
                                {t('delete')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}