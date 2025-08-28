import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

const SignUpPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { signup, loading } = useUserStore();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    const newErrors = { ...errors };

    if (name === "name") {
      if (!value.trim()) {
      } else if (value.trim().length < 2) {
      } else {
        delete newErrors.name;
      }
      newErrors.name = t('signUpPage.errors.nameRequired');
    }
    newErrors.name = t('signUpPage.errors.nameTooShort');

    if (name === "email") {
      if (!value.trim()) {
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      } else if (value.length > 254) {
      } else {
        delete newErrors.email;
        newErrors.email = t('signUpPage.errors.emailRequired');
      }
      newErrors.email = t('signUpPage.errors.emailInvalid');
    }
    newErrors.email = t('signUpPage.errors.emailTooLong');

    if (name === "phone") {
      if (!value.trim()) {
        newErrors.phone = t('signUpPage.errors.phoneRequired');
      } else if (!/^[0-9\+\(\)\.\s\-,]+$/.test(value)) {
        newErrors.phone = t('signUpPage.errors.phoneInvalid');
      } else {
        delete newErrors.phone;
      }
    }

    if (name === "password") {
      if (!value) {
        newErrors.password = t('signUpPage.errors.passwordRequired');
      } else if (value.length < 8) {
        newErrors.password = t('signUpPage.errors.passwordTooShort');
      } else if (value.length > 128) {
        newErrors.password = t('signUpPage.errors.passwordTooLong');
      } else if (!/[a-z]/.test(value)) {
        newErrors.password = t('signUpPage.errors.passwordLowercase');
      } else if (!/[A-Z]/.test(value)) {
        newErrors.password = t('signUpPage.errors.passwordUppercase');
      } else if (!/\d/.test(value)) {
        newErrors.password = t('signUpPage.errors.passwordNumber');
      } else if (!/[@$!%*?&#]/.test(value)) {
        newErrors.password = t('signUpPage.errors.passwordSpecial');
      } else {
        delete newErrors.password;
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        newErrors.confirmPassword = t('signUpPage.errors.confirmPasswordRequired');
      } else if (formData.password !== value) {
        newErrors.confirmPassword = t('signUpPage.errors.passwordMismatch');
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  };

  const getInputClassName = fieldName => {
    const hasError = errors[fieldName] && touched[fieldName];
    const hasValue = formData[fieldName] && formData[fieldName].length > 0;

    return `w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/50 bg-red-50"
        : hasValue
          ? "border-green-500 focus:border-primary focus:ring-primary/50"
          : "border-border focus:border-primary focus:ring-primary/50"
    }`;
  };

  const validateForm = () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('signUpPage.errors.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('signUpPage.errors.nameTooShort');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('signUpPage.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('signUpPage.errors.emailInvalid');
    } else if (formData.email.length > 254) {
      newErrors.email = t('signUpPage.errors.emailTooLong');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('signUpPage.errors.phoneRequired');
    } else if (!/^[0-9\+\(\)\.\s\-,]+$/.test(formData.phone)) {
      newErrors.phone = t('signUpPage.errors.phoneInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('signUpPage.errors.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('signUpPage.errors.passwordTooShort');
    } else if (formData.password.length > 128) {
      newErrors.password = t('signUpPage.errors.passwordTooLong');
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = t('signUpPage.errors.passwordLowercase');
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = t('signUpPage.errors.passwordUppercase');
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = t('signUpPage.errors.passwordNumber');
    } else if (!/[@$!%*?&#]/.test(formData.password)) {
      newErrors.password = t('signUpPage.errors.passwordSpecial');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('signUpPage.errors.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signUpPage.errors.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const data = await signup(formData);
      if (data?.success) {
        navigate("/login");
      }
    } catch (error) {
      // Error is handled in the store
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
            <span className="text-white font-bold text-2xl">E</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl font-bold text-foreground"
          >
            {t('signUpPage.signup.title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-2 text-muted-foreground"
          >
            {t('signUpPage.signup.subtitle')}
          </motion.p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('signUpPage.fields.fullName')}
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName("name")}
                  placeholder={t('signUpPage.placeholders.fullName')}
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.name}
                </motion.p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('signUpPage.fields.email')}
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName("email")}
                  placeholder={t('signUpPage.placeholders.email')}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('signUpPage.fields.phone')}
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName("phone")}
                  placeholder={t('signUpPage.placeholders.phone')}
                />
              </div>
              {errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.phone}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('signUpPage.fields.password')}
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    errors.password && touched.password
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                  size={20}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName("password")}
                  placeholder={t('signUpPage.placeholders.createPassword')}
                  maxLength={128}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {errors.password && touched.password && (
                    <AlertCircle className="text-red-500" size={20} />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {errors.password && touched.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500 flex items-center"
                >
                  <AlertCircle size={14} className="mr-1" />
                  {errors.password}
                </motion.p>
              )}
              {/* Password Requirements */}
              <div className="mt-2 text-xs text-muted-foreground">
                <p>{t('signUpPage.passwordRequirements.title')}</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li
                    className={
                      formData.password.length >= 8 ? "text-green-600" : ""
                    }
                  >
                    {t('signUpPage.passwordRequirements.minLength')}
                  </li>
                  <li
                    className={
                      /[a-z]/.test(formData.password) ? "text-green-600" : ""
                    }
                  >
                    {t('signUpPage.passwordRequirements.lowercase')}
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(formData.password) ? "text-green-600" : ""
                    }
                  >
                    {t('signUpPage.passwordRequirements.uppercase')}
                  </li>
                  <li
                    className={
                      /[@$!%*?&#]/.test(formData.password)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    {t('signUpPage.passwordRequirements.special')}
                  </li>
                  <li
                    className={
                      /\d/.test(formData.password) ? "text-green-600" : ""
                    }
                  >
                    {t('signUpPage.passwordRequirements.number')}
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('signUpPage.fields.confirmPassword')}
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    errors.confirmPassword && touched.confirmPassword
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                  size={20}
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClassName("confirmPassword")}
                  placeholder={t('signUpPage.placeholders.confirmPassword')}
                  maxLength={128}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {errors.confirmPassword && touched.confirmPassword && (
                    <AlertCircle className="text-red-500" size={20} />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500 flex items-center"
                >
                  <AlertCircle size={14} className="mr-1" />
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3">
            <input
              id="terms"
              type="checkbox"
              required
              className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              {t('signUpPage.agreeTo')}{" "}
              <Link to="/terms" className="text-primary hover:text-primary/80">
                {t('signUpPage.termsOfService')}
              </Link>{" "}
              {t('signUpPage.and')}{" "}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary/80"
              >
                {t('signUpPage.privacyPolicy')}
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('signUpPage.signup.creatingMyAccount')}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                {t('signUpPage.createAccount')}
                <ArrowRight size={20} className="ml-2" />
              </div>
            )}
          </motion.button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                {t('signUpPage.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors duration-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('signUpPage.google')}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors duration-300"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
              {t('signUpPage.twitter')}
            </motion.button>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-muted-foreground">
              {t('signUpPage.alreadyHaveAccount')}{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
              >
                {t('signUpPage.signIn')}
              </Link>
            </p>
          </div>
        </motion.form>




      </motion.div>
    </div>
  );
};

export default SignUpPage;
