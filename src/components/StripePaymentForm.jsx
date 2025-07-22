import React, { useState } from "react";
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { CreditCard, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const StripePaymentForm = ({ onSuccess, onError, returnUrl }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl || `${window.location.origin}/purchase-success`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
        toast.error(error.message);
        onError && onError(error);
      } else {
        setMessage("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
        onError && onError(error);
      }
    } else {
      // Payment succeeded, user will be redirected to return_url
      onSuccess && onSuccess();
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
    paymentMethodOrder: ["card", "apple_pay", "google_pay"],
  };

  const addressElementOptions = {
    mode: "billing",
    allowedCountries: ["US", "CA", "GB", "AU", "DE", "FR", "IT", "ES", "NL", "SA"],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Payment Method</h3>
              <p className="text-sm text-gray-600">Choose your preferred payment method</p>
            </div>
          </div>
          
          <PaymentElement 
            options={paymentElementOptions}
            className="stripe-payment-element"
          />
        </div>

        {/* Billing Address Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Billing Address</h3>
              <p className="text-sm text-gray-600">Enter your billing information</p>
            </div>
          </div>
          
          <AddressElement 
            options={addressElementOptions}
            className="stripe-address-element"
          />
        </div>

        {/* Error/Success Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl flex items-center gap-3 ${
              message.includes("error") || message.includes("failed")
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-green-50 border border-green-200 text-green-800"
            }`}
          >
            {message.includes("error") || message.includes("failed") ? (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
            isLoading || !stripe || !elements
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Complete Payment</span>
              </>
            )}
          </div>
        </motion.button>

        {/* Security Notice */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default StripePaymentForm;

