import api from './api';
import { Shift, CreateShiftRequest, CloseShiftRequest } from '../types';

export const shiftService = {
  getActiveShift: async (): Promise<Shift | null> => {
    try {
      const response = await api.get('/shifts/active');
      return response.data ? response.data : null;
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 204) {
        return null;
      }
      throw error;
    }
  },

  startShift: async (data: CreateShiftRequest): Promise<Shift> => {
    const response = await api.post('/shifts/start', data);
    return response.data;
  },

  closeShift: async (data: CloseShiftRequest): Promise<Shift> => {
    const response = await api.post('/shifts/close', data);
    return response.data;
  },

  getShifts: async (startDate?: string, endDate?: string): Promise<Shift[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/shifts?${params.toString()}`);
    return response.data;
  }
};