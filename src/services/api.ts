import axios from 'axios';
import { getApiBaseUrl as getDynamicApiUrl } from '../utils/networkUtils';

// Retry utility function
const retryRequest = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR')) {
      console.log(`Retrying request... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Dynamic API URL detection
const getApiBaseUrl = () => {
  // Use the dynamic IP detection utility
  return getDynamicApiUrl();
};

const API_BASE_URL = process.env.REACT_APP_API_URL || getApiBaseUrl();

// Create axios instance with proper base URL handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token and handle /api prefix
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For Nginx setup, ensure /api prefix is properly handled
    const baseUrl = getApiBaseUrl();
    if (!baseUrl.includes(':5000') && !config.url?.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
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

// Wrapper methods with retry logic
export const apiWithRetry = {
  get: <T>(url: string, config?: any) => {
    return retryRequest(() => api.get(url, config));
  },
  post: <T>(url: string, data?: any, config?: any) => {
    return retryRequest(() => api.post(url, data, config));
  },
  put: <T>(url: string, data?: any, config?: any) => {
    return retryRequest(() => api.put(url, data, config));
  },
  delete: <T>(url: string, config?: any) => {
    return retryRequest(() => api.delete(url, config));
  }
};

export default api;
