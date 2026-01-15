import axios from 'axios';

/**
 * Axios instance with base configuration
 * Uses environment variable for backend URL, or '/api' for relative path (Vercel)
 * 
 * For Vercel deployment: Use '/api' (relative path) - Vercel will route to serverless function
 * For separate backend: Set VITE_API_URL=https://your-backend.vercel.app/api
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // JWT tokens in headers, not cookies
});

/**
 * Request interceptor to add JWT token to headers
 */
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

/**
 * Response interceptor to handle token expiration and errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
