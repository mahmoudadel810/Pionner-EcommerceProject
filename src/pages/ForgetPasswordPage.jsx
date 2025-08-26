import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useTranslation } from "react-i18next";

const ForgetPasswordPage = () => {
  const { t } = useTranslation();
  const { forgetPassword, loading } = useUserStore();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await forgetPassword(email);
      if (res?.success) {
        setEmailSent(true);
      }
    } catch (error) {
      // Error is handled in the store
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-4">
              {t('auth.forgotPassword.checkEmail')}
            </h1>

            <p className="text-muted-foreground mb-6">
              {t('auth.forgotPassword.emailSent', { email })}
            </p>

            <div className="space-y-4">
              <Link
                to="/reset-password"
                className="block w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300"
              >
                {t('auth.forgotPassword.resetPassword')}
              </Link>
              <Link
                to="/login"
                className="block w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300"
              >
                {t('auth.backToLogin')}
              </Link>

              <button
                onClick={() => setEmailSent(false)}
                className="block w-full bg-secondary text-foreground py-3 px-6 rounded-lg font-medium hover:bg-secondary/80 transition-colors duration-300"
              >
                {t('auth.forgotPassword.tryAnotherEmail')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-300 mb-6"
            >
              <ArrowLeft size={20} />
              <span>{t('auth.backToLogin')}</span>
            </Link>

            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('auth.forgotPassword.title')}
            </h1>

            <p className="text-muted-foreground">
              {t('auth.forgotPassword.description')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('auth.emailAddress')}
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('auth.forgotPassword.sending')}</span>
                </>
              ) : (
                <>
                  <Mail size={20} />
                  <span>{t('auth.forgotPassword.sendResetLink')}</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.forgotPassword.rememberPassword')}{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
              >
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgetPasswordPage;
