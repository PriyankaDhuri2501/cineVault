import axios from 'axios';

/**
 * Get API base URL
 * For monorepo setup: Uses relative '/api' path (same domain)
 * If VITE_API_URL is set, uses that (for separate backend deployment)
 * In development, '/api' is proxied by Vite to localhost:5000
 */
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isProduction = import.meta.env.PROD;
  
  // If VITE_API_URL is explicitly set, use it (for separate backend)
  if (envUrl) {
    // In production, validate it's not localhost
    if (isProduction && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      console.error('❌ VITE_API_URL cannot use localhost in production!');
      throw new Error('Invalid API URL: localhost is not allowed in production.');
    }
    return envUrl;
  }
  
  // No VITE_API_URL set = monorepo setup, use relative path
  // In production, Vercel rewrites will route /api/* to backend
  // In development, Vite proxy will route /api/* to localhost:5000
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
  timeout: 30000, // 30 second timeout
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
