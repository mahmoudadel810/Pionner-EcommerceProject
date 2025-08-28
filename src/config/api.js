

// All API requests go to the backend directly, no Vite proxy or rewrites.
const BASE_URL = 'https://pionner-v2.vercel.app/api/v2';
// const BASE_URL = 'http://localhost:8000/api/v2';

const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    CONFIRM_EMAIL: (token) => `/auth/confirm-email/${token}`,
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
    UPLOAD_PROFILE_IMAGE: '/auth/upload-profile-image',
    UPDATE_PROFILE: '/auth/update-profile',
    UPDATE_PASSWORD: '/auth/update-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GET_ALL_USERS: '/auth/getAllUsers',
    UPDATE_USER_STATUS: (id) => `/auth/updateUserStatus/${id}`,
    UPDATE_USER_ROLE: (id) => `/auth/updateUserRole/${id}`,
    DELETE_USER: (id) => `/auth/deleteUser/${id}`,
  },
  PRODUCTS: {
    GET_ALL: '/products/getProducts',
    SEARCH: '/products/search',
    SEARCH_SUGGESTIONS: '/products/searchSuggestions',
    GET_FEATURED: '/products/getFeaturedProducts',
    GET_RECOMMENDED: '/products/getRecommendedProducts',
    GET_BY_ID: (id) => `/products/getProduct/${id}`,
    GET_BY_CATEGORY: (category) => `/products/getProductsByCategory/${category}`,
    CREATE: '/products/createProduct',
    CREATE_WITH_IMAGES: '/products/createProductWithImages',
    UPLOAD_IMAGE: (id) => `/products/uploadProductImage/${id}`,
    UPLOAD_IMAGES: (id) => `/products/uploadProductImages/${id}`,
    UPDATE: (id) => `/products/updateProduct/${id}`,
    DELETE: (id) => `/products/deleteProduct/${id}`,
    TOGGLE_FEATURED: (id) => `/products/toggleFeaturedProduct/${id}`,
    UPDATE_STOCK: (id) => `/products/updateStock/${id}`,
    UPDATE_PRICE: (id) => `/products/updatePrice/${id}`,
  },
  CART: {
    GET: '/cart/getCartProducts',
    ADD: '/cart/addToCart',
    REMOVE: '/cart/removeFromCart',
    UPDATE_QUANTITY: (id) => `/cart/updateQuantity/${id}`,
  },
  COUPON: {
    GET: '/coupons/getCoupon',
    VALIDATE: '/coupons/validateCoupon',
    GET_ALL: '/coupons/getAllCoupons',
    CREATE: '/coupons/createCoupon',
    UPDATE: (id) => `/coupons/updateCoupon/${id}`,
    DELETE: (id) => `/coupons/deleteCoupon/${id}`,
    TOGGLE_STATUS: (id) => `/coupons/toggleStatus/${id}`,
  },
  PAYMENT: {
    CREATE_CHECKOUT_SESSION: '/payments/createCheckoutSession',
    CHECKOUT_SUCCESS: '/payments/checkoutSuccess',
    WEBHOOK: '/payments/webhook',
    STATUS: (sessionId) => `/payments/status/${sessionId}`,
  },
  ORDERS: {
    CREATE: '/orders/create',
    GET_USER_ORDERS: '/orders/getUserOrders',
    GET_BY_ID: (id) => `/orders/getOrder/${id}`,
    GET_ALL: '/orders/getAllOrders',
    UPDATE_STATUS: (id) => `/orders/updateOrderStatus/${id}`,
    UPDATE_PAYMENT_STATUS: (id) => `/orders/updatePaymentStatus/${id}`,
    ANALYTICS: '/orders/analytics',
    PRODUCT_ANALYTICS: '/orders/productAnalytics',
    BY_CATEGORY: (categoryId) => `/orders/byCategory/${categoryId}`,
    DELETE: (id) => `/orders/deleteOrder/${id}`,
    CANCEL: (id) => `/orders/cancel/${id}`,
  },
  CATEGORIES: {
    GET_ALL: '/categories/',
    GET_FEATURED: '/categories/featured',
    GET_BY_ID: (id) => `/categories/${id}`,
    GET_BY_SLUG: (slug) => `/categories/slug/${slug}`,
    GET_PRODUCTS_BY_ID: (id) => `/categories/${id}/products`,
    GET_PRODUCTS_BY_SLUG: (slug) => `/categories/slug/${slug}/products`,
    CREATE: '/categories/',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
    TOGGLE_STATUS: (id) => `/categories/${id}/toggle-status`,
  },
  WISHLIST: {
    GET: '/wishlist/',
    ADD: '/wishlist/add',
    REMOVE: (productId) => `/wishlist/remove/${productId}`,
    CLEAR: '/wishlist/clear',
    CHECK: (productId) => `/wishlist/check/${productId}`,
    COUNT: '/wishlist/count',
  },
  CONTACT: {
    SUBMIT: '/contact/submitContactForm',
    GET_ALL: '/contact/getAllContactSubmissions',
    GET_BY_ID: (id) => `/contact/getContactSubmission/${id}`,
    DELETE: (id) => `/contact/deleteContactSubmission/${id}`,
    MARK_AS_READ: (id) => `/contact/markAsRead/${id}`,
    GET_UNREAD_COUNT: '/contact/getUnreadCount',
  },
  ANALYTICS: {
    GET: '/analytics/getAnalyticsData',
    GET_DAILY_SALES: '/analytics/getDailySalesData',
    GET_ORDERS_ANALYTICS: '/analytics/getOrdersAnalytics',
    GET_PRODUCT_ANALYTICS: '/analytics/getProductAnalytics',
    GET_USER_ANALYTICS: '/analytics/getUserAnalytics',
  },
};

// Helper to build a full API URL for fetch/axios
export const buildApiUrl = (endpoint) => {
  // Ensure no double slashes
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BASE_URL}${normalizedEndpoint}`;
};

// Export base URL for axios instance
export { BASE_URL, ENDPOINTS };

// Re-add getApiBaseUrl for compatibility with axios.js
export const getApiBaseUrl = () => BASE_URL;

// Default export for config object
const API_CONFIG = { BASE_URL, ENDPOINTS };
export default API_CONFIG;

