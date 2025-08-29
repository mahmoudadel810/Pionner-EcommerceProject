import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Package,
  Settings,
  Edit,
  Save,
  X,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import tokenManager from "../utils/tokenManager";
import API_CONFIG from "../config/api.js";
import { buildApiUrl } from "../config/api.js";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, checkAuth, setUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.data?.user?.name || "",
    email: user?.data?.user?.email || "",
  });
  const [avatar, setAvatar] = useState(null); // File object
  const [avatarPreview, setAvatarPreview] = useState(user?.data?.user?.profileImage || "");
  const [showTokens, setShowTokens] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);

  // Memoize fetchOrders to prevent infinite re-renders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.GET_USER_ORDERS));

      // Fixed: Check if response.data.data exists and is an array
      if (response.data && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
      } else {
        setOrders([]);
        toast.error(t('profile.invalidOrderData'));
      }
    } catch (error) {
      setOrders([]); // Reset orders on error
      toast.error(error.response?.data?.message || t('profile.failedToFetchOrders'));
    }
  }, []);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update token info
  useEffect(() => {
    setTokenInfo(tokenManager.getTokenInfo());
  }, []);

  // Handle avatar file change
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = e => {
    // Fixed: Add null check for event and target
    if (!e || !e.target) return;

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    // Fixed: Add validation before making the request
    if (!formData.name || !formData.email) {
      toast.error(t('profile.fillRequiredFields'));
      return;
    }

    setLoading(true);
    try {
      let profileImageUrl = null;
      
      // First, upload the avatar if present
      if (avatar) {
        try {
          const imageFormData = new FormData();
          imageFormData.append("image", avatar);
          
          const imageResponse = await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.UPLOAD_PROFILE_IMAGE), imageFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          
          if (imageResponse.data && imageResponse.data.success) {
            profileImageUrl = imageResponse.data.data.profileImage;
          } else {
            throw new Error(imageResponse.data?.message || "Failed to upload profile image");
          }
        } catch (imageError) {
          toast.error(t('profile.failedToUploadImage'));
          setLoading(false);
          return;
        }
      }

      // Then update the profile with name and email
      const updateData = {
        name: formData.name,
        email: formData.email
      };
      
      const response = await axios.put(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE), updateData);

      if (response.data && response.data.success) {
        toast.success(t('profile.profileUpdatedSuccessfully'));
        setIsEditing(false);
        
        // Update the avatar preview if image was uploaded
        if (profileImageUrl) {
          setAvatarPreview(profileImageUrl);
        }
        
        // Clear the avatar file
        setAvatar(null);
        
        // Update the user store with the new profile image and data
        if (profileImageUrl || response.data.data) {
          // Update the user data in localStorage
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser.data && currentUser.data.user) {
            // Update profile image if uploaded
            if (profileImageUrl) {
              currentUser.data.user.profileImage = profileImageUrl;
            }
            // Update other profile data from response
            if (response.data.data) {
              currentUser.data.user.name = response.data.data.name || currentUser.data.user.name;
              currentUser.data.user.email = response.data.data.email || currentUser.data.user.email;
            }
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            // Update the user store directly without triggering checkAuth
            setUser(currentUser);
          }
        }
      } else {
        toast.error(t('profile.failedToUpdateProfile'));
      }
    } catch (error) {
      toast.error(t('profile.failedToUpdateProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.data?.user?.name || "",
      email: user?.data?.user?.email || "",
    });
    setIsEditing(false);
  };

  const getOrderStatusColor = status => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Fixed: Add loading state and null checks for user data
  if (!user || !user.data || !user.data.user) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('profile.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('profile.profile')}</h1>
          <p className="text-muted-foreground">
            {t('profile.manageAccountAndOrders')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-0 overflow-hidden">
              {/* Profile Header - match dropdown style */}
              <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative w-16 h-16">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 shadow"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {user.data?.user?.name?.charAt(0).toUpperCase() || <User size={32} />}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{user.data?.user?.name || t('profile.user')}</div>
                    <div className="text-xs text-gray-500">{user.data?.user?.email || t('profile.noEmail')}</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600 font-bold tracking-wide uppercase">{t('profile.profile')}</div>
              </div>
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail size={20} className="text-muted-foreground" />
                    <span className="text-foreground">
                      {user.data?.user?.email || t('profile.noEmail')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar size={20} className="text-muted-foreground" />
                    <span className="text-foreground">
                      {t('profile.memberSince')} {user.data?.user?.createdAt ? new Date(user.data.user.createdAt).toLocaleDateString() : t('profile.unknown')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Package size={20} className="text-muted-foreground" />
                    <span className="text-foreground">
                      {orders.length} {t('profile.orders')}
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-primary text-white py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-2 text-base font-medium"
                  >
                    <Edit size={16} />
                    {t('profile.editProfile')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            {/* Edit Profile Form */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-8 mb-8"
              >
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {t('profile.editProfile')}
                </h3>
                <div className="space-y-4">
                  {/* Avatar upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{t('profile.avatar')}</label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt={t('profile.avatarPreview')}
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 shadow"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                            {formData.name?.charAt(0).toUpperCase() || <User size={32} />}
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('profile.fullName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('profile.emailAddress')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed transition-all duration-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('profile.emailNotChangeable')}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-primary text-white py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base font-medium"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{t('profile.saving')}</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>{t('profile.saveChanges')}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center gap-2 text-base font-medium"
                    >
                      <X size={16} />
                      <span>{t('profile.cancel')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Section */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {t('profile.orderHistory')}
                </h3>
                <Package size={24} className="text-primary" />
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package
                    size={48}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <p className="text-muted-foreground">{t('profile.noOrdersYet')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('profile.startShoppingToSeeOrders')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    // Determine order name
                    const orderName = order.products && order.products.length > 0
                      ? order.products[0].productName
                      : `Order #${order._id ? order._id.slice(-8) : 'N/A'}`;
                    // Determine if cancellable
                    const isCancellable = ["pending", "processing"].includes(order.status);
                    // Format shipping address
                    const shipping = order.shippingAddress
                      ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`
                      : "N/A";
                    // Cancel handler
                    const handleCancelOrder = async () => {
                      try {
                        const response = await axios.patch(buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.CANCEL(order._id)));
                        if (response.data && response.data.success) {
                          toast.success(t('profile.orderCancelledSuccessfully'));
                          // Update order status in UI
                          setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: "cancelled" } : o));
                        } else {
                          toast.error(t('profile.failedToCancelOrder'));
                        }
                      } catch (error) {
                        toast.error(t('profile.failedToCancelOrder'));
                      }
                    };
                    return (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {orderName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('profile.orderNumber')} #{order._id ? order._id.slice(-8) : t('profile.na')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : t('profile.unknownDate')}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}
                          >
                            {order.status || t('profile.unknown')}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {order.products ? order.products.length : 0} {t('profile.items')}
                            </p>
                            <p className="font-medium text-foreground">
                              ${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('profile.payment')}: {order.paymentStatus || t('profile.na')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {t('profile.shipping')}: {shipping}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <button className="text-primary hover:text-primary/80 text-sm font-medium">
                            {t('profile.viewDetails')}
                          </button>
                          {isCancellable && (
                            <button
                              onClick={handleCancelOrder}
                              className="ml-2 px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors"
                            >
                              {t('profile.cancelOrder')}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
