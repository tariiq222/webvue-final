/**
 * 📄 Pagination Utilities
 * أدوات التصفح
 * 
 * Utilities for handling pagination in API responses.
 */

import { PaginationParams, PaginationMeta, PaginatedResponse } from '@/shared/types';

/**
 * Calculate pagination metadata
 * حساب بيانات التصفح الوصفية
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
}

/**
 * Get pagination offset
 * الحصول على إزاحة التصفح
 */
export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Create paginated response
 * إنشاء استجابة مُصفحة
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message: string = 'Data retrieved successfully'
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate pagination parameters
 * التحقق من معاملات التصفح
 */
export function validatePaginationParams(params: Partial<PaginationParams>): {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
} {
  const page = Math.max(1, parseInt(String(params.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(params.limit || 10), 10)));
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';
  const sortBy = params.sortBy ? String(params.sortBy) : undefined;
  const search = params.search ? String(params.search).trim() : undefined;

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
  };
}

/**
 * Generate Prisma pagination options
 * إنشاء خيارات التصفح لـ Prisma
 */
export function getPrismaPageOptions(page: number, limit: number) {
  return {
    skip: getPaginationOffset(page, limit),
    take: limit,
  };
}

/**
 * Generate Prisma sort options
 * إنشاء خيارات الترتيب لـ Prisma
 */
export function getPrismaSortOptions(
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'asc',
  defaultSort: string = 'createdAt'
) {
  const field = sortBy || defaultSort;
  return {
    [field]: sortOrder,
  };
}

/**
 * Generate search filter for Prisma
 * إنشاء مرشح البحث لـ Prisma
 */
export function getPrismaSearchFilter(
  search?: string,
  searchFields: string[] = ['name', 'description']
) {
  if (!search) {
    return {};
  }

  return {
    OR: searchFields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    })),
  };
}

/**
 * Paginate array data
 * تصفح بيانات المصفوفة
 */
export function paginateArray<T>(
  data: T[],
  page: number,
  limit: number
): {
  data: T[];
  pagination: PaginationMeta;
} {
  const total = data.length;
  const offset = getPaginationOffset(page, limit);
  const paginatedData = data.slice(offset, offset + limit);
  const pagination = calculatePagination(page, limit, total);

  return {
    data: paginatedData,
    pagination,
  };
}

/**
 * Create pagination links
 * إنشاء روابط التصفح
 */
export function createPaginationLinks(
  baseUrl: string,
  pagination: PaginationMeta,
  queryParams: Record<string, any> = {}
): {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
} {
  const links: any = {};
  const params = new URLSearchParams(queryParams);

  // First page
  if (pagination.page > 1) {
    params.set('page', '1');
    links.first = `${baseUrl}?${params.toString()}`;
  }

  // Previous page
  if (pagination.hasPrev) {
    params.set('page', String(pagination.page - 1));
    links.prev = `${baseUrl}?${params.toString()}`;
  }

  // Next page
  if (pagination.hasNext) {
    params.set('page', String(pagination.page + 1));
    links.next = `${baseUrl}?${params.toString()}`;
  }

  // Last page
  if (pagination.page < pagination.totalPages) {
    params.set('page', String(pagination.totalPages));
    links.last = `${baseUrl}?${params.toString()}`;
  }

  return links;
}
