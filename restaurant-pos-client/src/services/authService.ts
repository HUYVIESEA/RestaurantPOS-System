import apiClient from './api';
import { LoginRequest, RegisterRequest, LoginResponse, User } from '../types/auth';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log('📡 Calling API:', '/Auth/Login', data);
    try {
      const response = await apiClient.post<LoginResponse>('/Auth/Login', data);
      console.log('📥 API Response:', response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('💾 Token saved to localStorage');
      }
      return response.data;
    } catch (error: any) {
      console.error('🚫 API Error:', error);
      console.error('🚫 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/Auth/Register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): LoginResponse | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  return null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
  const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/Auth/Users');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/Auth/Users/${id}`);
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/Auth/ChangePassword', { oldPassword, newPassword });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/Auth/ForgotPassword', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/Auth/ResetPassword', { token, newPassword });
  },

  validateResetToken: async (token: string): Promise<void> => {
await apiClient.get(`/Auth/ValidateResetToken/${token}`);
  },

  // ✅ NEW: Update user by ID
  updateUser: async (id: number, data: { fullName: string; email: string; role: string }): Promise<void> => {
    await apiClient.put(`/Auth/Users/${id}`, data);
  },

  // ✅ NEW: Delete user by ID
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/Auth/Users/${id}`);
  },
};
