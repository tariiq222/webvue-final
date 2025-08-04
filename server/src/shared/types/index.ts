/**
 * 📝 Shared TypeScript Types
 * الأنواع المشتركة
 * 
 * Common TypeScript interfaces and types used across the application.
 */

// Base response interface
export interface BaseResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

// Error response interface
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    stack?: string;
    details?: any;
  };
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: PaginationMeta;
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  roles: Role[];
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive?: boolean;
  roleIds?: string[];
}

// Role types
export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

// Plugin types
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author: string;
  isActive: boolean;
  isSystem: boolean;
  configSchema?: object;
  config?: object;
  filePath: string;
  fileSize: number;
  checksum: string;
  installedAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  author: string;
  main: string;
  dependencies?: Record<string, string>;
  permissions?: string[];
  configSchema?: object;
  hooks?: string[];
}

export interface CreatePluginData {
  file: Express.Multer.File;
  config?: object;
}

export interface UpdatePluginData {
  isActive?: boolean;
  config?: object;
}

// Settings types
export interface Setting {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: string;
  description?: string;
  isPublic: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSettingData {
  key: string;
  value: any;
  type: Setting['type'];
  category: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateSettingData {
  value?: any;
  description?: string;
  isPublic?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  data?: object;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: Notification['type'];
  data?: object;
}

// Audit log types
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: object;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface CreateAuditLogData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: object;
  ipAddress: string;
  userAgent: string;
}

// File upload types
export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  uploadedBy: string;
  createdAt: Date;
}

// Request extensions
declare global {
  namespace Express {
    interface Request {
      user?: User;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}
