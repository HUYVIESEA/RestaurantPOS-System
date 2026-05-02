import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const createPaymentUrl = async (amount: number, orderDescription: string, orderType: string = 'other') => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/Payment/create-payment-url`,
      {
        amount,
        orderDescription,
        orderType,
        name: "Khach hang" // Có thể lấy từ user profile
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating payment URL:', error);
    throw error;
  }
};

export const verifyPayment = async (queryParams: string) => {
  try {
    const response = await axios.get(`${API_URL}/Payment/payment-callback${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};
