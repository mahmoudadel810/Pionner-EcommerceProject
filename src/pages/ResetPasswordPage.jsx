import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useTranslation } from "react-i18next";

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { resetPassword, loading } = useUserStore();
  const [formData, setFormData] = useState({
    code: searchParams.get("code") || "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error when user starts typing
    if (errors[e.target.name]) {

      setErrors(prev => ({
        ...prev,
        [e.target.name]: "",
      }));
    }
  };
  //validation form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = t('auth.validation.codeRequired');
    } else if (formData.code.trim().length < 6) {
      newErrors.code = t('auth.validation.codeMinLength');
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('auth.validation.passwordRequired');
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.newPassword
      )
    ) {
      newErrors.newPassword = t('auth.validation.passwordComplexity');
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('auth.validation.passwordMinLength');
    }

    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = t('auth.validation.confirmPasswordRequired');
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = t('auth.validation.passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;
    if (formData.newPassword !== formData.confirmNewPassword) {
      // This should be handled by the store, but adding here for immediate feedback
      return;
    }

    try {
      const res = await resetPassword(formData);
      res?.success ? setPasswordReset(true) : setPasswordReset(false);
    } catch (error) {
      // Error is handled in the store
    }
  };

  if (passwordReset) {
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
              {t('auth.resetPassword.success')}
            </h1>

            <p className="text-muted-foreground mb-6">
              {t('auth.resetPassword.successMessage')}
            </p>

            <Link
              to="/login"
              className="block w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300"
            >
              {t('auth.resetPassword.continueToLogin')}
            </Link>
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
              <Lock size={32} className="text-primary" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t('auth.resetPassword.title')}
            </h1>

            <p className="text-muted-foreground">
              {t('auth.resetPassword.description')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('auth.resetPassword.resetCode')}
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300  ${
                  errors.code
                    ? "border-red-500 focus:border-red-500"
                    : "border-border focus:border-primary"
                }`}
                placeholder={t('auth.resetPassword.codePlaceholder')}
              />
            </div>

            {errors.code && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-500"
              >
                {errors.code}
              </motion.p>
            )}

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('auth.newPassword')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className={`w-full pr-10 pl-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 ${
                    errors.newPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-primary"
                  }`}
                  placeholder={t('auth.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300  ${
                    errors.newPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-primary"
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.newPassword}
                </motion.p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('auth.confirmNewPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
                {errors.confirmNewPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.confirmNewPassword}
                  </motion.p>
                )}
              </div>
              {formData.newPassword &&
                formData.confirmNewPassword &&
                formData.newPassword !== formData.confirmNewPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {t('auth.validation.passwordsDoNotMatch')}
                  </p>
                )}
            </div>

            <motion.button
              type="submit"
              disabled={
                loading || formData.newPassword !== formData.confirmNewPassword
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('auth.resetPassword.resetting')}</span>
                </>
              ) : (
                <>
                  <Lock size={20} />
                  <span>{t('auth.resetPassword.resetPassword')}</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.resetPassword.rememberPassword')}{" "}
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

export default ResetPasswordPage;
