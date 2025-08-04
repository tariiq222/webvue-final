/**
 * API Response Helper Utilities
 * مساعدات معالجة استجابات API
 */

/**
 * Extract data from nested API response structure
 * استخراج البيانات من هيكل الاستجابة المتداخل
 * 
 * @param response - API response object
 * @param fallback - Fallback value if extraction fails
 * @returns Extracted data
 */
export function extractApiData<T = any>(response: any, fallback: T = null as T): T {
  // Handle null/undefined responses
  if (!response) {
    console.warn('extractApiData: Response is null/undefined, returning fallback');
    return fallback;
  }

  // If response is already the data we need (array or simple object)
  if (Array.isArray(response) || (typeof response === 'object' && !response.success && !response.data)) {
    return response as T;
  }

  // Handle nested structure: {success, message, data}
  if (response.data !== undefined) {
    return response.data as T;
  }

  // Handle direct response
  return response as T;
}

/**
 * Extract array data from API response with safety checks
 * استخراج بيانات المصفوفة من استجابة API مع فحوصات الأمان
 * 
 * @param response - API response object
 * @param arrayKey - Key name for the array in the data object (optional)
 * @returns Safe array
 */
export function extractApiArray<T = any>(response: any, arrayKey?: string): T[] {
  const data = extractApiData(response, []);
  
  // If arrayKey is specified, look for it in the data
  if (arrayKey && data && typeof data === 'object' && data[arrayKey]) {
    const arrayData = data[arrayKey];
    return Array.isArray(arrayData) ? arrayData : [];
  }
  
  // If data is already an array, return it
  if (Array.isArray(data)) {
    return data;
  }
  
  // If data is an object with common array property names
  if (data && typeof data === 'object') {
    const commonArrayKeys = ['items', 'results', 'list', 'data', 'users', 'roles', 'modules', 'notifications'];
    
    for (const key of commonArrayKeys) {
      if (data[key] && Array.isArray(data[key])) {
        return data[key];
      }
    }
  }
  
  console.warn('extractApiArray: Could not extract array from response, returning empty array');
  return [];
}

/**
 * Safe filter function that ensures the input is an array
 * دالة فلترة آمنة تضمن أن المدخل هو مصفوفة
 * 
 * @param data - Data to filter
 * @param filterFn - Filter function
 * @returns Filtered array
 */
export function safeFilter<T>(data: any, filterFn: (item: T) => boolean): T[] {
  const safeArray = Array.isArray(data) ? data : [];
  return safeArray.filter(filterFn);
}

/**
 * Safe map function that ensures the input is an array
 * دالة تحويل آمنة تضمن أن المدخل هو مصفوفة
 * 
 * @param data - Data to map
 * @param mapFn - Map function
 * @returns Mapped array
 */
export function safeMap<T, R>(data: any, mapFn: (item: T, index: number) => R): R[] {
  const safeArray = Array.isArray(data) ? data : [];
  return safeArray.map(mapFn);
}

/**
 * Validate and normalize API response
 * التحقق من صحة وتطبيع استجابة API
 * 
 * @param response - API response
 * @param expectedType - Expected data type ('array' | 'object' | 'string' | 'number')
 * @returns Normalized response
 */
export function validateApiResponse(response: any, expectedType: 'array' | 'object' | 'string' | 'number' = 'object') {
  const data = extractApiData(response);
  
  switch (expectedType) {
    case 'array':
      return Array.isArray(data) ? data : [];
    case 'object':
      return (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
    case 'string':
      return typeof data === 'string' ? data : '';
    case 'number':
      return typeof data === 'number' ? data : 0;
    default:
      return data;
  }
}

/**
 * Create a safe API call wrapper with error handling
 * إنشاء غلاف آمن لاستدعاءات API مع معالجة الأخطاء
 * 
 * @param apiCall - API call function
 * @param fallback - Fallback value on error
 * @param errorMessage - Custom error message
 * @returns Safe API call result
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<any>,
  fallback: T,
  errorMessage: string = 'API call failed'
): Promise<T> {
  try {
    const response = await apiCall();
    return extractApiData(response, fallback);
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return fallback;
  }
}

/**
 * Debug API response structure
 * تشخيص هيكل استجابة API
 * 
 * @param response - API response
 * @param label - Debug label
 */
export function debugApiResponse(response: any, label: string = 'API Response') {
  console.group(`🔍 ${label} Debug`);
  console.log('Raw response:', response);
  console.log('Type:', typeof response);
  console.log('Is Array:', Array.isArray(response));
  
  if (response && typeof response === 'object') {
    console.log('Keys:', Object.keys(response));
    console.log('Has success:', 'success' in response);
    console.log('Has data:', 'data' in response);
    console.log('Has message:', 'message' in response);
    
    if (response.data) {
      console.log('Data type:', typeof response.data);
      console.log('Data is Array:', Array.isArray(response.data));
      if (response.data && typeof response.data === 'object') {
        console.log('Data keys:', Object.keys(response.data));
      }
    }
  }
  
  const extracted = extractApiData(response);
  console.log('Extracted data:', extracted);
  console.groupEnd();
}
