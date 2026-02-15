
import axios from 'axios';

// URL base del backend - Puerto 3000
const API_BASE_URL = import.meta.env.VITE_API_KEY || 'https://localhost:3000/api/v1';


export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});


apiClient.interceptors.request.use(
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


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
   
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/dashboard';
    }
    return Promise.reject(error);
  }
);
