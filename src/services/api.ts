import axios from 'axios';

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

// API URL with network support and fallback
const getApiBaseUrl = () => {
  // Try network URL first, fallback to localhost
  const networkUrl = process.env.REACT_APP_NETWORK_API_URL;
  const localUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  // For development, try network first, then localhost
  if (process.env.NODE_ENV === 'development') {
    return networkUrl || localUrl;
  }
  
  return localUrl;
};

const API_BASE_URL = getApiBaseUrl();

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('📱 Network IP:', process.env.NETWORK_IP);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  get: (url: string, config?: any) => {
    return retryRequest(() => api.get(url, config));
  },
  post: (url: string, data?: any, config?: any) => {
    return retryRequest(() => api.post(url, data, config));
  },
  put: (url: string, data?: any, config?: any) => {
    return retryRequest(() => api.put(url, data, config));
  },
  delete: (url: string, config?: any) => {
    return retryRequest(() => api.delete(url, config));
  }
};

export default api;
