import axios from 'axios';

// Auto-detect API URL based on current hostname
// If accessing via LAN (not localhost), use the same hostname for API
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // If running on localhost, use env variable or default
  if (isLocalhost) {
    return (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
  }
  
  // If accessing via LAN, construct API URL using current hostname
  const protocol = window.location.protocol;
  const apiPort = 5000; // API server port
  const apiUrl = `${protocol}//${hostname}:${apiPort}/api`;
  
  console.log('🌐 API Base URL:', apiUrl);
  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
