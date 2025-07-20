import axios from "axios";
import { getApiBaseUrl } from "../config/api.js";

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // send cookies to the server
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for production
axiosInstance.interceptors.request.use(
  (config) => {
    // Add access token from localStorage if available
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Capture tokens from headers if present
    const accessToken = response.headers['x-access-token'];
    const refreshToken = response.headers['x-refresh-token'];
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
