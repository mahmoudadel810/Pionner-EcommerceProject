/** @format */

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
  AlertCircle
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
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionMsg, setNewSessionMsg] = useState("");

  // Modal accessibility: close on Esc, prevent background scroll
  useEffect(() => {
    if (showNewSessionModal) {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") setShowNewSessionModal(false);
      };
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [showNewSessionModal]);
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { cart, total, subtotal, coupon, isCouponApplied, clearCart } =
    useCartStore();
  const { createPaymentIntent, loading } = usePaymentStore();

  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Add form state for shipping info
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.data?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zipCode"
    ];

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] =
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (basic)
    if (
      formData.phone &&
      !/^\d{10,}$/.test(formData.phone.replace(/[^\d]/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    return () => {
      // Wide cleanup: clear payment data from all storages on unmount/navigation away
      localStorage.removeItem('clientSecret');
      localStorage.removeItem('paymentIntentId');
      sessionStorage.removeItem('clientSecret');
      sessionStorage.removeItem('paymentIntentId');
      document.cookie = "clientSecret=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "paymentIntentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };
  }, []);

  useEffect(() => {
    // On mount, clear any stale payment data from all storages
    localStorage.removeItem('clientSecret');
    localStorage.removeItem('paymentIntentId');
    sessionStorage.removeItem('clientSecret');
    sessionStorage.removeItem('paymentIntentId');
    document.cookie = "clientSecret=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "paymentIntentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    if (cart.length === 0) {
      navigate("/cart");
      toast.error("Your cart is empty");
      return;
    }

    // Create payment intent when component mounts
    const initializePayment = async () => {
      try {
        const result = await createPaymentIntent(
          cart,
          isCouponApplied ? coupon : null
        );
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

  const handlePaymentSuccess = async () => {
    // Wide cleanup: clear payment data from all storages
    localStorage.removeItem('clientSecret');
    localStorage.removeItem('paymentIntentId');
    sessionStorage.removeItem('clientSecret');
    sessionStorage.removeItem('paymentIntentId');
    document.cookie = "clientSecret=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "paymentIntentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    toast.success("Payment successful! Redirecting...");
    clearCart();
    // Always reset payment state and fetch new intent after payment
    setShowPaymentForm(false);
    setClientSecret("");
    await initializePayment();
    // The Stripe confirmPayment will handle the redirect to /purchase-success
  };

  const handlePaymentError = async (error) => {
    // Wide cleanup: clear payment data from all storages
    localStorage.removeItem('clientSecret');
    localStorage.removeItem('paymentIntentId');
    sessionStorage.removeItem('clientSecret');
    sessionStorage.removeItem('paymentIntentId');
    document.cookie = "clientSecret=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "paymentIntentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Always reset payment state and fetch new intent after ANY error
    setShowPaymentForm(false);
    setClientSecret("");
    await initializePayment();
    // Enhanced UI: show modal on duplicate/409 error
    if (error && error.duplicate) {
      setNewSessionMsg(
        "Your previous payment session was already used or expired. We've created a new secure payment session for you. Please try again."
      );
      setShowNewSessionModal(true);
      setShowPaymentForm(false);
      setClientSecret("");
      try {
        const result = await createPaymentIntent(
          cart,
          isCouponApplied ? coupon : null
        );
        if (result.success) {
          setClientSecret(result.data.clientSecret);
        } else {
          setNewSessionMsg("Failed to generate a new payment session. Please refresh the page or try again later.");
        }
      } catch (e) {
        setNewSessionMsg("Failed to generate a new payment session. Please refresh the page or try again later.");
      }
      setIsProcessing(false);
      return;
    }
    if (error && error.duplicate) {
      toast.error(
        "This payment session has expired or was already used. Generating a new payment session..."
      );
      setShowPaymentForm(false);
      setClientSecret("");
      // Regenerate a new payment intent for the user
      try {
        const result = await createPaymentIntent(
          cart,
          isCouponApplied ? coupon : null
        );
        if (result.success) {
          setClientSecret(result.data.clientSecret);
          toast.success("A new payment session has been created. Please try again.");
          setShowPaymentForm(true);
        } else {
          toast.error("Failed to generate a new payment session. Please refresh the page or try again later.");
        }
      } catch (e) {
        toast.error("Failed to generate a new payment session. Please refresh the page or try again later.");
      }
      setIsProcessing(false);
      return;
    }
    console.error("Payment error:", error);
    setIsProcessing(false);
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setShowPaymentForm(true);
      setTimeout(() => {
        const paymentSection = document.getElementById("payment-section");
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#3b82f6",
      colorBackground: "#ffffff",
      colorText: "#1f2937",
      colorDanger: "#ef4444",
      fontFamily: "Inter, system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px"
    }
  };

  const options = {
    clientSecret,
    appearance
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
      {/* Modal for new payment session */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative transform animate-scale-in">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-blue-600 mb-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5A8.5 8.5 0 103.5 12a8.5 8.5 0 008.5 8.5z" />
              </svg>
              <h2 className="text-xl font-bold mb-2 text-gray-900">New Payment Session</h2>
              <p className="mb-4 text-gray-700">{newSessionMsg}</p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => {
                  setShowNewSessionModal(false);
                  setShowPaymentForm(true);
                }}
                autoFocus
              >
                Try Again
              </button>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowNewSessionModal(false)}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Tailwind animation keyframes (inject into global CSS or Tailwind config if not present) */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.25s ease; }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scale-in 0.25s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
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
            className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                <Truck size={24} className="text-blue-600" />
                <span>Shipping Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Address *
                  </label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter street address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    State/Province *
                  </label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter state"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ZIP Code *
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      errors.zipCode ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter ZIP code"
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Proceed to Payment Button */}
              <div className="mt-8">
                <button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleProceedToPayment}>
                  Proceed to Payment
                </button>
              </div>
            </div>

            {/* Payment Section */}
            {clientSecret && showPaymentForm && (
              <motion.div
                id="payment-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <CreditCard size={24} className="text-blue-600" />
                  <span>Payment Information</span>
                </h2>

                <Elements stripe={stripePromise} options={options}>
                  <StripePaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    shippingData={formData}
                  />
                </Elements>
              </motion.div>
            )}
            {/* If payment form is hidden while fetching new intent, show a spinner or info */}
            {!showPaymentForm && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Preparing a new secure payment session...</span>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <Shield size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Secure Checkout
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Your payment information is encrypted and secure. We use
                    Stripe for secure payment processing and never store your
                    credit card details.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          // Fallback to a placeholder image if the original fails to load
                          e.target.src =
                            "https://via.placeholder.com/80x80?text=Product+Image";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Qty: {item.quantity}
                      </p>
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
                    <span>
                      -$
                      {(subtotal * (coupon.discountPercentage / 100)).toFixed(
                        2
                      )}
                    </span>
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
