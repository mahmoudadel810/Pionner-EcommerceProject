import axios from "axios";
import API_CONFIG, { getApiBaseUrl } from "../config/api.js";

const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const readCookie = (name) =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

const storeToken = (name, value, maxAge) => {
  localStorage.setItem(name, value);
  sessionStorage.setItem(name, value);
  const secure = import.meta.env.PROD ? "; secure" : "";
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; samesite=Lax${secure}`;
};

const clearTokens = () => {
  for (const name of ["accessToken", "refreshToken"]) {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

const storeTokensFromHeaders = (headers) => {
  const accessToken = headers["x-access-token"];
  const refreshToken = headers["x-refresh-token"];
  if (accessToken) storeToken("accessToken", accessToken, ACCESS_TOKEN_MAX_AGE);
  if (refreshToken) storeToken("refreshToken", refreshToken, REFRESH_TOKEN_MAX_AGE);
  return accessToken;
};

axiosInstance.interceptors.request.use((config) => {
  // Auth endpoints manage their own tokens; attaching a stale one can cause refresh loops.
  const authEndpoints = ["/auth/refresh-token", "/auth/login", "/auth/signup"];
  if (authEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
    return config;
  }

  const accessToken =
    readCookie("accessToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    const url = response.config.url || "";
    if (!url.includes("/auth/refresh-token") && !url.includes("/auth/login")) {
      // Cross-origin deployments cannot read the API's cookies, so tokens are also sent as headers.
      storeTokensFromHeaders(response.headers);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/login") ||
      error.response?.status !== 401
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken") ||
      readCookie("refreshToken");

    if (!refreshToken) {
      return Promise.reject(error);
    }

    try {
      // Plain axios, not the instance, so this request skips the interceptors above.
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/refresh-token`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data?.success) {
        const newAccessToken = storeTokensFromHeaders(response.headers);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken || ""}`;
        return axiosInstance(originalRequest);
      }
    } catch {
      clearTokens();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
