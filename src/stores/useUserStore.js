import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { useCartStore } from "./useCartStore.js";
import { useWishlistStore } from "./useWishlistStore.js";
import API_CONFIG, { buildApiUrl } from "../config/api.js";
import { getTranslation } from "../utils/i18nUtils.js";

const clearStoredSession = () =>
{
  for (const key of ['user', 'accessToken', 'refreshToken'])
  {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    document.cookie = `${key}=; path=/; max-age=0`;
  }
};

const readStoredUser = () =>
{
  try
  {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch
  {
    localStorage.removeItem('user');
    return null;
  }
};

export const useUserStore = create((set, get) => ({
  // Read synchronously so protected routes don't redirect before the first render.
  user: readStoredUser(),
  loading: false,
  checkingAuth: false,
  // Set briefly after logout so the app doesn't immediately re-check the session.
  justLoggedOut: false,
  error: null,

  initializeUser: () =>
  {
    const userData = readStoredUser();
    set({ user: userData });
    return userData;
  },

  signup: async ({ name, email, phone, password, confirmPassword }) =>
  {
    set({ loading: true });

    if (password !== confirmPassword)
    {
      set({ loading: false });
      toast.error(getTranslation('auth.errors.passwordMismatch', 'Passwords do not match'));
      return { success: false, message: getTranslation('auth.errors.passwordMismatch', 'Passwords do not match') };
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
        toast.success(getTranslation('auth.signup.success', 'Account created successfully! Please check your email to confirm your account.'));
        // The user is not logged in until the email address is confirmed.
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
      toast.error(getTranslation('auth.errors.signupFailed', 'An error occurred during signup.'));
      return { success: false, message: errorMessage };
    }
  },

  login: async (email, password) =>
  {
    set({ loading: true, justLoggedOut: false });
    try
    {
      clearStoredSession();

      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), { email, password });
      if (response.data && response.data.success)
      {
        if (response.data?.data?.user)
        {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        set({ user: response.data, loading: false, justLoggedOut: false });
        toast.success(getTranslation('auth.loginSuccess'));
        return response.data;
      } else
      {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (error)
    {
      set({ loading: false });

      const errorMessage = error.response?.data?.message || error.message || "An error occurred during login.";
      const statusCode = error.response?.status;

      if (statusCode === 400 || statusCode === 401)
      {
        if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('not found'))
        {
          toast.error(getTranslation('auth.errors.accountNotFound', 'Account not found. Please check your email or sign up.'));
        }
        else if (errorMessage.toLowerCase().includes('password') && errorMessage.toLowerCase().includes('incorrect'))
        {
          toast.error(getTranslation('auth.errors.incorrectPassword', 'Incorrect password. Please try again.'));
        }
        else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('not verified'))
        {
          toast.error(getTranslation('auth.errors.emailNotVerified', 'Please verify your email address first.'));
        }
        else
        {
          toast.error(getTranslation('auth.errors.invalidCredentials', 'Invalid email or password. Please check your credentials.'));
        }
      }
      else if (statusCode === 429)
      {
        toast.error(getTranslation('auth.errors.tooManyAttempts', 'Too many login attempts. Please try again later.'));
      }
      else if (statusCode >= 500)
      {
        toast.error(getTranslation('auth.errors.serverError', 'Server error. Please try again later.'));
      }
      else
      {
        toast.error(getTranslation('auth.errors.loginFailed', 'Login failed. Please try again.'));
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
        toast.success(getTranslation('auth.forgotPassword.emailSent', 'Password reset email sent successfully!', { email }));
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
      toast.error(getTranslation('auth.errors.resetEmailFailed', 'An error occurred while sending reset email.'));
      return { success: false, message: errorMessage };
    }
  },

  resetPassword: async ({ code, newPassword, confirmNewPassword }) =>
  {
    set({ loading: true });

    if (newPassword !== confirmNewPassword)
    {
      set({ loading: false });
      toast.error(getTranslation('auth.errors.passwordMismatch', 'New passwords do not match'));
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
        toast.success(getTranslation('auth.resetPassword.success', 'Password reset successfully!'));
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
      toast.error(getTranslation('auth.errors.resetPasswordFailed', 'An error occurred while resetting password.'));
      return { success: false, message: errorMessage };
    }
  },

  logout: async () =>
  {
    // Drop the cached user first so nothing re-initialises the session while the request is in flight.
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    get().clearAllStores();
    set({ user: null, checkingAuth: false, justLoggedOut: true });

    try
    {
      await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT));
    } catch
    {
      // The local session is cleared below even if the server call fails.
    }

    clearStoredSession();

    setTimeout(() =>
    {
      set({ justLoggedOut: false });
    }, 2000);

    toast.success(getTranslation('auth.logout.success', 'Logged out successfully'));
    return { success: true };
  },

  checkAuth: async (force = false) =>
  {
    if (get().justLoggedOut && !force)
    {
      return;
    }

    if (!force && get().user === null)
    {
      return;
    }

    const hasToken = localStorage.getItem('accessToken') ||
                    sessionStorage.getItem('accessToken') ||
                    document.cookie.includes('accessToken');

    if (!hasToken && !force) {
      localStorage.removeItem('user');
      set({ checkingAuth: false, user: null });
      return { success: false, user: null };
    }

    set({ checkingAuth: true });

    // Don't leave the app on a spinner if the API is unreachable.
    const timeoutId = setTimeout(() =>
    {
      localStorage.removeItem('user');
      set({ checkingAuth: false, user: null });
    }, 5000);

    try
    {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.PROFILE));
      clearTimeout(timeoutId);

      if (response.data && response.data.success && response.data.data)
      {
        localStorage.setItem('user', JSON.stringify(response.data));
        set({ user: response.data, checkingAuth: false });
        return { success: true, user: response.data };
      } else
      {
        localStorage.removeItem('user');
        set({ checkingAuth: false, user: null });
        return { success: false, user: null };
      }
    } catch (error)
    {
      clearTimeout(timeoutId);
      localStorage.removeItem('user');
      set({ checkingAuth: false, user: null });
      return { success: false, error: error.response?.data?.message || "Auth check failed" };
    }
  },

  clearAllStores: () =>
  {
    useCartStore.setState({
      cart: [],
      coupon: null,
      total: 0,
      subtotal: 0,
      isCouponApplied: false,
      cartLoaded: false
    });

    useWishlistStore.setState({
      wishlist: [],
      loading: false,
      loaded: false,
      error: null
    });
  },

  // Updates the user without triggering an auth check.
  setUser: (userData) =>
  {
    set({ user: userData });
  },
}));
