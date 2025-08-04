import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { SettingsProvider } from "./contexts/SettingsContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { UserManagement } from "./pages/UserManagement"
import { RoleManagement } from "./pages/RoleManagement"
import { RoleForm } from "./pages/RoleForm"
import { ModuleManagement } from "./pages/ModuleManagement"
import { SettingsPage } from "./pages/SettingsPage"
import { Notifications } from "./pages/Notifications"
import { NotificationsPage } from "./pages/NotificationsPage"
import { Profile } from "./pages/Profile"

// Plugin Management Pages
import PluginsPage from "./pages/PluginsPage"
import PluginDetailsPage from "./pages/PluginDetailsPage"
import PluginUploadPage from "./pages/PluginUploadPage"

// Plugin Management Components (Legacy)
import PluginDashboard from "./components/PluginManagement/PluginDashboard"
import PluginList from "./components/PluginManagement/PluginList"
import PluginDetails from "./components/PluginManagement/PluginDetails"


function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SettingsProvider>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="role-management" element={<RoleManagement />} />
                  <Route path="role-management/new" element={<RoleForm />} />
                  <Route path="role-management/edit/:id" element={<RoleForm />} />
                  <Route path="modules" element={<Navigate to="/plugins" replace />} />
                  <Route path="plugins" element={<PluginsPage />} />
                  <Route path="plugins/list" element={<PluginsPage />} />
                  <Route path="plugins/upload" element={<PluginUploadPage />} />
                  <Route path="plugins/:id" element={<PluginDetailsPage />} />
                  {/* Legacy Plugin Routes */}
                  <Route path="plugins/dashboard" element={<PluginDashboard />} />
                  <Route path="plugins/legacy-list" element={<PluginList />} />
                  <Route path="plugins/legacy/:id" element={<PluginDetails />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
            <Toaster />
          </ThemeProvider>
        </SettingsProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App