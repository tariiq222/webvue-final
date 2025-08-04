/**
 * ⚙️ Settings Seed
 * بذور الإعدادات
 * 
 * Seeds the database with default system settings.
 */

import { PrismaClient } from '@prisma/client';

export async function seedSettings(prisma: PrismaClient) {
  const settingsData = [
    // Application Settings
    {
      key: 'app.name',
      value: 'WebCore',
      type: 'string',
      category: 'application',
      description: 'Application name',
      isPublic: true,
      isSystem: true
    },
    {
      key: 'app.version',
      value: '2.0.0',
      type: 'string',
      category: 'application',
      description: 'Application version',
      isPublic: true,
      isSystem: true
    },
    {
      key: 'app.description',
      value: 'Advanced Content Management System with Plugin Support',
      type: 'string',
      category: 'application',
      description: 'Application description',
      isPublic: true,
      isSystem: true
    },
    {
      key: 'app.logo',
      value: '/images/logo.png',
      type: 'string',
      category: 'application',
      description: 'Application logo path',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'app.favicon',
      value: '/images/favicon.ico',
      type: 'string',
      category: 'application',
      description: 'Application favicon path',
      isPublic: true,
      isSystem: false
    },

    // Security Settings
    {
      key: 'security.password_min_length',
      value: 8,
      type: 'number',
      category: 'security',
      description: 'Minimum password length',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'security.password_require_uppercase',
      value: true,
      type: 'boolean',
      category: 'security',
      description: 'Require uppercase letters in passwords',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'security.password_require_lowercase',
      value: true,
      type: 'boolean',
      category: 'security',
      description: 'Require lowercase letters in passwords',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'security.password_require_numbers',
      value: true,
      type: 'boolean',
      category: 'security',
      description: 'Require numbers in passwords',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'security.password_require_symbols',
      value: false,
      type: 'boolean',
      category: 'security',
      description: 'Require symbols in passwords',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'security.session_timeout',
      value: 3600,
      type: 'number',
      category: 'security',
      description: 'Session timeout in seconds',
      isPublic: false,
      isSystem: false
    },
    {
      key: 'security.max_login_attempts',
      value: 5,
      type: 'number',
      category: 'security',
      description: 'Maximum login attempts before lockout',
      isPublic: false,
      isSystem: false
    },
    {
      key: 'security.lockout_duration',
      value: 900,
      type: 'number',
      category: 'security',
      description: 'Account lockout duration in seconds',
      isPublic: false,
      isSystem: false
    },

    // Email Settings
    {
      key: 'email.from_name',
      value: 'WebCore System',
      type: 'string',
      category: 'email',
      description: 'Default sender name for emails',
      isPublic: false,
      isSystem: false
    },
    {
      key: 'email.from_address',
      value: 'noreply@webcore.dev',
      type: 'string',
      category: 'email',
      description: 'Default sender email address',
      isPublic: false,
      isSystem: false
    },
    {
      key: 'email.enabled',
      value: false,
      type: 'boolean',
      category: 'email',
      description: 'Enable email functionality',
      isPublic: false,
      isSystem: false
    },

    // File Upload Settings
    {
      key: 'upload.max_file_size',
      value: 10485760,
      type: 'number',
      category: 'upload',
      description: 'Maximum file upload size in bytes (10MB)',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'upload.allowed_image_types',
      value: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      type: 'array',
      category: 'upload',
      description: 'Allowed image file types',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'upload.allowed_document_types',
      value: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      type: 'array',
      category: 'upload',
      description: 'Allowed document file types',
      isPublic: true,
      isSystem: false
    },

    // Plugin Settings
    {
      key: 'plugins.auto_activate',
      value: false,
      type: 'boolean',
      category: 'plugins',
      description: 'Automatically activate plugins after installation',
      isPublic: false,
      isSystem: false
    },
    {
      key: 'plugins.max_size',
      value: 52428800,
      type: 'number',
      category: 'plugins',
      description: 'Maximum plugin file size in bytes (50MB)',
      isPublic: false,
      isSystem: false
    },
    {
      key: 'plugins.security_scan',
      value: true,
      type: 'boolean',
      category: 'plugins',
      description: 'Enable security scanning for plugins',
      isPublic: false,
      isSystem: false
    },

    // Notification Settings
    {
      key: 'notifications.enabled',
      value: true,
      type: 'boolean',
      category: 'notifications',
      description: 'Enable in-app notifications',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'notifications.max_per_user',
      value: 100,
      type: 'number',
      category: 'notifications',
      description: 'Maximum notifications per user',
      isPublic: false,
      isSystem: false
    },
    {
      key: 'notifications.cleanup_days',
      value: 30,
      type: 'number',
      category: 'notifications',
      description: 'Days to keep notifications before cleanup',
      isPublic: false,
      isSystem: false
    },

    // UI Settings
    {
      key: 'ui.theme',
      value: 'light',
      type: 'string',
      category: 'ui',
      description: 'Default UI theme',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'ui.language',
      value: 'en',
      type: 'string',
      category: 'ui',
      description: 'Default UI language',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'ui.rtl_support',
      value: true,
      type: 'boolean',
      category: 'ui',
      description: 'Enable RTL language support',
      isPublic: true,
      isSystem: false
    },
    {
      key: 'ui.items_per_page',
      value: 10,
      type: 'number',
      category: 'ui',
      description: 'Default items per page in lists',
      isPublic: true,
      isSystem: false
    }
  ];

  for (const setting of settingsData) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
        isPublic: setting.isPublic,
      },
      create: setting,
    });
  }

  console.log(`✅ Seeded ${settingsData.length} settings`);
}
