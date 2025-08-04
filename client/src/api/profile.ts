import api from './api';

// Description: Get user profile information
// Endpoint: GET /api/profile
// Request: {}
// Response: { profile: {_id: string, name: string, email: string, avatar: string, phone: string, department: string, role: string, joinedAt: string, lastLogin: string} }
export const getUserProfile = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        profile: {
          _id: '1',
          name: 'أحمد محمد',
          email: 'ahmed.mohamed@company.com',
          avatar: '',
          phone: '+966501234567',
          department: 'تقنية المعلومات',
          role: 'مدير النظام',
          joinedAt: '2024-01-15',
          lastLogin: '2024-01-20T10:30:00Z'
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/profile');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Update user profile information
// Endpoint: PUT /api/profile
// Request: { name?: string, email?: string, phone?: string, avatar?: string }
// Response: { success: boolean, message: string, profile: object }
export const updateUserProfile = (profileData: any) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'تم تحديث الملف الشخصي بنجاح',
        profile: {
          _id: '1',
          ...profileData
        }
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put('/api/profile', profileData);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Change user password
// Endpoint: PUT /api/profile/password
// Request: { currentPassword: string, newPassword: string, confirmPassword: string }
// Response: { success: boolean, message: string }
export const changePassword = (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'تم تغيير كلمة المرور بنجاح'
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put('/api/profile/password', passwordData);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Upload user avatar
// Endpoint: POST /api/profile/avatar
// Request: FormData with avatar file
// Response: { success: boolean, message: string, avatarUrl: string }
export const uploadAvatar = (file: File) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          success: true,
          message: 'تم رفع الصورة بنجاح',
          avatarUrl: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }, 1500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   const formData = new FormData();
  //   formData.append('avatar', file);
  //   return await api.post('/api/profile/avatar', formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' }
  //   });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}