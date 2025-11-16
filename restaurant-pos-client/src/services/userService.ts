import apiClient from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role?: string;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  fullName: string;
}

export interface UpdateProfileRequest {
  email: string;
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string; // ✅ Match backend: OldPassword
  newPassword: string;
}

export interface ResetPasswordResponse {
  newPassword: string;
  message: string;
}

export const userService = {
  // Get all users (Admin only)
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/Users');
    return response.data;
  },

  // Get user by ID (Admin only)
  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/Users/${id}`);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/Users/Profile');
    return response.data;
  },

  // Create new user (Admin only)
  create: async (user: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/Users', user);
    return response.data;
  },

  // Update user (Admin only)
  update: async (id: number, user: UpdateUserRequest): Promise<void> => {
    await apiClient.put(`/Users/${id}`, user);
  },

  // Update current user profile
  updateProfile: async (profile: UpdateProfileRequest): Promise<void> => {
    await apiClient.put('/Users/Profile', profile);
  },

  // Change password
  changePassword: async (request: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/Users/ChangePassword', request);
  },

  // Update user role (Admin only)
  updateRole: async (id: number, role: string): Promise<void> => {
    await apiClient.patch(`/Users/${id}/Role`, JSON.stringify(role));
  },

  // Update user status (Admin only)
  updateStatus: async (id: number, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/Users/${id}/Status`, isActive);
  },

  // Reset user password (Admin only)
  resetPassword: async (id: number): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(`/Users/${id}/ResetPassword`);
    return response.data;
  },

  // Delete user (Admin only)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Users/${id}`);
  },
};
