import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { usePaymentStore } from "../stores/usePaymentStore";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import StripePaymentForm from "../components/StripePaymentForm";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51Oy17F2Lmqh9OD3ZVN8Dn0xnxV4w48IXJnuPVBDLM52yizUAp2z7uKvLU6ksU2NpZRLJFYO2YYM33lCiLPjlm88b00P7RHwiR2"
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { cart, total, subtotal, coupon, isCouponApplied, clearCart } = useCartStore();
  const { createPaymentIntent, loading } = usePaymentStore();

  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
      toast.error("Your cart is empty");
      return;
    }

    // Create payment intent when component mounts
    const initializePayment = async () => {
      try {
        const result = await createPaymentIntent(cart, isCouponApplied ? coupon : null);
        if (result.success) {
          setClientSecret(result.data.clientSecret);
        } else {
          toast.error("Failed to initialize payment");
          navigate("/cart");
        }
      } catch (error) {
        toast.error("Failed to initialize payment");
        navigate("/cart");
      }
    };

    initializePayment();
  }, [cart, navigate, createPaymentIntent, coupon, isCouponApplied]);

  const handlePaymentSuccess = () => {
    toast.success("Payment successful! Redirecting...");
    clearCart();
    // The Stripe confirmPayment will handle the redirect to /purchase-success
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    setIsProcessing(false);
  };

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (loading || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
                  <p className="text-sm text-gray-600">Your payment information is secure</p>
                </div>
              </div>

              {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                  <StripePaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    returnUrl={`${window.location.origin}/purchase-success`}
                  />
                </Elements>
              )}
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Your purchase is protected</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Free shipping on orders over $99</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-600">30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {isCouponApplied && coupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({coupon.code})</span>
                    <span>-${(subtotal * (coupon.discountPercentage / 100)).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

