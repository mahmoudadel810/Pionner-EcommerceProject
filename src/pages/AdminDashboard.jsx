import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Shield,
  ShoppingCart,
  Tag,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
  Heart,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  CreditCard,
  Truck,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useCategoryStore } from "../stores/useCategoryStore";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import API_CONFIG, { buildApiUrl } from "../config/api.js";
 

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { products, fetchAllProducts, deleteProduct, loading } = useProductStore();
  const { 
    createCategory, 
    updateCategory, 
    deleteCategory,
    loading: categoryLoading 
  } = useCategoryStore();

  // Local categories state (aligned with CategoriesPage fetching)
  const [dashboardCategories, setDashboardCategories] = useState([]);
  
// console.log(categories,storeCategories );

  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
   //===================coupon code==>
  // const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    paidOrders: 0,
    cancelledOrders: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(null);
   //===================coupon code==>
  // const [showCouponForm, setShowCouponForm] = useState(false);
  // const [editingCoupon, setEditingCoupon] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filters, setFilters] = useState({
    orderStatus: "",
    paymentStatus: "",
    userRole: "",
    productCategory: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    images: [], // Changed to array for multiple images
  });

  //===================coupon code==>
  // const [couponForm, setCouponForm] = useState({
  //   code: "",
  //   description: "",
  //   discountType: "percentage",
  //   discountValue: "",
  //   minimumAmount: "",
  //   maximumUsage: "",
  //   expiryDate: "",
  // });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: null,
    featured: false,
    order: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Debug: Log categories when they change
  useEffect(() => {
    console.log("📋 Dashboard categories updated:", dashboardCategories);
  }, [dashboardCategories]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchAllProducts(),
        fetchContacts(),
        fetchOrders(),
        fetchUsers(),
        fetchCategories(),
        // fetchCoupons(),
        fetchStats(),
      ]);
    } catch (error) {
      toast.error(t('admin.errors.failedToFetchData'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.CONTACT.GET_ALL));
      setContacts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setContacts([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.GET_ALL));
      setOrders(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.GET_ALL_USERS));
      setUsers(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("🔄 Fetching categories (AdminDashboard, same as CategoriesPage)...");
      const params = {
        search: '',
        sortBy: 'order',
        sortOrder: 'asc',
        page: '1',
        limit: '1000'
      };
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.GET_ALL) + `?${queryString}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const responseData = await response.json();
      if (responseData.success) {
        const data = responseData.data;
        const items = data?.data || data;
        setDashboardCategories(Array.isArray(items) ? items : []);
        console.log("✅ Categories fetched:", items?.length || 0);
      } else {
        setDashboardCategories([]);
        console.warn("⚠️ Categories fetch not successful:", responseData);
      }
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      setDashboardCategories([]);
    }
  };
 //===================coupon code==>
  // const fetchCoupons = async () => {
  //   try {
  //     const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.GET_ALL));
  //     setCoupons(Array.isArray(response.data.data) ? response.data.data : []);
  //     console.log(response);
      
  //   } catch (error) {
  //     console.error("Failed to fetch coupons:", error);
  //     setCoupons([]);
  //   }
  // };

  const fetchStats = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.ANALYTICS.GET));
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm(t('admin.confirmations.deleteProduct'))) {
      try {
        await deleteProduct(productId);
        toast.success(t('admin.success.productDeleted'));
      } catch (error) {
        toast.error(t('admin.errors.failedToDeleteProduct'));
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS.replace(":id", orderId)), {
        status: newStatus,
      });
      toast.success(t('admin.success.orderStatusUpdated', { status: newStatus }));
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error(t('admin.errors.failedToUpdateOrderStatus'));
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      await axios.patch(buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.UPDATE_PAYMENT_STATUS.replace(":id", orderId)), {
        paymentStatus: newPaymentStatus,
      });
      toast.success(t('admin.success.paymentStatusUpdated', { status: newPaymentStatus }));
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error(t('admin.errors.failedToUpdatePaymentStatus'));
    }
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      await axios.patch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.UPDATE_USER_STATUS.replace(":id", userId)), {
        status: newStatus,
      });
      toast.success(t('admin.success.userStatusUpdated', { status: newStatus }));
      fetchUsers(); // Refresh users
    } catch (error) {
      toast.error(t('admin.errors.failedToUpdateUserStatus'));
    }
  };
 //===================coupon code==>
  // const handleDeleteCoupon = async (couponId) => {
  //   if (window.confirm(t('admin.confirmations.deleteCoupon'))) {
  //     try {
  //       await axios.delete(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.DELETE.replace(":id", couponId)));
  //       toast.success(t('admin.success.couponDeleted'));
  //       fetchCoupons(); // Refresh coupons
  //     } catch (error) {
  //       toast.error(t('admin.errors.failedToDeleteCoupon'));
  //     }
  //   }
  // };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Debug: Log form data being sent
      console.log('📝 Product form data:', productForm);
      
      // Handle regular form fields
      Object.keys(productForm).forEach(key => {
        if (key !== 'images' && productForm[key] !== "") {
          formData.append(key, productForm[key]);
          console.log(`📋 Added field: ${key} = ${productForm[key]}`);
        }
      });
      
      // Handle image files separately with correct field name
      if (productForm.images && productForm.images.length > 0) {
        productForm.images.forEach(file => {
          formData.append('images', file); // Use 'images' field name that server expects
          console.log(`🖼️ Added image: ${file.name}`);
        });
      }

      const endpoint = editingProduct 
        ? buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(editingProduct._id))
        : buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE);
      
      console.log(`🌐 Making ${editingProduct ? 'PUT' : 'POST'} request to:`, endpoint);

      if (editingProduct) {
        const response = await axios.put(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ Product update response:', response.data);
        toast.success(t('admin.success.productUpdated'));
      } else {
        const response = await axios.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('✅ Product create response:', response.data);
        toast.success(t('admin.success.productCreated'));
      }

      setShowCreateForm(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stockQuantity: "",
        images: [],
      });
      fetchAllProducts();
    } catch (error) {
      console.error('❌ Product submit error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      
      // Show more specific error message if available
      const errorMessage = error.response?.data?.message || error.message || t('admin.errors.failedToSaveProduct');
      toast.error(errorMessage);
    }
  };
 //===================coupon code==>
  // const handleCouponSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (editingCoupon) {
  //       await axios.put(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.UPDATE.replace(":id", editingCoupon._id)), couponForm);
  //       toast.success(t('admin.success.couponUpdated'));
  //     } else {
  //       console.log(couponForm);
  //       console.log(await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.CREATE), couponForm));
  //       await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.CREATE), couponForm);
        
        
  //       toast.success(t('admin.success.couponCreated'));
  //     }

  //     setShowCouponForm(false);
  //     setEditingCoupon(null);
  //     setCouponForm({
  //       code: "",
  //       description: "",
  //       discountType: "percentage",
  //       discountValue: "",
  //       minimumAmount: "",
  //       maximumUsage: "",
  //       expiryDate: "",
  //       valiedEmail: "",
  //     });
  //     fetchCoupons();
  //   } catch (error) {
  //     toast.error(t('admin.errors.failedToSaveCoupon'));
  //     toast.error(error.response.data.error);
  //     console.log(error);
      
  //   }
  // };

  const openProductForm = (product = null) => {
    // Ensure categories are loaded when opening the product form
    if (!Array.isArray(storeCategories) || storeCategories.length === 0) {
      console.log(storeCategories);
      
      fetchAllCategories();
    }
    
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        stockQuantity: product.stockQuantity || "",
        images: [], // Reset images for editing - user can upload new ones
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stockQuantity: "",
        images: [],
      });
    }
    setShowCreateForm(true);
  };
 //===================coupon code==>
  // const openCouponForm = (coupon = null) => {
  //   if (coupon) {
  //     setEditingCoupon(coupon);
  //     setCouponForm({
  //       code: coupon.code || "",
  //       description: coupon.description || "",
  //       discountType: coupon.discountType || "percentage",
  //       discountValue: coupon.discountValue || "",
  //       minimumAmount: coupon.minimumAmount || "",
  //       maximumUsage: coupon.maxUsage || "",
  //       expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : "",
  //       valiedEmail: coupon.valiedEmail || "",
  //     });
  //   } else {
  //     setEditingCoupon(null);
  //     setCouponForm({
  //       code: "",
  //       description: "",
  //       discountType: "percentage",
  //       discountValue: "",
  //       minimumAmount: "",
  //       maximumUsage: "",
  //       expiryDate: "",
  //       valiedEmail:""
  //     });
  //   }
  //   setShowCouponForm(true);
  // };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Handle regular form fields
      Object.keys(categoryForm).forEach(key => {
        if (key !== 'image' && categoryForm[key] !== "") {
          formData.append(key, categoryForm[key]);
        }
      });
      
      // Handle image file
      if (categoryForm.image) {
        formData.append('image', categoryForm.image);
      }

      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory._id, formData);
        if (result.success) {
          toast.success(t('admin.success.categoryUpdated'));
        }
      } else {
        result = await createCategory(formData);
        if (result.success) {
          toast.success(t('admin.success.categoryCreated'));
        }
      }

      if (result.success) {
        setShowCategoryForm(false);
        setEditingCategory(null);
        setCategoryForm({
          name: "",
          description: "",
          image: null,
          featured: false,
          order: "",
        });
      }
    } catch (error) {
      toast.error(t('admin.errors.failedToSaveCategory'));
    }
  };

  const openCategoryForm = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name || "",
        description: category.description || "",
        image: null, // Reset image for editing - user can upload new one
        featured: category.featured || false,
        order: category.order || "",
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        description: "",
        image: null,
        featured: false,
        order: "",
      });
    }
    console.log(categoryForm);
    
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm(t('admin.confirmations.deleteCategory'))) {
      try {
        const result = await deleteCategory(categoryId);
        if (result.success) {
          toast.success(t('admin.success.categoryDeleted'));
        }
      } catch (error) {
        toast.error(t('admin.errors.failedToDeleteCategory'));
        console.error("Failed to delete category:", error);
      }
    }
  };

  const filteredProducts = (products || []).filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = (orders || []).filter((order) => {
    if (filters.orderStatus && order.status !== filters.orderStatus) return false;
    if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) return false;
    return true;
  });

  const filteredUsers = (users || []).filter((user) => {
    if (filters.userRole && user.role !== filters.userRole) return false;
    return true;
  });

  // Ensure dashboardCategories is always an array
  const categoriesArray = Array.isArray(dashboardCategories) ? dashboardCategories : [];
  // 
  console.log(dashboardCategories,"categories");
  // categoriesArray.map(cat=>{
  //   console.log(cat.name);
    
  // })
  
  const filteredCategories = categoriesArray.filter(
    (category) =>
      (category.name && category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tabs = [
    { id: "overview", name: t("admin.tabs.overview"), icon: BarChart3 },
    { id: "products", name: t("admin.tabs.products"), icon: Package },
    { id: "categories", name: t("admin.tabs.categories"), icon: Tag },
    { id: "orders", name: t("admin.tabs.orders"), icon: ShoppingCart },
    { id: "users", name: t("admin.tabs.users"), icon: Users },
    // { id: "coupons", name: t("admin.tabs.coupons"), icon: Tag },
    { id: "analytics", name: t("admin.tabs.analytics"), icon: TrendingUp },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
      case "paid":
      case "active":
        return "bg-green-100 text-green-600";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-600";
      case "cancelled":
      case "inactive":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("admin.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6">
  <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Shield className="text-primary" size={32} />
                {t("admin.dashboard")}
              </h1>
              <p className="text-muted-foreground">
                {t("admin.manage_store")}
              </p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={16} />
              {t("admin.refresh_data")}
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t("admin.stats.total_products")}</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t("admin.stats.total_orders")}</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalOrders}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.pendingOrders} {t("admin.stats.pending_orders")}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <ShoppingCart size={24} className="text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t("admin.stats.total_revenue")}</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalRevenue?.toFixed(2) || "0.00"} SR
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.paidOrders} {t("admin.stats.paid_orders")}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{t("admin.stats.total_customers")}</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalCustomers}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("admin.stats.active_users")}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-purple-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-1 rtl:space-x-reverse bg-card rounded-lg p-1 border border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Recent Orders */}
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    {t("admin.overview.recent_orders")}
                  </h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    {t("admin.overview.view_all")}
                  </button>
                </div>
                <div className="space-y-4">
                  {(orders || []).slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {t("admin.overview.order_number")}{order._id ? order._id.slice(-8) : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.user?.name || t("admin.overview.unknown_user")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          ${order.totalAmount?.toFixed(2) || "0.00"}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Customer Messages */}
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {t("admin.overview.recent_messages")}
                </h2>
                <div className="space-y-4">
                  {(contacts || []).slice(0, 5).map((contact) => (
                    <div
                      key={contact._id}
                      className="p-4 bg-background rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">
                          {contact.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {contact.email}
                      </p>
                      <p className="text-sm text-foreground">
                        {contact.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {t("admin.products.management")}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openProductForm()}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-300 flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Plus size={16} />
                  <span>{t("admin.products.add_product")}</span>
                </motion.button>
              </div>

              {/* Search and Filters */}
              <div className="mb-6">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder={t("admin.products.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 font-medium text-foreground">
                        {t("admin.products.table.product")}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground">
                        {t("admin.products.table.category")}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground">
                        {t("admin.products.table.price")}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground">
                        {t("admin.products.table.stock")}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground">
                        {t("admin.products.table.status")}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground">
                        {t("admin.products.table.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="border-b border-border hover:bg-background/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-foreground">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {product.category}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          ${product.price}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {product.stockQuantity || 0}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.isFeatured
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.isFeatured ? t("admin.products.featured") : t("admin.products.regular")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <button
                              onClick={() => openProductForm(product)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors duration-300"
                              title={t("admin.products.edit_product")}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-300"
                              title={t("admin.products.delete_product")}
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => setShowProductDetails(product)}
                              className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors duration-300"
                              title={t("admin.products.view_details")}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {t("admin.categories.management")}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openCategoryForm()}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-300 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>{t("admin.categories.add_category")}</span>
                </motion.button>
              </div>

              {/* Search and Filters */}
              <div className="mb-6">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder={t("admin.categories.search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Categories Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.categories.table.category")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.categories.table.description")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.categories.table.products")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.categories.table.featured")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.categories.table.status")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.categories.table.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr
                        key={category._id}
                        className="border-b border-border hover:bg-background/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {category.image && (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-foreground">
                                {category.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          <p className="max-w-xs truncate">
                            {category.description}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {category.productCount || 0}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.featured
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {category.featured ? t("admin.categories.featured") : t("admin.categories.regular")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.isActive
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {category.isActive ? t("admin.categories.active") : t("admin.categories.inactive")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openCategoryForm(category)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors duration-300"
                              title={t("admin.categories.edit_category")}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-300"
                              title={t("admin.categories.delete_category")}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {t("admin.orders.management")}
                </h2>
                <div className="flex space-x-2">
                  <select
                    value={filters.orderStatus}
                    onChange={(e) =>
                      setFilters({ ...filters, orderStatus: e.target.value })
                    }
                    className="px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="">{t("admin.orders.all_status")}</option>
                    <option value="pending">{t("admin.orders.status.pending")}</option>
                    <option value="processing">{t("admin.orders.status.processing")}</option>
                    <option value="shipped">{t("admin.orders.status.shipped")}</option>
                    <option value="delivered">{t("admin.orders.status.delivered")}</option>
                    <option value="cancelled">{t("admin.orders.status.cancelled")}</option>
                  </select>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) =>
                      setFilters({ ...filters, paymentStatus: e.target.value })
                    }
                    className="px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="">{t("admin.orders.all_payment_status")}</option>
                    <option value="pending">{t("admin.orders.payment.pending")}</option>
                    <option value="paid">{t("admin.orders.payment.paid")}</option>
                    <option value="failed">{t("admin.orders.payment.failed")}</option>
                    <option value="refunded">{t("admin.orders.payment.refunded")}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="p-4 bg-background rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {t("admin.orders.order_number")} #{order._id ? order._id.slice(-8) : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("admin.orders.customer")}: {order.user?.name || t("admin.orders.unknown")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {order.totalAmount?.toFixed(2) || "0.00"} SR
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.products?.length || 0} {t("admin.orders.items")}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order._id, e.target.value)
                          }
                          className="px-2 py-1 border border-border rounded text-xs bg-background"
                        >
                          <option value="pending">{t("admin.orders.status.pending")}</option>
                          <option value="processing">{t("admin.orders.status.processing")}</option>
                          <option value="shipped">{t("admin.orders.status.shipped")}</option>
                          <option value="delivered">{t("admin.orders.status.delivered")}</option>
                          <option value="cancelled">{t("admin.orders.status.cancelled")}</option>
                        </select>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handleUpdatePaymentStatus(order._id, e.target.value)
                          }
                          className="px-2 py-1 border border-border rounded text-xs bg-background"
                        >
                          <option value="pending">{t("admin.orders.payment.pending")}</option>
                          <option value="paid">{t("admin.orders.payment.paid")}</option>
                          <option value="failed">{t("admin.orders.payment.failed")}</option>
                          <option value="refunded">{t("admin.orders.payment.refunded")}</option>
                        </select>
                        <button
                          onClick={() => setShowOrderDetails(order)}
                          className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                          title={t("admin.orders.view_details")}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {t("admin.users.management")}
                </h2>
                <select
                  value={filters.userRole}
                  onChange={(e) =>
                    setFilters({ ...filters, userRole: e.target.value })
                  }
                  className="px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="">{t("admin.users.all_roles")}</option>
                  <option value="customer">{t("admin.users.customer")}</option>
                  <option value="admin">{t("admin.users.admin")}</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.users.table.user")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.users.table.email")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.users.table.role")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.users.table.status")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.users.table.joined")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        {t("admin.users.table.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-border hover:bg-background/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {user.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {user.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <select
                              value={user.status}
                              onChange={(e) =>
                                handleToggleUserStatus(user._id, e.target.value)
                              }
                              className="px-2 py-1 border border-border rounded text-xs bg-background"
                            >
                              <option value="active">{t("admin.users.active")}</option>
                              <option value="inactive">{t("admin.users.inactive")}</option>
                            </select>
                            <button
                              onClick={() => setShowUserDetails(user)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors duration-300"
                              title={t("admin.users.view_details")}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* {activeTab === "coupons" && (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {t("admin.coupons.management")}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openCouponForm()}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-300 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>{t("admin.coupons.add_coupon")}</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(coupons || []).map((coupon) => (
                  <div
                    key={coupon._id}
                    className="p-4 bg-background rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">
                        {coupon.code}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          coupon.isActive ? "active" : "inactive"
                        )}`}
                      >
                        {coupon.isActive ? t("admin.coupons.active") : t("admin.coupons.inactive")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {coupon.description}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">{t("admin.coupons.discount")}:</span>{" "}
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `$${coupon.discountValue}`}
                      </p>
                      <p>
                        <span className="text-muted-foreground">{t("admin.coupons.min_amount")}:</span>{" "}
                        ${coupon.minimumAmount}
                      </p>
                      <p>
                        <span className="text-muted-foreground">{t("admin.coupons.usage")}:</span>{" "}
                        {coupon.usageCount || 0} / {coupon.maxUsage || "∞"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">{t("admin.coupons.expires")}:</span>{" "}
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 mt-3">
                                             <button
                         onClick={() => openCouponForm(coupon)}
                         className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                         title={t("admin.coupons.edit_coupon")}
                       >
                         <Edit size={14} />
                       </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        title={t("admin.coupons.delete_coupon")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {activeTab === "analytics" && (
            <div className="space-y-8">
              {/* Sales Analytics */}
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {t("admin.analytics.sales_analytics")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("admin.analytics.total_revenue")}</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${stats.totalRevenue?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("admin.analytics.total_orders")}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("admin.analytics.average_order_value")}</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {t("admin.analytics.order_status_distribution")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">{t("admin.analytics.pending")}</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.pendingOrders}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">{t("admin.analytics.paid")}</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.paidOrders}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">{t("admin.analytics.cancelled")}</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.cancelledOrders}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">{t("admin.analytics.total")}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalOrders}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Product Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingProduct ? t("admin.products.edit_product") : t("admin.products.add_new_product")}
              </h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.products.form.name")}</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.products.form.description")}</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.products.form.price")}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.products.form.category")}</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">{t("admin.products.form.select_category")}</option>
                    
                    {categoriesArray
                      .sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name))
                      .map((cat) => (
                        
                        
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  {/* Debug info - remove this after testing */}
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Categories loaded: {categoriesArray?.length || 0} (only active categories)
                      <br />
                      If you have 37 in DB but see fewer here, some categories might be inactive
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.products.form.stock_quantity")}</label>
                  <input
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("admin.products.form.images")}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 10) {
                        toast.error(t('admin.errors.maxImagesExceeded'));
                        return;
                      }
                      setProductForm({ ...productForm, images: files });
                    }}
                    className="w-full p-2 border rounded"
                    required={!editingProduct} // Only required for new products
                  />
                  {productForm.images && productForm.images.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {t("admin.products.form.images_selected", { count: productForm.images.length })}
                    </p>
                  )}
                  {editingProduct && (
                    <p className="text-sm text-gray-500 mt-1">
                      {t("admin.products.form.image_update_hint")}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary/90"
                  >
                    {editingProduct ? t("admin.products.form.update") : t("admin.products.form.create")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                  >
                    {t("admin.products.form.cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Coupon Form Modal */}
        {/* {showCouponForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingCoupon ? t("admin.coupons.edit_coupon") : t("admin.coupons.add_new_coupon")}
              </h2>
              <form onSubmit={handleCouponSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.coupons.form.code")}</label>
                  <input
                    type="text"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.coupons.form.valiedEmail")}</label>
                  <input
                    type="text"
                    value={couponForm.valiedEmail}
                    onChange={(e) => setCouponForm({ ...couponForm, valiedEmail: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.coupons.form.description")}</label>
                  <textarea
                    value={couponForm.description}
                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.coupons.form.discount_type")}</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="percentage">{t("admin.coupons.form.percentage")}</option>
                    <option value="fixed">{t("admin.coupons.form.fixed_amount")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("admin.coupons.form.discount_value")} {couponForm.discountType === "percentage" ? "(%)" : "(SR)"}
                  </label>
                  <input
                    type="number"
                    step={couponForm.discountType === "percentage" ? "1" : "0.01"}
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.coupons.form.minimum_amount")}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={couponForm.minimumAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minimumAmount: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.coupons.form.maximum_usage")}</label>
                  <input
                    type="number"
                    value={couponForm.maximumUsage}
                    onChange={(e) => setCouponForm({ ...couponForm, maximumUsage: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.coupons.form.expiry_date")}</label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary/90"
                  >
                    {editingCoupon ? t("admin.coupons.form.update") : t("admin.coupons.form.create")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCouponForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                  >
                    {t("admin.coupons.form.cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )} */}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingCategory ? t("admin.categories.edit_category") : t("admin.categories.add_new_category")}
              </h2>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.categories.form.name")}</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.categories.form.description")}</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.categories.form.image")}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setCategoryForm({ ...categoryForm, image: file });
                    }}
                    className="w-full p-2 border rounded"
                    required={!editingCategory} // Only required for new categories
                  />
                  {editingCategory && (
                    <p className="text-sm text-gray-500 mt-1">
                      {t("admin.categories.form.image_update_hint")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("admin.categories.form.order")}</label>
                  <input
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, order: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder={t("admin.categories.form.order_placeholder")}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={categoryForm.featured}
                    onChange={(e) => setCategoryForm({ ...categoryForm, featured: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    {t("admin.categories.form.featured_category")}
                  </label>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary/90"
                    disabled={categoryLoading}
                  >
                    {categoryLoading ? t("admin.categories.form.saving") : editingCategory ? t("admin.categories.form.update") : t("admin.categories.form.create")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                  >
                    {t("admin.categories.form.cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        {showProductDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{t("admin.products.product_details")}</h2>
                <button
                  onClick={() => setShowProductDetails(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">{t("admin.products.form.name")}</h3>
                    <p className="text-gray-900">{showProductDetails.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">{t("admin.products.form.category")}</h3>
                    <p className="text-gray-900">{showProductDetails.category}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">{t("admin.products.form.price")}</h3>
                    <p className="text-gray-900">${showProductDetails.price}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">{t("admin.products.form.stock_quantity")}</h3>
                    <p className="text-gray-900">{showProductDetails.stockQuantity}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">{t("admin.products.form.description")}</h3>
                  <p className="text-gray-900">{showProductDetails.description}</p>
                </div>
                
                {showProductDetails.images && showProductDetails.images.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">{t("admin.products.images")}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {showProductDetails.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">{t("admin.products.created_at")}: {new Date(showProductDetails.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{t("admin.products.updated_at")}: {new Date(showProductDetails.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowProductDetails(null);
                        openProductForm(showProductDetails);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <Edit size={16} />
                      <span>{t("admin.products.edit")}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProductDetails(null);
                        handleDeleteProduct(showProductDetails._id);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>{t("admin.products.delete")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;