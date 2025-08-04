import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Download,
  Upload
} from "lucide-react"
import { getUsers, createUser, updateUser, deleteUser } from "@/api/users"
import { toast } from "@/hooks/useToast"
import { useLanguage } from "@/contexts/LanguageContext"

interface User {
  id: string
  email: string
  createdAt: string
  lastLoginAt: string | null
  isActive: boolean
  roles: Array<{
    role: {
      id: string
      name: string
    }
  }>
}

export function UserManagement() {
  const { t } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      console.log('Fetching users list')
      const data = await getUsers()
      console.log('Received users data:', data)
      // getUsers now returns the users array directly
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      console.log('Creating new user:', userData)
      await createUser(userData)
      toast({
        title: "Success",
        description: "User created successfully",
      })
      fetchUsers()
      setDialogOpen(false)
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      console.log('Updating user:', userId, userData)
      await updateUser(userId, userData)
      toast({
        title: "Success",
        description: "User updated successfully",
      })
      fetchUsers()
      setDialogOpen(false)
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log('Deleting user:', userId)
      await deleteUser(userId)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const userRole = user.roles?.[0]?.role?.name || 'user'
    const userStatus = user.isActive ? 'active' : 'inactive'
    const matchesRole = filterRole === "all" || userRole === filterRole
    const matchesStatus = filterStatus === "all" || userStatus === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
            {t('userManagement')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('manageUserAccounts')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 btn-icon-start" />
            {t('import')}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 btn-icon-start" />
            {t('export')}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                <Plus className="h-4 w-4 btn-icon-start" />
                {t('addUser')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-slate-900 max-w-md">
              <DialogHeader>
                <DialogTitle>{editingUser ? t('editUser') : t('addUser')}</DialogTitle>
                <DialogDescription>
                  {editingUser ? t('updateUserInfo') : t('createNewUserAccount')}
                </DialogDescription>
              </DialogHeader>
              <UserForm
                user={editingUser}
                onSubmit={editingUser ? 
                  (data) => handleUpdateUser(editingUser.id, data) : 
                  handleCreateUser
                }
                onCancel={() => {
                  setDialogOpen(false)
                  setEditingUser(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 title-icon" />
            {t('users')} ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            {t('manageAndMonitorUsers')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 search-icon" />
              <Input
                placeholder={t('searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-with-icon-start"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterByRole')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800">
                <SelectItem value="all">{t('allRoles')}</SelectItem>
                <SelectItem value="admin">{t('admin')}</SelectItem>
                <SelectItem value="manager">{t('manager')}</SelectItem>
                <SelectItem value="user">{t('user')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800">
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                <SelectItem value="suspended">{t('suspended')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('user')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{t('department')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('lastLogin')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse"></div>
                          <div>
                            <div className="h-4 bg-slate-200 rounded w-24 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-slate-200 rounded w-32 animate-pulse"></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-200 rounded w-8 animate-pulse"></div></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredUsers.map((user) => {
                    const userRole = user.roles?.[0]?.role?.name || 'user'
                    const userStatus = user.isActive ? 'active' : 'inactive'
                    const userName = user.email.split('@')[0] // Use email prefix as name
                    const userInitials = userName.substring(0, 2).toUpperCase()
                    const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/avatars/${user.id}.png`} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs">
                                {userInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{userName}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{userRole}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">-</TableCell>
                        <TableCell>{getStatusBadge(userStatus)}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800">
                              <DropdownMenuItem onClick={() => {
                                setEditingUser(user)
                                setDialogOpen(true)
                              }}>
                                <Edit className="h-4 w-4 dropdown-icon" />
                                {t('edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {user.status === 'active' ? (
                                  <>
                                    <UserX className="h-4 w-4 dropdown-icon" />
                                    {t('suspend')}
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 dropdown-icon" />
                                    {t('activate')}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 dropdown-icon" />
                                {t('delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserForm({ user, onSubmit, onCancel }: {
  user: User | null
  onSubmit: (data: Partial<User>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    department: user?.department || '',
    status: user?.status || 'active'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800">
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800">
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
          {user ? 'Update' : 'Create'} User
        </Button>
      </div>
    </form>
  )
}