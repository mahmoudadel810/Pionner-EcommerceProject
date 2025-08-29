import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import API_CONFIG, { buildApiUrl } from "../config/api.js";
import { getTranslation } from "../utils/i18nUtils.js";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,

  // Helper function to check if product is in cart
  isInCart: (productId) => {
    const { cart } = get();
    return cart.some(item => item._id === productId);
  },

  getMyCoupon: async () => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.GET));
      if (response.data) {
        set({ coupon: response.data });
        return { success: true, data: response.data };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ;
      toast.error(getTranslation('cart.errors.fetchCouponFailed'));
      return { success: false, message: errorMessage };
    }
  },

  applyCoupon: async code => {
    try {
      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.VALIDATE), { code });
      if (response.data) {
        set({ coupon: response.data, isCouponApplied: true });
        get().calculateTotals();
        toast.success(getTranslation('cart.couponApplied', 'Coupon applied successfully'));
        return { success: true, data: response.data };
      } else {
        throw new Error("Invalid coupon response");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to apply coupon";
      toast.error(getTranslation('cart.errors.applyCouponFailed', 'Failed to apply coupon'));
      return { success: false, message: errorMessage };
    }
  },

  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotals();
    toast.success(getTranslation('cart.couponRemoved', 'Coupon removed'));
    return { success: true };
  },

  getCartItems: async () => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.CART.GET));
      if (response.data && response.data.success) {
        const cartItems = response.data.data || [];
        set({ cart: cartItems });
        // Calculate totals after state update
        setTimeout(() => {
          get().calculateTotals();
        }, 0);
        return { success: true, data: cartItems };
      } else {
        set({ cart: [] });
        return { success: true, data: [] };
      }
    } catch (error) {
      // Don't show toast for authentication errors - they're expected for non-authenticated users
      if (error.response?.status === 401) {
        set({ cart: [] });
        return { success: false, message: "Authentication required" };
      }
      
      set({ cart: [] });
      toast.error(getTranslation('cart.errors.fetchCartFailed', 'Failed to fetch cart items'));
      return { success: false, message: getTranslation('cart.errors.fetchCartFailed', 'Failed to fetch cart items') };
    }
  },

  clearCart: async () => {
    try {
      await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.CART.REMOVE), {});
      set({ cart: [], coupon: null, total: 0, subtotal: 0 });
      toast.success(getTranslation('cart.cleared', 'Cart cleared successfully'));
      return { success: true };
    } catch (error) {
      toast.error(getTranslation('cart.errors.clearCartFailed', 'Failed to clear cart'));
      return { success: false, message: getTranslation('cart.errors.clearCartFailed', 'Failed to clear cart') };
    }
  },

  toggleCart: async product => {
    try {
      const { cart } = get();
      const existingItem = cart.find(item => item._id === product._id);
      
      if (existingItem) {
        // Product is in cart, remove it
        const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.CART.REMOVE), {
          productId: product._id,
        });

        if (response.data && response.data.success) {
          set(prevState => ({
            cart: prevState.cart.filter(item => item._id !== product._id),
          }));
          get().calculateTotals();
          toast.success(getTranslation('cart.productRemoved'));
          return { success: true, action: "removed", data: response.data };
        } else {
          throw new Error("Failed to remove product from cart");
        }
      } else {
        // Product is not in cart, add it
        const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.CART.ADD), {
          productId: product._id,
        });

        if (response.data && response.data.success) {
          set(prevState => ({
            cart: [...prevState.cart, { ...product, quantity: 1 }],
          }));
          
          // Calculate totals after state update
          setTimeout(() => {
            get().calculateTotals();
          }, 0);
          
          toast.success(getTranslation('cart.productAdded'));
          return { success: true, action: "added", data: response.data };
        } else {
          throw new Error("Failed to add product to cart");
        }
      }
    } catch (error) {
      // Handle authentication errors
      if (error.response?.status === 401) {
        return { success: false, message: "Please login to manage cart" };
      }
      
      toast.error(getTranslation('cart.errors.updateCartFailed'));
      return { success: false, message: getTranslation('cart.errors.updateCartFailed', 'Failed to update cart') };
    }
  },

  // Keep the original addToCart for backward compatibility
  addToCart: async product => {
    try {
      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.CART.ADD), {
        productId: product._id,
      });

      if (response.data && response.data.success) {
        // Update cart state based on server response
        set(prevState => {
          const existingItem = prevState.cart.find(
            item => item._id === product._id
          );
          const newCart = existingItem
            ? prevState.cart.map(item =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...prevState.cart, { ...product, quantity: 1 }];
          return { cart: newCart };
        });
        
        // Calculate totals after state update
        setTimeout(() => {
          get().calculateTotals();
        }, 0);
        
        toast.success(getTranslation('cart.productAdded', 'Product added to cart'));
        return { success: true, data: response.data };
      } else {
        throw new Error("Failed to add product to cart");
      }
    } catch (error) {
      // Handle authentication errors - even if interceptor retries, we should still show auth error
      if (error.response?.status === 401) {
        // Don't update cart state for auth errors
        return { success: false, message: "Please login to add items to cart" };
      }
      
      const errorMessage =
        error.response?.data?.message || "Failed to add product to cart";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  removeFromCart: async productId => {
    try {
      await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.CART.REMOVE), { productId });
      set(prevState => ({
        cart: prevState.cart.filter(item => item._id !== productId),
      }));
      get().calculateTotals();
      toast.success(getTranslation('cart.productRemoved', 'Product removed from cart'));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to remove product from cart";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) {
      return get().removeFromCart(productId);
    }

    try {
      const response = await axios.put(buildApiUrl(API_CONFIG.ENDPOINTS.CART.UPDATE_QUANTITY(productId)), {
        quantity,
      });

      if (response.data) {
        set(prevState => ({
          cart: prevState.cart.map(item =>
            item._id === productId ? { ...item, quantity } : item
          ),
        }));
        get().calculateTotals();
        return { success: true, data: response.data };
      } else {
        throw new Error("Failed to update quantity");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update quantity";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    let total = subtotal;

    if (coupon && coupon.discountPercentage) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    // Only update if values actually changed to prevent infinite loops
    const currentState = get();
    if (currentState.subtotal !== subtotal || currentState.total !== total) {
      set({ subtotal, total });
    }
    
    return { subtotal, total };
  },
}));
