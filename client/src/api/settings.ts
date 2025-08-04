import api from './api';

export interface SystemSettings {
  general: {
    siteName: string; // Auto-populated from company.name[language]
    siteDescription: string; // Auto-populated from company.description[language]
    logo: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  company: {
    name: {
      en: string;
      ar: string;
    };
    description: {
      en: string;
      ar: string;
    };
    address: {
      en: string;
      ar: string;
    };
    phone: string;
    website: string;
    supportEmail: string;
    businessHours: {
      en: string;
      ar: string;
    };
    socialMedia: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
    legalInfo: {
      registrationNumber?: string;
      taxId?: string;
      license?: string;
    };
  };
  branding: {
    primaryLogo: string;
    secondaryLogo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorRequired: boolean;
    ipWhitelist: string[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    adminEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  };
  emailTemplates: {
    welcome: {
      enabled: boolean;
      subject: {
        en: string;
        ar: string;
      };
      body: {
        en: string;
        ar: string;
      };
    };
    passwordReset: {
      enabled: boolean;
      subject: {
        en: string;
        ar: string;
      };
      body: {
        en: string;
        ar: string;
      };
    };
    accountSuspended: {
      enabled: boolean;
      subject: {
        en: string;
        ar: string;
      };
      body: {
        en: string;
        ar: string;
      };
    };
    systemAlert: {
      enabled: boolean;
      subject: {
        en: string;
        ar: string;
      };
      body: {
        en: string;
        ar: string;
      };
    };
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionDays: number;
    backupLocation: string;
  };
}

export interface Timezone {
  value: string;
  label: string;
  offset: string;
}

// Get all system settings (requires authentication)
export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const response = await api.get('/api/settings');
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Get public system settings (no authentication required)
export const getPublicSettings = async (): Promise<Partial<SystemSettings>> => {
  try {
    const response = await api.get('/api/settings/public');
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('Error fetching public settings:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Update system settings
export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put('/settings', settings);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Get settings by category
export const getSettingsByCategory = async (category: string): Promise<any> => {
  try {
    const response = await api.get(`/settings/category/${category}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Get available timezones
export const getTimezones = async (): Promise<Timezone[]> => {
  try {
    const response = await api.get('/settings/timezones');
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Get specific setting value
export const getSetting = async (category: string, key: string): Promise<any> => {
  try {
    const response = await api.get(`/settings/${category}/${key}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Set specific setting value
export const setSetting = async (category: string, key: string, value: any, description?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put(`/settings/${category}/${key}`, { value, description });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Initialize default settings
export const initializeDefaultSettings = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/settings/initialize');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get email template preview
// Endpoint: POST /api/settings/email-templates/preview
// Request: { templateType: string, subject: string, body: string, language: string }
// Response: { success: boolean, preview: {subject: string, body: string} }
export const previewEmailTemplate = async (templateData: any) => {
  try {
    const response = await api.post('/settings/email-templates/preview', templateData);
    return response.data;
  } catch (error: any) {
    console.error('Error previewing email template:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to preview email template');
  }
}

// Description: Upload logo file
// Endpoint: POST /api/settings/upload-logo
// Request: FormData with logo file and type (primary/secondary/favicon)
// Response: { success: boolean, logoUrl: string }
export const uploadLogo = async (file: File, logoType: 'primary' | 'secondary' | 'favicon') => {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('type', logoType);

    const response = await api.post('/settings/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Failed to upload logo');
  }
}

// Description: Delete logo file
// Endpoint: DELETE /api/settings/delete-logo
// Request: { type: 'primary' | 'secondary' | 'favicon' }
// Response: { success: boolean, message: string }
export const deleteLogo = async (logoType: 'primary' | 'secondary' | 'favicon') => {
  try {
    console.log(`Making DELETE request to /settings/delete-logo with type: ${logoType}`);

    const response = await api.delete('/settings/delete-logo', {
      data: { type: logoType }
    });

    console.log('Delete logo response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting logo:', error);

    // Provide more specific error messages
    if (error?.response?.status === 404) {
      throw new Error('Delete logo endpoint not found. Please check server configuration.');
    } else if (error?.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error?.response?.status === 403) {
      throw new Error('Permission denied. Admin access required.');
    } else if (error?.response?.status === 400) {
      throw new Error(error?.response?.data?.message || 'Invalid request data.');
    } else {
      throw new Error(error?.response?.data?.message || error.message || 'Failed to delete logo');
    }
  }
}

// Description: Get default email templates
// Response: Default templates for all supported languages
export const getDefaultEmailTemplates = () => {
  return {
    welcome: {
      enabled: true,
      subject: {
        en: 'Welcome to {{companyName}}!',
        ar: 'مرحباً بك في {{companyName}}!'
      },
      body: {
        en: `Dear {{name}},

Welcome to {{companyName}}! We're excited to have you on board.

Your account has been successfully created and you can now access all our services.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
{{companyName}} Team`,
        ar: `عزيزي {{name}}،

مرحباً بك في {{companyName}}! نحن متحمسون لانضمامك إلينا.

تم إنشاء حسابك بنجاح ويمكنك الآن الوصول إلى جميع خدماتنا.

إذا كان لديك أي أسئلة، لا تتردد في الاتصال بفريق الدعم لدينا.

مع أطيب التحيات،
فريق {{companyName}}`
      }
    },
    passwordReset: {
      enabled: true,
      subject: {
        en: 'Password Reset Request - {{companyName}}',
        ar: 'طلب إعادة تعيين كلمة المرور - {{companyName}}'
      },
      body: {
        en: `Dear {{name}},

We received a request to reset your password for your {{companyName}} account.

Click the link below to reset your password:
{{resetLink}}

If you didn't request this password reset, please ignore this email.

This link will expire in 24 hours for security reasons.

Best regards,
{{companyName}} Team`,
        ar: `عزيزي {{name}}،

تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في {{companyName}}.

انقر على الرابط أدناه لإعادة تعيين كلمة المرور:
{{resetLink}}

إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.

سينتهي صلاحية هذا الرابط خلال 24 ساعة لأسباب أمنية.

مع أطيب التحيات،
فريق {{companyName}}`
      }
    },
    accountSuspended: {
      enabled: true,
      subject: {
        en: 'Account Suspended - {{companyName}}',
        ar: 'تم تعليق الحساب - {{companyName}}'
      },
      body: {
        en: `Dear {{name}},

Your account with {{companyName}} has been temporarily suspended.

Reason: {{message}}
Date: {{timestamp}}

Please contact our support team for more information and to resolve this issue.

Best regards,
{{companyName}} Team`,
        ar: `عزيزي {{name}}،

تم تعليق حسابك في {{companyName}} مؤقتاً.

السبب: {{message}}
التاريخ: {{timestamp}}

يرجى الاتصال بفريق الدعم لدينا للحصول على مزيد من المعلومات وحل هذه المشكلة.

مع أطيب التحيات،
فريق {{companyName}}`
      }
    },
    systemAlert: {
      enabled: true,
      subject: {
        en: '{{alertType}} - {{companyName}}',
        ar: '{{alertType}} - {{companyName}}'
      },
      body: {
        en: `Dear {{name}},

We're writing to inform you about a system alert:

Alert Type: {{alertType}}
Message: {{message}}
Time: {{timestamp}}

Please take appropriate action if required.

Best regards,
{{companyName}} Team`,
        ar: `عزيزي {{name}}،

نكتب إليك لإعلامك بتنبيه النظام:

نوع التنبيه: {{alertType}}
الرسالة: {{message}}
الوقت: {{timestamp}}

يرجى اتخاذ الإجراء المناسب إذا لزم الأمر.

مع أطيب التحيات،
فريق {{companyName}}`
      }
    }
  };
}