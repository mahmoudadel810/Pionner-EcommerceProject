import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { useCartStore } from "./useCartStore.js";
import { useWishlistStore } from "./useWishlistStore.js";
import API_CONFIG, { buildApiUrl } from "../config/api.js";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: false,
  justLoggedOut: false, // Add flag to prevent immediate auth check after logout
  error: null,

  // Initialize user from localStorage on store creation
  initializeUser: () =>
  {
    try
    {
      const storedUser = localStorage.getItem('user');
      if (storedUser)
      {
        const userData = JSON.parse(storedUser);
        set({ user: userData });
        return userData;
      }
    } catch (error)
    {
      localStorage.removeItem('user'); // Clear corrupted data
    }
    return null;
  },

  signup: async ({ name, email, phone, password, confirmPassword }) =>
  {
    set({ loading: true });

    if (password !== confirmPassword)
    {
      set({ loading: false });
      toast.error("Passwords do not match");
      return { success: false, message: "Passwords do not match" };
    }

    try
    {
      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP), {
        name,
        email,
        phone,
        password,
        confirmPassword,
      });

      set({ loading: false });

      if (response.data && response.data.success)
      {
        toast.success("Account created successfully! Please check your email to confirm your account.");
        // Don't set user here since they need to confirm email first
        return response.data;
      } else
      {
        throw new Error(response.data?.message || "Signup failed");
      }
    } catch (error)
    {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during signup.";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  // A more robust login function
  login: async (email, password) =>
  {
    set({ loading: true, justLoggedOut: false }); // Clear logout flag on login
    try
    {
      // Clear any existing user data before logging in
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), { email, password });
      if (response.data && response.data.success)
      {
        // Clear any existing user data before setting new user
        localStorage.removeItem('user');
        
        // Store the new user data
        if (response.data?.data?.user)
        {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        set({ user: response.data, loading: false, justLoggedOut: false });
        toast.success("Login successful!");
        return response.data;
      } else
      {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (error)
    {
      set({ loading: false });

      // Handle specific login errors
      const errorMessage = error.response?.data?.message || error.message || "An error occurred during login.";
      const statusCode = error.response?.status;

      // Show specific toast messages based on error type
      if (statusCode === 400 || statusCode === 401)
      {
        // Check for specific error messages
        if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('not found'))
        {
          toast.error('Account not found. Please check your email or sign up.');
        }
        else if (errorMessage.toLowerCase().includes('password') && errorMessage.toLowerCase().includes('incorrect'))
        {
          toast.error('Incorrect password. Please try again.');
        }
        else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('not verified'))
        {
          toast.error('Please verify your email address first.');
        }
        else
        {
          toast.error('Invalid email or password. Please check your credentials.');
        }
      }
      else if (statusCode === 429)
      {
        toast.error('Too many login attempts. Please try again later.');
      }
      else if (statusCode >= 500)
      {
        toast.error('Server error. Please try again later.');
      }
      else
      {
        toast.error(errorMessage || 'Login failed. Please try again.');
      }

      return {
        success: false,
        message: errorMessage,
        error: error.response?.data?.error || 'login_failed'
      };
    }
  },

  forgetPassword: async email =>
  {
    set({ loading: true });
    try
    {
      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD), { email });
      set({ loading: false });

      if (response.data && response.data.success)
      {
        toast.success("Password reset email sent successfully!");
        return response.data;
      } else
      {
        throw new Error(response.data?.message || "Failed to send reset email");
      }
    } catch (error)
    {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while sending reset email.";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  resetPassword: async ({ code, newPassword, confirmNewPassword }) =>
  {
    set({ loading: true });

    if (newPassword !== confirmNewPassword)
    {
      set({ loading: false });
      toast.error("New passwords do not match");
      return { success: false, message: "New passwords do not match" };
    }

    try
    {
      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD), {
        code,
        newPassword,
        confirmNewPassword,
      });
      set({ loading: false });

      if (response.data && response.data.success)
      {
        toast.success("Password reset successfully!");
        return response.data;
      } else
      {
        throw new Error(response.data?.message || "Password reset failed");
      }
    } catch (error)
    {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while resetting password.";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  logout: async () =>
  {
    try
    {
      // Clear user state immediately and set logout flag
      set({ user: null, checkingAuth: false, justLoggedOut: true });

      // Try to logout on server
      await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT));

      // Clear any stored tokens or auth data
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      // Clear all stores
      await get().clearAllStores();

      // Clear logout flag after a delay to allow for navigation
      setTimeout(() =>
      {
        set({ justLoggedOut: false });
      }, 2000);

      toast.success("Logged out successfully");
      return { success: true };
    } catch (error)
    {
      const errorMessage =
        error.response?.data?.message || "An error occurred during logout";

      // Even if logout fails on server, clear local state
      set({ user: null, checkingAuth: false, justLoggedOut: true });
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      // Clear all stores even on error
      await get().clearAllStores();

      // Clear logout flag after a delay
      setTimeout(() =>
      {
        set({ justLoggedOut: false });
      }, 2000);

      toast.success("Logged out successfully");
      return { success: true };
    }
  },

  checkAuth: async (force = false) =>
  {
    // Don't check auth if just logged out (unless forced)
    if (get().justLoggedOut && !force)
    {
      return;
    }

    // If not forced and user is null, don't check (normal behavior)
    if (!force && get().user === null)
    {
      return;
    }

    // Check if we have any authentication tokens before making the request
    const hasToken = localStorage.getItem('accessToken') || 
                    sessionStorage.getItem('accessToken') ||
                    document.cookie.includes('accessToken');
    
    if (!hasToken && !force) {
      // No token found, clear user data and don't make unnecessary request
      localStorage.removeItem('user');
      set({ checkingAuth: false, user: null });
      return { success: false, user: null };
    }

    set({ checkingAuth: true });

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() =>
    {
      // Clear user data on timeout
      localStorage.removeItem('user');
      set({ checkingAuth: false, user: null });
    }, 5000); // 5 second timeout

    try
    {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.PROFILE));
      clearTimeout(timeoutId);

      if (response.data && response.data.success && response.data.data)
      {
        // Store updated user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        set({ user: response.data, checkingAuth: false });
        return { success: true, user: response.data };
      } else
      {
        // Clear user data when authentication fails
        localStorage.removeItem('user');
        set({ checkingAuth: false, user: null });
        return { success: false, user: null };
      }
    } catch (error)
    {
      clearTimeout(timeoutId);
      // Clear user data on any auth check error
      localStorage.removeItem('user');
      console.log("Auth check failed:", error.response?.data?.message || "No valid session");
      set({ checkingAuth: false, user: null });
      return { success: false, error: error.response?.data?.message || "Auth check failed" };
    }
  },

  clearLogoutFlag: () =>
  {
    set({ justLoggedOut: false });
  },

  // Clear all stores when user logs out
  clearAllStores: async () =>
  {
    try
    {
      // Clear cart store
      useCartStore.setState({
        cart: [],
        coupon: null,
        total: 0,
        subtotal: 0,
        isCouponApplied: false
      });

      // Clear wishlist store
      useWishlistStore.setState({
        wishlist: [],
        loading: false,
        error: null
      });

      // Stores cleared successfully
    } catch (error)
    {
      // Error clearing stores
    }
  },

  // Force logout - completely clear everything
  forceLogout: async () =>
  {
    // Clear all state
    set({ user: null, checkingAuth: false, justLoggedOut: true });

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear cookies by setting them to expire
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Clear all stores
    await get().clearAllStores();

    // Clear logout flag after delay
    setTimeout(() =>
    {
      set({ justLoggedOut: false });
    }, 2000);
  },

  // Debug function removed for production

  refreshToken: async () =>
  {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try
    {
      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN));
      set({ checkingAuth: false });
      return response.data;
    } catch (error)
    {
      // Clear user state and stop checking auth on refresh failure
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },

  // Direct user setter to avoid triggering auth checks
  setUser: (userData) =>
  {
    set({ user: userData });
  },
}));

