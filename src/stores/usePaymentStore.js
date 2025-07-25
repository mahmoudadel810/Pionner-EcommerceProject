import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import API_CONFIG, { buildApiUrl } from "../config/api.js";

export const usePaymentStore = create((set, get) => ({
  loading: false,
  error: null,
  checkoutSession: null,

  createPaymentIntent: async (cartItems, coupon = null) => {
    set({ loading: true, error: null });
    try {
      const payload = {
        products: cartItems.map(item => ({
          _id: item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image
        }))
      };

      if (coupon) {
        payload.couponCode = coupon.code;
      }

      const response = await axios.post(buildApiUrl('/payments/createPaymentIntent'), payload);
      
      if (response.data && response.data.success) {
        set({ loading: false });
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data?.message || "Failed to create payment intent");
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to create payment intent";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  createCheckoutSession: async (cartItems, coupon = null) => {
    set({ loading: true, error: null });
    try {
      const payload = {
        products: cartItems.map(item => ({
          _id: item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image
        }))
      };

      if (coupon) {
        payload.couponCode = coupon.code;
      }

      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION), payload);
      
      if (response.data && response.data.success) {
        set({ 
          checkoutSession: response.data.data,
          loading: false 
        });
        return { success: true, data: response.data.data };
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to create checkout session";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  handleCheckoutSuccess: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENT.CHECKOUT_SUCCESS), {
        sessionId
      });
      
      if (response.data && response.data.success) {
        set({ loading: false });
        // Only show toast if it's a new order, not a duplicate
        if (response.data.message.includes("order created")) {
          toast.success("Payment successful! Your order has been placed.");
        }
        return { success: true, data: response.data.data };
      } else {
        throw new Error("Failed to process payment success");
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to process payment success";
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
      return { success: false, message: errorMessage };
    }
  },

  handlePaymentIntentSuccess: async (paymentIntentId) => {
    try {
      const response = await axios.post(buildApiUrl('/payments/paymentIntentSuccess'), { paymentIntentId });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Duplicate payment intent/order
        return {
          success: false,
          duplicate: true,
          message:
            error.response.data?.message ||
            'Order already exists for this payment. Please do not refresh or resubmit.',
        };
      }
      return { success: false, message: error.message };
    }
  },

  clearCheckoutSession: () => {
    set({ checkoutSession: null, error: null });
  },

  redirectToCheckout: (checkoutUrl) => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      toast.error("No checkout URL available");
    }
  }
})); 