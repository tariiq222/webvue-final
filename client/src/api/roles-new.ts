import api from './api';

// Description: Get list of all roles
// Endpoint: GET /api/roles
export const getRoles = async () => {
  try {
    const response = await api.get('/api/roles');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create new role
// Endpoint: POST /api/roles
export const createRole = async (roleData: { name: string; description?: string; permissions?: string[] }) => {
  try {
    const response = await api.post('/api/roles', roleData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating role:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update role
// Endpoint: PUT /api/roles/:id
export const updateRole = async (id: string, roleData: { name?: string; description?: string; permissions?: string[] }) => {
  try {
    const response = await api.put(`/api/roles/${id}`, roleData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating role:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete role
// Endpoint: DELETE /api/roles/:id
export const deleteRole = async (id: string) => {
  try {
    const response = await api.delete(`/api/roles/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting role:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};
