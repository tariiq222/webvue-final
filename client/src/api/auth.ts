import api from './api';

// Description: Login user functionality
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string }
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    console.log('API login response:', response.data); // Debug log

    // Return the nested data structure to match what AuthContext expects
    if (response.data && response.data.success && response.data.data) {
      return response.data.data; // Return the nested data object
    } else {
      // Fallback for different response structures
      return response.data;
    }
  } catch (error: any) {
    console.error('Login error:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
    throw new Error(errorMessage);
  }
};

// Description: Register user functionality
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string }
// Response: { email: string }
export const register = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/register', { email, password });
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw new Error(error?.response?.data?.error || error?.response?.data?.message || error.message);
  }
};

// Description: Logout
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    return await api.post('/auth/logout');
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};
