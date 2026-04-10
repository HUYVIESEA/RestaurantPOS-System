import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Shift, CreateShiftRequest, CloseShiftRequest } from '../types';
import { shiftService } from '../services/shiftService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface ShiftContextType {
  activeShift: Shift | null;
  loading: boolean;
  startShift: (data: CreateShiftRequest) => Promise<boolean>;
  closeShift: (data: CloseShiftRequest) => Promise<boolean>;
  refreshShift: () => Promise<void>;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const useShift = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
};

export const ShiftProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      refreshShift();
    } else {
      setActiveShift(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshShift = async () => {
    try {
      setLoading(true);
      const shift = await shiftService.getActiveShift();
      setActiveShift(shift);
    } catch (error) {
      console.error('Failed to load active shift', error);
    } finally {
      setLoading(false);
    }
  };

  const startShift = async (data: CreateShiftRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const shift = await shiftService.startShift(data);
      setActiveShift(shift);
      showToast('Đã bắt đầu ca làm việc', 'success');
      return true;
    } catch (error: any) {
      showToast(error.response?.data || 'Không thể bắt đầu ca', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const closeShift = async (data: CloseShiftRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await shiftService.closeShift(data);
      setActiveShift(null);
      showToast('Đã kết thúc ca làm việc', 'success');
      return true;
    } catch (error: any) {
      showToast(error.response?.data || 'Không thể kết thúc ca', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ShiftContext.Provider value={{ activeShift, loading, startShift, closeShift, refreshShift }}>
      {children}
    </ShiftContext.Provider>
  );
};