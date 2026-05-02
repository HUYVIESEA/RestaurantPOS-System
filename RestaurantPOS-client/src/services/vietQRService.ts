import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface PaymentSettings {
  isConfigured: boolean;
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  message?: string;
}

export interface GenerateQRRequest {
  bankBin: string;
  accountNumber: string;
  amount: number;
  description: string;
  accountName?: string;
}

export interface UpdatePaymentSettingsRequest {
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  password?: string;
}

export const vietQRService = {
  getPaymentSettings: async (): Promise<PaymentSettings> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/PaymentSettings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  generateQR: async (request: GenerateQRRequest): Promise<{ qrUrl: string }> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/VietQR/generate`, request, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getBanks: async () => {
    const response = await axios.get(`${API_URL}/VietQR/banks`);
    return response.data;
  },
  
  updateSettings: async (settings: UpdatePaymentSettingsRequest) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/PaymentSettings`, settings, {
        headers: { Authorization: `Bearer ${token}`}
    });
    return response.data;
  }
};
