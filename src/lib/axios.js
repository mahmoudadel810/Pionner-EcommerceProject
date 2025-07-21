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
  (config) =>
  {
    // Try to get token from multiple sources (cookies, localStorage, sessionStorage)
    let accessToken = document.cookie.split("; ").find(row => row.startsWith("accessToken="))?.split("=")[1] || localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

    if (accessToken)
    {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) =>
  {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) =>
  {
    // Capture tokens from headers if present (for cross-origin requests)
    const accessToken = response.headers['x-access-token'];
    const refreshToken = response.headers['x-refresh-token'];

    if (accessToken)
    {
      localStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('accessToken', accessToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; secure=${process.env.NODE_ENV === 'production'}; samesite=Lax`; // 7 days
      console.log('✅ Access token stored successfully');
    }
    if (refreshToken)
    {
      localStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; secure=${process.env.NODE_ENV === 'production'}; samesite=Lax`; // 30 days
      console.log('✅ Refresh token stored successfully');
    }

    return response;
  },
  async (error) =>
  {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry)
    {
      originalRequest._retry = true;

      try
      {
        // Try to get refresh token from multiple sources
        const refreshToken = localStorage.getItem('refreshToken') ||
          sessionStorage.getItem('refreshToken') ||
          document.cookie.split('; ').find(row => row.startsWith('refreshToken='))?.split('=')[1];

        if (refreshToken)
        {
          // Try to refresh the token - use correct endpoint path
          const response = await axios.post(`${getApiBaseUrl()}/v1/auth/refresh-token`, {}, {
            baseURL: '',
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          });

          if (response.data?.success)
          {
            // Update tokens
            const newAccessToken = response.headers['x-access-token'];
            if (newAccessToken)
            {
              localStorage.setItem('accessToken', newAccessToken);
              sessionStorage.setItem('accessToken', newAccessToken);
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

              // Retry the original request
              return axiosInstance(originalRequest);
            }
          }
        }
      } catch (refreshError)
      {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