// Subscribe to user state changes to clear other stores when user becomes null
useUserStore.subscribe(
  (state) => state.user,
  (user) =>
  {
    if (user === null)
    {
      // Clear other stores when user becomes null
      setTimeout(async () =>
      {
        try
        {
          useCartStore.setState({
            cart: [],
            coupon: null,
            total: 0,
            subtotal: 0,
            isCouponApplied: false
          });

          useWishlistStore.setState({
            wishlist: [],
            loading: false,
            error: null
          });

          // Stores cleared due to user state change
        } catch (error)
        {
          // Error clearing stores on user change
        }
      }, 100); // Small delay to ensure logout process completes
    }
  }
);

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
  response => response,
  async error =>
  {
    const originalRequest = error.config;

    // Handle 401 errors (token refresh) - but only for non-auth endpoints and when user exists
    if (error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/') &&
      useUserStore.getState().user &&
      document.cookie.includes('refreshToken'))
    { // Only try refresh if refresh token exists
      originalRequest._retry = true;

      try
      {
        if (refreshPromise)
        {
          await refreshPromise;
          return axios(originalRequest);
        }

        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError)
      {
        // If refresh token fails, clear user state and don't retry
        refreshPromise = null;
        useUserStore.getState().logout();
        return Promise.reject(error); // Return the original error, not the refresh error
      }
    }

    return Promise.reject(error);
  }
);


