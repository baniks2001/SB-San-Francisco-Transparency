import axios from 'axios';

// Dynamic API URL detection
const getApiBaseUrl = () => {
  // Check if running in development mode
  if (process.env.NODE_ENV === 'development') {
    // Check if accessed from network (not localhost)
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    } else {
      // Use the same hostname as the frontend for network access
      return `http://${hostname}:5000/api`;
    }
  }
  // Production fallback
  return '/api';
};

const API_BASE_URL = process.env.REACT_APP_API_URL || getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

export default api;
