
import axios from 'axios';

// URL base del backend - Puerto 3000
const API_BASE_URL = import.meta.env.VITE_API_KEY || 'http://localhost:3000/api/v1';


export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});


apiClient.interceptors.request.use(
  (config) => {
    let token = null;
    const authStorageStr = localStorage.getItem('auth-storage');
    if (authStorageStr) {
      try {
        token = JSON.parse(authStorageStr).state?.token;
      } catch (e) {}
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
   
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
