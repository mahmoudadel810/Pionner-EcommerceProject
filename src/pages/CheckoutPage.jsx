import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ArrowLeft, CreditCard, Shield } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { usePaymentStore } from "../stores/usePaymentStore";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import StripePaymentForm from "../components/StripePaymentForm";
import { useTranslation } from "react-i18next";
import { handleImageError } from "../lib/imageFallback";
import { formatCurrency } from "../lib/currency";

// Publishable keys are safe to ship in client code; the fallback keeps the demo deployment working.
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51Oy17F2Lmqh9OD3ZVN8Dn0xnxV4w48IXJnuPVBDLM52yizUAp2z7uKvLU6ksU2NpZRLJFYO2YYM33lCiLPjlm88b00P7RHwiR2"
);

const CheckoutPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { cart, total, subtotal, coupon, isCouponApplied } = useCartStore();
  const { createPaymentIntent, loading } = usePaymentStore();

  const [clientSecret, setClientSecret] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionMsg, setNewSessionMsg] = useState("");

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

  useEffect(() => {
    if (!showNewSessionModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowNewSessionModal(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showNewSessionModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        newErrors[field] = t("checkout.validation.required", {
          field: t(`checkout.${field === "state" ? "stateProvince" : field}`),
        });
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("checkout.validation.invalidEmail");
    }
    if (
      formData.phone &&
      !/^\d{10,}$/.test(formData.phone.replace(/[^\d]/g, ""))
    ) {
      newErrors.phone = t("checkout.validation.invalidPhone");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const initializePayment = useCallback(async () => {
    const result = await createPaymentIntent(cart, isCouponApplied ? coupon : null);
    if (result.success) {
      setClientSecret(result.data.clientSecret);
    }
    return result.success;
  }, [cart, coupon, isCouponApplied, createPaymentIntent]);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
      toast.error(t("checkout.cartEmpty"));
      return;
    }

    initializePayment().then((ok) => {
      if (!ok) {
        toast.error(t("checkout.paymentInitializationFailed"));
        navigate("/cart");
      }
    });
  }, [cart, navigate, initializePayment, t]);

  // Stripe redirects to /purchase-success on success; the order and cart are finalised there.
  const handlePaymentSuccess = () => {
    toast.success(t("checkout.paymentSuccess"));
  };

  // A payment intent can't be reused after a failed or duplicate confirmation, so start a fresh one.
  const handlePaymentError = async (error) => {
    setShowPaymentForm(false);
    setClientSecret("");
    const ok = await initializePayment();

    if (error?.duplicate) {
      setNewSessionMsg(
        ok ? t("checkout.paymentSessionExpired") : t("checkout.paymentSessionGenerationFailed")
      );
      setShowNewSessionModal(true);
      return;
    }

    if (ok) {
      setShowPaymentForm(true);
    } else {
      toast.error(t("checkout.paymentSessionGenerationFailed"));
    }
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setShowPaymentForm(true);
      setTimeout(() => {
        document
          .getElementById("payment-section")
          ?.scrollIntoView({ behavior: "smooth" });
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
    appearance,
    locale: i18n.language === "ar" ? "ar" : "en",
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
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative transform animate-scale-in">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-blue-600 mb-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5A8.5 8.5 0 103.5 12a8.5 8.5 0 008.5 8.5z" />
              </svg>
              <h2 className="text-xl font-bold mb-2 text-gray-900">{t("checkout.newPaymentSession")}</h2>
              <p className="mb-4 text-gray-700">{newSessionMsg}</p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => {
                  setShowNewSessionModal(false);
                  setShowPaymentForm(true);
                }}
                autoFocus
              >
                {t("checkout.tryAgain")}
              </button>
            </div>
            <button
              className="absolute top-2 end-2 text-gray-400 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowNewSessionModal(false)}
              aria-label={t("checkout.close")}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
            <ArrowLeft className="rtl:rotate-180 w-5 h-5" />
            <span>{t('checkout.backToCart')}</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('checkout.secureCheckout')}</h1>
          <p className="text-gray-600 mt-2">{t('checkout.completePurchaseSecurely')}</p>
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
                <span>{t('checkout.shippingInformation')}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('checkout.firstName')} *
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
                    placeholder={t('checkout.enterFirstName')}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('checkout.lastName')} *
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
                    placeholder={t('checkout.enterLastName')}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('checkout.email')} *
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
                    placeholder={t('checkout.enterEmail')}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('checkout.phone')} *
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
                    placeholder={t('checkout.enterPhoneNumber')}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    {t('checkout.address')} *
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
                    placeholder={t('checkout.enterStreetAddress')}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('checkout.city')} *
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
                    placeholder={t('checkout.enterCity')}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('checkout.stateProvince')} *
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
                    placeholder={t('checkout.enterState')}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('checkout.zipCode')} *
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
                    placeholder={t('checkout.enterZipCode')}
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
                  {t('checkout.proceedToPayment')}
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
                  <span>{t('checkout.paymentInformation')}</span>
                </h2>

                <Elements stripe={stripePromise} options={options}>
                  <StripePaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              </motion.div>
            )}

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-3">
                <Shield size={20} className="text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {t('checkout.secureCheckout')}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {t('checkout.securityNotice')}
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
                {t('checkout.orderSummary')}
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
                        onError={handleImageError}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        <bdi>{item.name}</bdi>
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {t('checkout.qty')}: {item.quantity}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>{t('checkout.subtotal')}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {isCouponApplied && coupon && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('checkout.discount')} ({coupon.code})</span>
                    <span>-{formatCurrency(subtotal - total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>{t('checkout.shipping')}</span>
                  <span className="text-green-600">{t('checkout.free')}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>{t('checkout.total')}</span>
                    <span>{formatCurrency(total)}</span>
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
