/**
 * ⚙️ Setting Service
 * خدمة الإعدادات
 * 
 * Business logic for system settings management operations.
 */

import { prisma } from '@/database/connection';
import { AppError } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';
import {
  calculatePagination,
  getPaginationOffset,
  getPrismaSearchFilter,
  getPrismaSortOptions,
} from '@/shared/utils/pagination';
import {
  Setting,
  CreateSettingData,
  UpdateSettingData,
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types';

export class SettingService {
  /**
   * Get all settings with pagination and filtering
   * الحصول على جميع الإعدادات مع التصفح والتصفية
   */
  async getSettings(params: PaginationParams & {
    category?: string;
    isPublic?: boolean;
    isSystem?: boolean;
  }): Promise<PaginatedResponse<Setting>> {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'category', 
      sortOrder = 'asc', 
      search,
      category,
      isPublic,
      isSystem,
    } = params;

    // Build where clause
    const where: any = {
      ...getPrismaSearchFilter(search, ['key', 'description', 'category']),
    };

    if (category) {
      where.category = category;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    if (isSystem !== undefined) {
      where.isSystem = isSystem;
    }

    // Get total count
    const total = await prisma.setting.count({ where });

    // Get settings with pagination
    const settings = await prisma.setting.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: getPrismaSortOptions(sortBy, sortOrder),
      skip: getPaginationOffset(page, limit),
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);

    return {
      success: true,
      data: settings,
      pagination,
      message: 'Settings retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get public settings only
   * الحصول على الإعدادات العامة فقط
   */
  async getPublicSettings(): Promise<Record<string, any>> {
    const settings = await prisma.setting.findMany({
      where: { isPublic: true },
      select: {
        key: true,
        value: true,
        type: true,
      },
    });

    // Transform to key-value object
    const publicSettings: Record<string, any> = {};
    settings.forEach(setting => {
      publicSettings[setting.key] = this.parseSettingValue(setting.value, setting.type);
    });

    return publicSettings;
  }

  /**
   * Get settings by category
   * الحصول على الإعدادات حسب الفئة
   */
  async getSettingsByCategory(category: string): Promise<Record<string, any>> {
    const settings = await prisma.setting.findMany({
      where: { category },
      select: {
        key: true,
        value: true,
        type: true,
      },
    });

    // Transform to key-value object
    const categorySettings: Record<string, any> = {};
    settings.forEach(setting => {
      categorySettings[setting.key] = this.parseSettingValue(setting.value, setting.type);
    });

    return categorySettings;
  }

  /**
   * Get setting by key
   * الحصول على إعداد بالمفتاح
   */
  async getSettingByKey(key: string): Promise<Setting> {
    const setting = await prisma.setting.findUnique({
      where: { key },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    return setting;
  }

  /**
   * Get setting value by key
   * الحصول على قيمة الإعداد بالمفتاح
   */
  async getSettingValue(key: string): Promise<any> {
    const setting = await prisma.setting.findUnique({
      where: { key },
      select: {
        value: true,
        type: true,
      },
    });

    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    return this.parseSettingValue(setting.value, setting.type);
  }

  /**
   * Create new setting
   * إنشاء إعداد جديد
   */
  async createSetting(settingData: CreateSettingData, createdBy?: string): Promise<Setting> {
    const { key, value, type, category, description, isPublic = false } = settingData;

    // Check if setting already exists
    const existingSetting = await prisma.setting.findUnique({
      where: { key },
    });

    if (existingSetting) {
      throw new AppError('Setting key already exists', 409, 'SETTING_KEY_EXISTS');
    }

    // Validate and serialize value
    const serializedValue = this.serializeSettingValue(value, type);

    // Create setting
    const setting = await prisma.setting.create({
      data: {
        key,
        value: serializedValue,
        type,
        category,
        description,
        isPublic,
        isSystem: false,
        createdBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info('Setting created successfully', {
      settingId: setting.id,
      key: setting.key,
      category: setting.category,
      createdBy,
    });

    return setting;
  }

  /**
   * Update setting
   * تحديث الإعداد
   */
  async updateSetting(key: string, settingData: UpdateSettingData): Promise<Setting> {
    const { value, description, isPublic } = settingData;

    // Check if setting exists
    const existingSetting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!existingSetting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    // Check if it's a system setting
    if (existingSetting.isSystem && value !== undefined) {
      throw new AppError('Cannot modify system setting value', 400, 'SYSTEM_SETTING_IMMUTABLE');
    }

    // Prepare update data
    const updateData: any = {};
    
    if (value !== undefined) {
      updateData.value = this.serializeSettingValue(value, existingSetting.type);
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
    }

    // Update setting
    const setting = await prisma.setting.update({
      where: { key },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info('Setting updated successfully', {
      settingId: setting.id,
      key: setting.key,
      updatedFields: Object.keys(updateData),
    });

    return setting;
  }

  /**
   * Delete setting
   * حذف الإعداد
   */
  async deleteSetting(key: string): Promise<void> {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    // Check if it's a system setting
    if (setting.isSystem) {
      throw new AppError('Cannot delete system setting', 400, 'SYSTEM_SETTING_IMMUTABLE');
    }

    // Delete setting
    await prisma.setting.delete({
      where: { key },
    });

    logger.info('Setting deleted successfully', {
      settingId: setting.id,
      key: setting.key,
    });
  }

  /**
   * Bulk update settings
   * تحديث الإعدادات بالجملة
   */
  async bulkUpdateSettings(settings: Array<{ key: string; value: any }>): Promise<void> {
    const updates = [];

    for (const { key, value } of settings) {
      const existingSetting = await prisma.setting.findUnique({
        where: { key },
      });

      if (!existingSetting) {
        throw new AppError(`Setting not found: ${key}`, 404, 'SETTING_NOT_FOUND');
      }

      if (existingSetting.isSystem) {
        throw new AppError(`Cannot modify system setting: ${key}`, 400, 'SYSTEM_SETTING_IMMUTABLE');
      }

      const serializedValue = this.serializeSettingValue(value, existingSetting.type);
      
      updates.push(
        prisma.setting.update({
          where: { key },
          data: { value: serializedValue },
        })
      );
    }

    // Execute all updates in a transaction
    await prisma.$transaction(updates);

    logger.info('Bulk settings update completed', {
      updatedCount: settings.length,
      keys: settings.map(s => s.key),
    });
  }

  /**
   * Get setting categories
   * الحصول على فئات الإعدادات
   */
  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    const categories = await prisma.setting.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return categories.map(cat => ({
      category: cat.category,
      count: cat._count.category,
    }));
  }

  /**
   * Parse setting value based on type
   * تحليل قيمة الإعداد حسب النوع
   */
  private parseSettingValue(value: any, type: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'object':
      case 'array':
        return typeof value === 'string' ? JSON.parse(value) : value;
      default:
        return value;
    }
  }

  /**
   * Serialize setting value for storage
   * تسلسل قيمة الإعداد للتخزين
   */
  private serializeSettingValue(value: any, type: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new AppError('Invalid number value', 400, 'INVALID_NUMBER_VALUE');
        }
        return num;
      case 'boolean':
        return Boolean(value);
      case 'object':
      case 'array':
        try {
          return typeof value === 'string' ? JSON.parse(value) : value;
        } catch (error) {
          throw new AppError('Invalid JSON value', 400, 'INVALID_JSON_VALUE');
        }
      default:
        return value;
    }
  }
}
