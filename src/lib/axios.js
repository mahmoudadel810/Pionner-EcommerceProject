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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
