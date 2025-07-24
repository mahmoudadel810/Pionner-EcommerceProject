import axios from "axios";
import { getApiBaseUrl } from "../config/api.js";
import API_CONFIG from "../config/api.js";

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
    // Skip token check for auth endpoints to prevent infinite loops
    const authEndpoints = ['/auth/refresh-token', '/auth/login', '/auth/signup'];
    if (authEndpoints.some(endpoint => config.url?.includes(endpoint))) {
      return config;
    }
    
    // Try to get token from multiple sources (cookies, localStorage, sessionStorage)
    let accessToken = document.cookie.split("; ")
      .find(row => row.startsWith("accessToken="))
      ?.split("=")[1] || 
      localStorage.getItem("accessToken") || 
      sessionStorage.getItem("accessToken");

    if (accessToken && !config.headers.Authorization) {
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
    // Skip token capture for login and refresh endpoints to prevent loops
    if (response.config.url?.includes('/auth/refresh-token') || 
        response.config.url?.includes('/auth/login')) {
      return response;
    }

    // Capture tokens from headers if present (for cross-origin requests)
    const accessToken = response.headers['x-access-token'];
    const refreshToken = response.headers['x-refresh-token'];

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('accessToken', accessToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; secure=${process.env.NODE_ENV === 'production'}; samesite=Lax`; // 7 days
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; secure=${process.env.NODE_ENV === 'production'}; samesite=Lax`; // 30 days
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if it's already been retried or if it's a refresh token request
    if (originalRequest.url?.includes('/auth/refresh-token') || 
        originalRequest.url?.includes('/auth/login') ||
        originalRequest._retry) {
      return Promise.reject(error);
    }

    // Handle 401 errors (token expired)
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        // Try to get refresh token from multiple sources
        const refreshToken = localStorage.getItem('refreshToken') ||
          sessionStorage.getItem('refreshToken') ||
          document.cookie.split('; ').find(row => row.startsWith('refreshToken='))?.split('=')[1];

        if (refreshToken) {
          // Try to refresh the token - use the full URL without baseURL to prevent double prefixing
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh-token`,
            {},
            {
              withCredentials: true,
              headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.status === 200 && response.data?.success) {
            // Update tokens
            const newAccessToken = response.headers['x-access-token'];
            const newRefreshToken = response.headers['x-refresh-token'];

            if (newAccessToken) {
              localStorage.setItem('accessToken', newAccessToken);
              sessionStorage.setItem('accessToken', newAccessToken);
              document.cookie = `accessToken=${newAccessToken}; path=/; max-age=${60 * 60 * 24 * 7}; secure=${process.env.NODE_ENV === 'production'}; samesite=Lax`;
            }
            
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
              sessionStorage.setItem('refreshToken', newRefreshToken);
              document.cookie = `refreshToken=${newRefreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; secure=${process.env.NODE_ENV === 'production'}; samesite=Lax`;
            }

            // Update the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken || ''}`;
            
            // Retry the original request with the new token
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear all auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Only redirect if not already on login page to prevent loops
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


