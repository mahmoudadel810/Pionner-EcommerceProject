// Centralized API configuration
const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: import.meta.env.VITE_API_URL || 'https://pionner-server-prod-v0-1.onrender.com/api/v1',
  
  // API endpoints
  ENDPOINTS: {
    PRODUCTS: {
      GET_ALL: '/products',
      GET_FEATURED: '/products/getFeaturedProducts',
      GET_BY_ID: (id) => `/products/${id}`,
      GET_BY_CATEGORY: (category) => `/products/category/${category}`,
    },
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
    },
    CART: {
      GET: '/cart',
      ADD: '/cart/add',
      REMOVE: '/cart/remove',
      UPDATE: '/cart/update',
    },
    WISHLIST: {
      GET: '/wishlist',
      ADD: '/wishlist/add',
      REMOVE: '/wishlist/remove',
    },
    ORDERS: {
      GET_ALL: '/orders',
      CREATE: '/orders/create',
      GET_BY_ID: (id) => `/orders/${id}`,
    }
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get base URL without /v1 suffix for axios baseURL
export const getApiBaseUrl = () => {
  return API_CONFIG.BASE_URL.replace('/v1', '');
};

export default API_CONFIG;

