import api from './api';
import { extractApiArray, debugApiResponse } from '@/utils/apiHelpers';

// Description: Get list of all users with filtering options
// Endpoint: GET /api/users
// Response: Array of users with roles
export const getUsers = async () => {
  try {
    const response = await api.get('/api/users');
    debugApiResponse(response.data, 'getUsers');

    // Extract users array from nested structure
    return extractApiArray(response.data, 'users');
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user by ID
// Endpoint: GET /api/users/:id
export const getUserById = async (id: string) => {
  try {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create new user
// Endpoint: POST /api/users
export const createUser = async (userData: { email: string; password: string }) => {
  try {
    const response = await api.post('/api/users', userData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update user
// Endpoint: PUT /api/users/:id
export const updateUser = async (id: string, userData: { email?: string; isActive?: boolean }) => {
  try {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete user
// Endpoint: DELETE /api/users/:id
export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};