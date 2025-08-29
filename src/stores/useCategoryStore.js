import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";
import API_CONFIG, { buildApiUrl } from "../config/api.js";
import { getTranslation } from "../utils/i18nUtils.js";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  setCategories: (categories) => set({ categories }),

  // Create a new category
  createCategory: async (categoryData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.CREATE), categoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data && response.data.success) {
        set(prevState => ({
          categories: [...prevState.categories, response.data.data],
          loading: false,
        }));
        return { success: true, data: response.data.data };
      } else {
        throw new Error("Failed to create category");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        getTranslation('category.errors.createFailed');
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  // Fetch all categories
  fetchAllCategories: async () => {
    const currentState = get();
    if (currentState.loading) {
      console.log("⏳ Category fetch already in progress");
      return { success: false, message: "Request already in progress" };
    }
    
    set({ loading: true, error: null });
    try {
      // Add limit parameter to get ALL categories (not just the default 10)
      // Also add sortBy=order to get them in the correct display order
      // Note: Backend currently only returns ACTIVE categories (isActive: true)
      const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.GET_ALL) + "?limit=1000&sortBy=order&sortOrder=asc";
      console.log("🌐 Fetching categories from API:", apiUrl);
      const response = await axios.get(apiUrl);
      console.log("📡 Category API response:", response.data);
      
      if (response.data && response.data.success) {
        const categories = response.data.data || [];
        console.log("✅ Setting categories in store:", categories);
        set({ categories, loading: false });
        return { success: true, data: categories };
      } else {
        console.log("⚠️ API response not successful:", response.data);
        set({ categories: [], loading: false });
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      const errorMessage =
        error.response?.data?.message || 
        error.response?.data?.error || 
        getTranslation('category.errors.fetchFailed');
      set({ error: errorMessage, loading: false, categories: [] });
      return { success: false, message: errorMessage };
    }
  },

  // Fetch featured categories
  fetchFeaturedCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.GET_FEATURED));
      if (response.data && response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        return { success: true, data: [] };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 
        error.response?.data?.error || 
        getTranslation('category.errors.fetchFeaturedFailed');
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  // Update category
  updateCategory: async (categoryId, categoryData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(
        buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.UPDATE(categoryId)), 
        categoryData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data && response.data.success) {
        set(prevState => ({
          categories: prevState.categories.map(category =>
            category._id === categoryId ? response.data.data : category
          ),
          loading: false,
        }));
        return { success: true, data: response.data.data };
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        getTranslation('category.errors.updateFailed');
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.DELETE(categoryId)));
      
      if (response.data && response.data.success) {
        set(prevState => ({
          categories: prevState.categories.filter(category => category._id !== categoryId),
          loading: false,
        }));
        return { success: true };
      } else {
        throw new Error("Failed to delete category");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        getTranslation('category.errors.deleteFailed');
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  // Toggle category status
  toggleCategoryStatus: async (categoryId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.TOGGLE_STATUS(categoryId)));
      
      if (response.data && response.data.success) {
        set(prevState => ({
          categories: prevState.categories.map(category =>
            category._id === categoryId ? response.data.data : category
          ),
          loading: false,
        }));
        return { success: true, data: response.data.data };
      } else {
        throw new Error("Failed to update category status");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        getTranslation('category.errors.toggleStatusFailed');
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.GET_BY_ID(categoryId)));
      
      if (response.data && response.data.success) {
        set({ loading: false });
        return { success: true, data: response.data.data };
      } else {
        throw new Error("Category not found");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        getTranslation('category.errors.fetchByIdFailed');
      set({ loading: false, error: errorMessage });
      return { success: false, message: errorMessage };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear categories
  clearCategories: () => set({ categories: [], error: null }),
}));