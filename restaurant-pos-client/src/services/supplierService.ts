import apiClient from './api';
import { Supplier } from '../types';

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<Supplier[]>('/Suppliers');
    return response.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await apiClient.get<Supplier>(`/Suppliers/${id}`);
    return response.data;
  },

  create: async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    const response = await apiClient.post<Supplier>('/Suppliers', supplier);
    return response.data;
  },

  update: async (id: number, supplier: Supplier): Promise<void> => {
    await apiClient.put(`/Suppliers/${id}`, supplier);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Suppliers/${id}`);
  },

  toggleStatus: async (id: number): Promise<{ isActive: boolean }> => {
    const response = await apiClient.patch<{ isActive: boolean }>(`/Suppliers/${id}/toggle-status`);
    return response.data;
  },
};
