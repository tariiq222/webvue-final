/**
 * 📝 Shared TypeScript Types
 * 
 * Common types and interfaces used throughout the WebCore frontend application.
 * These types ensure type safety and consistency across all components.
 */

// ============================================================================
// Base Types
// ============================================================================

export type ID = string;
export type Timestamp = string; // ISO 8601 format
export type Email = string;
export type URL = string;

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: ID;
  email: Email;
  name: string;
  avatar?: URL;
  isActive: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: Timestamp;
  twoFactorEnabled: boolean;
  lastLoginAt?: Timestamp;
  lastLoginIp?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  roles: UserRole[];
}

export interface UserRole {
  userId: ID;
  roleId: ID;
  assignedAt: Timestamp;
  assignedBy?: ID;
  role: Role;
}

export interface CreateUserRequest {
  email: Email;
  name: string;
  password: string;
  roleIds?: ID[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: Email;
  isActive?: boolean;
  roleIds?: ID[];
}

// ============================================================================
// Role Types
// ============================================================================

export interface Role {
  id: ID;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userCount?: number;
}

export interface Permission {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  displayName?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

// ============================================================================
// Plugin Types
// ============================================================================

export interface Plugin {
  id: ID;
  name: string;
  displayName: string;
  version: string;
  description?: string;
  author?: string;
  category?: string;
  tags?: string[];
  icon?: string;
  color?: string;
  homepage?: URL;
  repository?: URL;
  license?: string;
  permissions?: string[];
  config?: Record<string, any>;
  isActive: boolean;
  isInstalled: boolean;
  isSystem: boolean;
  installPath?: string;
  fileSize?: number;
  checksum?: string;
  securityScore?: number;
  downloadCount: number;
  rating?: number;
  uploadedAt: Timestamp;
  installedAt?: Timestamp;
  updatedAt: Timestamp;
  uploadedBy: ID;
  uploader: User;
}

export interface CreatePluginRequest {
  file: File;
  category?: string;
  tags?: string[];
}

export interface UpdatePluginRequest {
  displayName?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  config?: Record<string, any>;
}

// ============================================================================
// Setting Types
// ============================================================================

export interface Setting {
  id: ID;
  key: string;
  value: any;
  category: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  displayName: string;
  description?: string;
  isSystem: boolean;
  isPublic: boolean;
  validation?: Record<string, any>;
  defaultValue?: any;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UpdateSettingRequest {
  value: any;
}

export interface SettingCategory {
  name: string;
  displayName: string;
  description?: string;
  settings: Setting[];
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: ID;
  userId: ID;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  category?: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Timestamp;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
}

export interface CreateNotificationRequest {
  type: Notification['type'];
  priority: Notification['priority'];
  title: string;
  message: string;
  category?: string;
  data?: Record<string, any>;
  expiresAt?: Timestamp;
}

// ============================================================================
// Audit Types
// ============================================================================

export interface AuditLog {
  id: ID;
  userId?: ID;
  action: string;
  resource: string;
  resourceId?: ID;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  timestamp: Timestamp;
  user?: User;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginRequest {
  email: Email;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  twoFactorRequired?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: Email;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: Email;
}

export interface ConfirmResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// ============================================================================
// UI Types
// ============================================================================

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
  };
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  validation?: Record<string, any>;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  closable?: boolean;
}

// ============================================================================
// Theme Types
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'ar' | 'en';

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  borderRadius: number;
}

export interface UserPreferences {
  theme: Theme;
  language: Language;
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  timezone: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// Export all types
// ============================================================================

export type {
  // Re-export React types for convenience
  ReactNode,
  ReactElement,
  ComponentProps,
  FC,
  PropsWithChildren,
} from 'react';
