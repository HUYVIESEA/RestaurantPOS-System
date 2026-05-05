import apiClient from './api';
import { Order, OrderItem, PagedResult } from '../types';

export const orderService = {
  getAll: async (status?: string): Promise<Order[]> => {
    // Analytics needs ALL orders to calculate revenue, growth, etc.
    // The backend endpoint is paged, so we request a large page size.
    const url = status 
      ? `/Orders?page=1&pageSize=1000&status=${status}` 
      : '/Orders?page=1&pageSize=1000';
    const response = await apiClient.get<PagedResult<Order>>(url);
    // Normalize response: check if it's paged
    if (response.data && 'items' in response.data) {
       return response.data.items;
    }
    // Fallback if backend changes to return array directly
    return response.data as unknown as Order[];
  },

  getById: async (id: number): Promise<Order> => {
    const response = await apiClient.get<Order>(`/Orders/${id}`);
    return response.data;
  },

  getByTable: async (tableId: number): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>(`/Orders/Table/${tableId}`);
    return response.data;
  },

  create: async (order: Omit<Order, 'id' | 'orderDate' | 'totalAmount'>): Promise<Order> => {
    const response = await apiClient.post<Order>('/Orders', order);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<void> => {
    // Backend expects UpdateOrderStatusRequest DTO: { status: string }
    await apiClient.patch(`/Orders/${id}/Status`, { status });
  },

  // ✅ NEW: Complete order and process payment
  completeOrder: async (id: number, receivedAmount: number, paymentMethod: string): Promise<Order> => {
    const response = await apiClient.put<Order>(`/Orders/${id}/Complete`, {
      receivedAmount,
      paymentMethod
    });
    return response.data;
  },

  // ✅ NEW: Add item to existing order
  addItem: async (orderId: number, item: Omit<OrderItem, 'id' | 'orderId' | 'unitPrice' | 'order' | 'product'>): Promise<Order> => {
    const response = await apiClient.post<Order>(`/Orders/${orderId}/Items`, item);
    return response.data;
  },

  addItems: async (orderId: number, items: Omit<OrderItem, 'id' | 'orderId' | 'unitPrice' | 'order' | 'product'>[]): Promise<Order> => {
    const response = await apiClient.post<Order>(`/Orders/${orderId}/Items/bulk`, items);
    return response.data;
  },

  // ✅ NEW: Update item quantity
  updateItemQuantity: async (orderId: number, itemId: number, quantity: number): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/Orders/${orderId}/Items/${itemId}`, quantity);
    return response.data;
  },

  // ✅ NEW: Remove item from order
  removeItem: async (orderId: number, itemId: number): Promise<Order> => {
    const response = await apiClient.delete<Order>(`/Orders/${orderId}/Items/${itemId}`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Orders/${id}`);
  },
};
