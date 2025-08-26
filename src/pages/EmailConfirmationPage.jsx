import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import API_CONFIG from "../config/api.js";
import { buildApiUrl } from "../config/api.js";
import { useTranslation } from "react-i18next";

const EmailConfirmationPage = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.CONFIRM_EMAIL(token)));
        
        if (response.data?.success) {
          setStatus("success");
          setMessage(response.data.message || t('emailConfirmation.success'));
          toast.success(t('emailConfirmation.success'));
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(t('emailConfirmation.failed'));
        }
      } catch (error) {
        setStatus("error");
        const errorMessage = error.response?.data?.message || t('emailConfirmation.failed');
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    if (token) {
      confirmEmail();
    } else {
      setStatus("error");
      setMessage(t('emailConfirmation.invalidLink'));
    }
  }, [token, navigate]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('emailConfirmation.confirming')}
            </h2>
            <p className="text-muted-foreground">
              {t('emailConfirmation.pleaseWait')}
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('emailConfirmation.confirmed')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {message}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('emailConfirmation.redirecting')}
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('emailConfirmation.confirmationFailed')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="btn-primary w-full"
              >
                {t('emailConfirmation.goToLogin')}
              </Link>
              <Link
                to="/signup"
                className="btn-secondary w-full"
              >
                {t('emailConfirmation.createNewAccount')}
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center mb-6"
          >
            <Mail className="text-white" size={32} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl font-bold text-foreground"
          >
            {t('emailConfirmation.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-2 text-muted-foreground"
          >
            {t('emailConfirmation.verifying')}
          </motion.p>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          {renderContent()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmailConfirmationPage;