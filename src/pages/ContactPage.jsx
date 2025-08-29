import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { useTranslation } from "react-i18next";
import API_CONFIG from "../config/api.js";
import { buildApiUrl } from "../config/api.js";

const ContactPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [formData, setFormData] = useState({
    name: user?.data?.name || "",
    email: user?.data?.email || "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Update form data when user changes
  useEffect(() => {
    if (user?.data) {
      setFormData(prev => ({
        ...prev,
        name: user.data.name || "",
        email: user.data.email || "",
      }));
    }
  }, [user]);





  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = t('contact.validation.nameRequired');
        } else if (value.trim().length < 2) {
          error = t('contact.validation.nameMinLength');
        } else if (value.trim().length > 50) {
          error = t('contact.validation.nameMaxLength');
        } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          error = t('contact.validation.nameInvalid');
        }
        break;

      case "email":
        if (!value.trim()) {
          error = t('contact.validation.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = t('contact.validation.emailInvalid');
        } else if (value.length > 100) {
          error = t('contact.validation.emailMaxLength');
        }
        break;

      case "subject":
        if (!value.trim()) {
          error = t('contact.validation.subjectRequired');
        } else if (value.trim().length < 5) {
          error = t('contact.validation.subjectMinLength');
        } else if (value.trim().length > 100) {
          error = t('contact.validation.subjectMaxLength');
        }
        break;

      case "message":
        if (!value.trim()) {
          error = t('contact.validation.messageRequired');
        } else if (value.trim().length < 10) {
          error = t('contact.validation.messageMinLength');
        } else if (value.trim().length > 1000) {
          error = t('contact.validation.messageMaxLength');
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Clear previous success message and errors
    setSuccessMessage("");
    setErrors({});

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    if (!validateForm()) {
      toast.error(t('contact.validation.fixErrors'));
      return;
    }

    setLoading(true);

    try {
      // Trim all values before sending
      const trimmedData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      const response = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.CONTACT.SUBMIT), trimmedData);
      
      if (response.data && response.data.success) {
        toast.success(t('contact.success.messageSent'), {
          duration: 5000,
          style: {
            background: "rgba(34, 197, 94, 0.95)",
            color: "white",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            backdropFilter: "blur(10px)",
            fontSize: "14px",
            fontWeight: "500",
            padding: "16px 20px",
          },
          iconTheme: {
            primary: "white",
            secondary: "#22c55e",
          },
        });
        setErrors({});
        
        // Reset form but keep user data if logged in
        setFormData({
          name: user?.data?.name || "",
          email: user?.data?.email || "",
          subject: "",
          message: "",
        });
        setTouched({});
      } else {
        toast.error(t('contact.error.failedToSend'), {
          style: {
            background: "rgba(239, 68, 68, 0.95)",
            color: "white",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            backdropFilter: "blur(10px)",
            fontSize: "14px",
            fontWeight: "500",
            padding: "16px 20px",
          },
          iconTheme: {
            primary: "white",
            secondary: "#ef4444",
          },
        });
      }
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || "An error occurred";

        switch (status) {
          case 400:
            // Handle validation errors
            if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
              // Set server validation errors to form state
              const serverErrors = {};
              error.response.data.errors.forEach(err => {
                // Only set error if the field actually has an error
                if (err.field && err.message) {
                  serverErrors[err.field] = err.message;
                }
              });
              
              // Only set errors if there are actual errors
              if (Object.keys(serverErrors).length > 0) {
                setErrors(serverErrors);
                setTouched(prev => ({
                  ...prev,
                  ...Object.keys(serverErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                }));
                toast.error(t('contact.validation.fixErrorsBelow'), {
                  style: {
                    background: "rgba(239, 68, 68, 0.95)",
                    color: "white",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    backdropFilter: "blur(10px)",
                    fontSize: "14px",
                    fontWeight: "500",
                    padding: "16px 20px",
                  },
                  iconTheme: {
                    primary: "white",
                    secondary: "#ef4444",
                  },
                });
              } else {
                toast.error(t('contact.error.invalidFormData'), {
                  style: {
                    background: "rgba(239, 68, 68, 0.95)",
                    color: "white",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    backdropFilter: "blur(10px)",
                    fontSize: "14px",
                    fontWeight: "500",
                    padding: "16px 20px",
                  },
                  iconTheme: {
                    primary: "white",
                    secondary: "#ef4444",
                  },
                });
              }
            } else {
              toast.error(t('contact.error.invalidFormData'), {
                style: {
                  background: "rgba(239, 68, 68, 0.95)",
                  color: "white",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  backdropFilter: "blur(10px)",
                  fontSize: "14px",
                  fontWeight: "500",
                  padding: "16px 20px",
                },
                iconTheme: {
                  primary: "white",
                  secondary: "#ef4444",
                },
              });
            }
            break;
          case 401:
            toast.error(t('contact.error.loginRequired'));
            navigate("/login");
            break;
          case 429:
            toast.error(t('contact.error.tooManyRequests'));
            break;
          case 500:
            toast.error(t('contact.error.serverError'));
            break;
          default:
            toast.error(message);
        }
      } else if (error.request) {
        // Network error
        toast.error(t('contact.error.networkError'));
      } else {
        // Other error
        toast.error(t('contact.error.unexpectedError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = fieldName => {
    const baseClasses =
      "w-full px-6 py-4 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-500";

    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClasses} border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-500 bg-red-50`;
    } else if (
      touched[fieldName] &&
      !errors[fieldName] &&
      formData[fieldName]
    ) {
      return `${baseClasses} border-green-300 focus:ring-4 focus:ring-green-100 focus:border-green-500 bg-green-50`;
    } else {
      return `${baseClasses} border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Contact Form Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative p-8 lg:p-12">
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg"
                  >
                    <Send size={24} className="text-white" />
                  </motion.div>
                  
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {t('contact.sendMessage')}
                  </h2>
                  <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
                    {t('contact.fillFormDescription')}
                  </p>
                  
                  {!user ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8 max-w-md mx-auto"
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">💡</span>
                        </div>
                        <h3 className="font-semibold text-blue-900">{t('contact.proTip')}</h3>
                      </div>
                      <p className="text-blue-800 text-sm mb-4">
                        {t('contact.loginBenefit')}
                      </p>
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {t('contact.loginToContinue')}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 max-w-md mx-auto"
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✅</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-900">{t('contact.welcomeBack')}</h3>
                          <p className="text-green-800 text-sm">{user.data?.name}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      {t('contact.fullName')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={getInputClassName("name")}
                        placeholder={t('contact.enterFullName')}
                        maxLength={50}
                      />
                      {touched.name && !errors.name && formData.name && (
                        <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                      )}
                      {errors.name && touched.name && (
                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                      )}
                    </div>
                    {errors.name && touched.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-3"
                    >
                      {t('contact.emailAddress')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={getInputClassName("email")}
                        placeholder={t('contact.enterEmail')}
                        maxLength={100}
                      />
                      {touched.email && !errors.email && formData.email && (
                        <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                      )}
                      {errors.email && touched.email && (
                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                      )}
                    </div>
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    {t('contact.subject')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getInputClassName("subject")}
                      placeholder={t('contact.enterSubject')}
                      maxLength={100}
                    />
                    {touched.subject && !errors.subject && formData.subject && (
                      <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                    {errors.subject && touched.subject && (
                      <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.subject && touched.subject && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    {t('contact.message')} <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2 rtl:mr-2 rtl:ml-0">
                      ({formData.message.length}/1000 characters)
                    </span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      rows={6}
                      className={`${getInputClassName("message")} resize-none`}
                      placeholder={t('contact.enterMessage')}
                      maxLength={1000}
                    />
                    {touched.message && !errors.message && formData.message && (
                      <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                    {errors.message && touched.message && (
                      <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.message && touched.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>



                <motion.button
                  type="submit"
                  disabled={
                    loading || Object.keys(errors).some(key => errors[key])
                  }
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 rtl:space-x-reverse shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-lg">{t('contact.sendingMessage')}</span>
                    </>
                  ) : (
                    <>
                      <Send size={24} />
                      <span className="text-lg">{t('contact.sendMessageButton')}</span>
                    </>
                  )}
                </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('contact.findUs')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('contact.visitOffice')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MapPin size={36} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('contact.ourLocation')}
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              {t('contact.address')}
            </p>
            <div className="w-full h-80 rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233668.38703692693!2d46.43831082812499!3d24.713551699999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%20Saudi%20Arabia!5e0!3m2!1sen!2s!4v1703123456789!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Riyadh Location"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
