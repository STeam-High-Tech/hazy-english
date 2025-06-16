import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { API_CONFIG } from '../config';

// Create axios instance with default config
const createAxiosInstance = (config?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    ...config,
  });

  return instance;
};

// Non-authenticated instance
export const publicAxios = createAxiosInstance();

// Authenticated instance with token
const getAuthAxios = (): AxiosInstance => {
  const instance = createAxiosInstance();
  
  // Add request interceptor to include auth token
  instance.interceptors.request.use(
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

  return instance;
};

// Export the authenticated instance
export const authAxios = getAuthAxios();

// Function to update axios headers after login/logout
export const updateAuthToken = (token: string | null) => {
  if (token) {
    authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete authAxios.defaults.headers.common['Authorization'];
  }
};

// Export the axios instance creator in case it's needed elsewhere
export default {
  public: publicAxios,
  auth: authAxios,
  updateAuthToken,
};
