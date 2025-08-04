/**
 * 🔧 Application Constants
 * 
 * Centralized configuration and constants for the WebCore frontend application.
 * This file contains all the static values used throughout the application.
 */

// Application Information
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'WebCore',
  version: import.meta.env.VITE_APP_VERSION || '2.0.0',
  description: 'Advanced Content Management System with Plugin Support',
  author: 'WebCore Team',
} as const;

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  tokenKey: 'webcore_token',
  refreshTokenKey: 'webcore_refresh_token',
  userKey: 'webcore_user',
  tokenExpiry: 15 * 60 * 1000, // 15 minutes in milliseconds
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  loginRedirect: '/dashboard',
  logoutRedirect: '/login',
} as const;

// UI Configuration
export const UI_CONFIG = {
  sidebarWidth: 280,
  headerHeight: 64,
  footerHeight: 48,
  maxContentWidth: 1200,
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  defaultTheme: 'light',
  storageKey: 'webcore_theme',
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
} as const;

// Language Configuration
export const LANGUAGE_CONFIG = {
  defaultLanguage: 'ar',
  supportedLanguages: ['ar', 'en'],
  storageKey: 'webcore_language',
  rtlLanguages: ['ar'],
  fallbackLanguage: 'en',
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  maxNotifications: 50,
  autoHideDelay: 5000, // 5 seconds
  position: 'top-right',
  types: {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  },
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  },
  uploadEndpoint: '/api/upload',
} as const;

// Plugin Configuration
export const PLUGIN_CONFIG = {
  maxPlugins: 100,
  allowedCategories: [
    'business',
    'productivity',
    'communication',
    'analytics',
    'security',
    'integration',
    'utility',
  ],
  securityScoreThreshold: 7, // Minimum security score (out of 10)
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50, 100],
  maxPageSize: 100,
} as const;

// Date and Time Configuration
export const DATE_CONFIG = {
  defaultFormat: 'yyyy-MM-dd',
  timeFormat: 'HH:mm:ss',
  dateTimeFormat: 'yyyy-MM-dd HH:mm:ss',
  timezone: 'Asia/Riyadh',
  locale: 'ar-SA',
} as const;

// Validation Configuration
export const VALIDATION_CONFIG = {
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  email: {
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  username: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  network: 'فشل في الاتصال بالخادم',
  unauthorized: 'غير مخول للوصول',
  forbidden: 'ممنوع الوصول',
  notFound: 'المورد غير موجود',
  serverError: 'خطأ في الخادم',
  validationError: 'خطأ في التحقق من البيانات',
  unknownError: 'حدث خطأ غير متوقع',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  created: 'تم الإنشاء بنجاح',
  updated: 'تم التحديث بنجاح',
  deleted: 'تم الحذف بنجاح',
  saved: 'تم الحفظ بنجاح',
  uploaded: 'تم الرفع بنجاح',
  sent: 'تم الإرسال بنجاح',
} as const;

// Routes Configuration
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  users: '/users',
  roles: '/roles',
  plugins: '/plugins',
  settings: '/settings',
  notifications: '/notifications',
  profile: '/profile',
  audit: '/audit',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  theme: 'webcore_theme',
  language: 'webcore_language',
  sidebarCollapsed: 'webcore_sidebar_collapsed',
  userPreferences: 'webcore_user_preferences',
  recentSearches: 'webcore_recent_searches',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  enablePluginMarketplace: true,
  enableAdvancedAnalytics: false,
  enableMultiTenant: false,
  enableApiVersioning: true,
  enableRealTimeNotifications: true,
  enableDarkMode: true,
} as const;
