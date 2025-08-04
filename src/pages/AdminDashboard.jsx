import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import API_CONFIG, { buildApiUrl } from "../config/api.js";

const AdminDashboard = () => {
  const { products, fetchAllProducts, deleteProduct, loading } = useProductStore();
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
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
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
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
    image: "",
  });

  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minimumAmount: "",
    maximumUsage: "",
    expiryDate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchAllProducts(),
        fetchContacts(),
        fetchOrders(),
        fetchUsers(),
        fetchCategories(),
        fetchCoupons(),
        fetchStats(),
      ]);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
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
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.GET_ALL));
      setCategories(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.GET_ALL));
      setCoupons(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      setCoupons([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.ANALYTICS.GET));
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS.replace(":id", orderId)), {
        status: newStatus,
      });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      await axios.patch(buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS.UPDATE_PAYMENT_STATUS.replace(":id", orderId)), {
        paymentStatus: newPaymentStatus,
      });
      toast.success(`Payment status updated to ${newPaymentStatus}`);
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      await axios.patch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.UPDATE_USER_STATUS.replace(":id", userId)), {
        status: newStatus,
      });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers(); // Refresh users
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await axios.delete(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.DELETE.replace(":id", couponId)));
        toast.success("Coupon deleted successfully");
        fetchCoupons(); // Refresh coupons
      } catch (error) {
        toast.error("Failed to delete coupon");
      }
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(productForm).forEach(key => {
        if (productForm[key] !== "") {
          formData.append(key, productForm[key]);
        }
      });

      if (editingProduct) {
        await axios.put(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE.replace(":id", editingProduct._id)), formData);
        toast.success("Product updated successfully");
      } else {
        await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE), formData);
        toast.success("Product created successfully");
      }

      setShowCreateForm(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stockQuantity: "",
        image: "",
      });
      fetchAllProducts();
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await axios.put(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.UPDATE.replace(":id", editingCoupon._id)), couponForm);
        toast.success("Coupon updated successfully");
      } else {
        await axios.post(buildApiUrl(API_CONFIG.ENDPOINTS.COUPON.CREATE), couponForm);
        toast.success("Coupon created successfully");
      }

      setShowCouponForm(false);
      setEditingCoupon(null);
      setCouponForm({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minimumAmount: "",
        maximumUsage: "",
        expiryDate: "",
      });
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to save coupon");
    }
  };

  const openProductForm = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        stockQuantity: product.stockQuantity || "",
        image: product.image || "",
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stockQuantity: "",
        image: "",
      });
    }
    setShowCreateForm(true);
  };

  const openCouponForm = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm({
        code: coupon.code || "",
        description: coupon.description || "",
        discountType: coupon.discountType || "percentage",
        discountValue: coupon.discountValue || "",
        minimumAmount: coupon.minimumAmount || "",
        maximumUsage: coupon.maxUsage || "",
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : "",
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minimumAmount: "",
        maximumUsage: "",
        expiryDate: "",
      });
    }
    setShowCouponForm(true);
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

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "products", name: "Products", icon: Package },
    { id: "orders", name: "Orders", icon: ShoppingCart },
    { id: "users", name: "Users", icon: Users },
    { id: "coupons", name: "Coupons", icon: Tag },
    { id: "analytics", name: "Analytics", icon: TrendingUp },
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
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Shield className="text-primary" size={32} />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your store and monitor performance
              </p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh Data
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
                <p className="text-muted-foreground text-sm">Total Products</p>
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
                <p className="text-muted-foreground text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalOrders}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.pendingOrders} pending
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
                <p className="text-muted-foreground text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">
                  ${stats.totalRevenue?.toFixed(2) || "0.00"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.paidOrders} paid orders
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
                <p className="text-muted-foreground text-sm">Total Customers</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalCustomers}
                </p>
                <p className="text-sm text-muted-foreground">
                  Active users
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
          <div className="flex space-x-1 bg-card rounded-lg p-1 border border-border overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap ${
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
                    Recent Orders
                  </h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    View All
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
                          Order #{order._id ? order._id.slice(-8) : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.user?.name || "Unknown User"}
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
                  Recent Customer Messages
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
                  Products Management
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openProductForm()}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-300 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Product</span>
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
                    placeholder="Search products..."
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
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Price
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Stock
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Actions
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
                          <div className="flex items-center space-x-3">
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
                            {product.isFeatured ? "Featured" : "Regular"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openProductForm(product)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors duration-300"
                              title="Edit Product"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-300"
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => setShowOrderDetails(product)}
                              className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors duration-300"
                              title="View Details"
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

          {activeTab === "orders" && (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Orders Management
                </h2>
                <div className="flex space-x-2">
                  <select
                    value={filters.orderStatus}
                    onChange={(e) =>
                      setFilters({ ...filters, orderStatus: e.target.value })
                    }
                    className="px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) =>
                      setFilters({ ...filters, paymentStatus: e.target.value })
                    }
                    className="px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="">All Payment Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="p-4 bg-background rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-foreground">
                          Order #{order._id ? order._id.slice(-8) : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Customer: {order.user?.name || "Unknown"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          ${order.totalAmount?.toFixed(2) || "0.00"}
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
                          {order.products?.length || 0} items
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
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handleUpdatePaymentStatus(order._id, e.target.value)
                          }
                          className="px-2 py-1 border border-border rounded text-xs bg-background"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        <button
                          onClick={() => setShowOrderDetails(order)}
                          className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                          title="View Details"
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
                  Users Management
                </h2>
                <select
                  value={filters.userRole}
                  onChange={(e) =>
                    setFilters({ ...filters, userRole: e.target.value })
                  }
                  className="px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        User
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Joined
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Actions
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
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                            <button
                              onClick={() => setShowUserDetails(user)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors duration-300"
                              title="View Details"
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

          {activeTab === "coupons" && (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Coupons Management
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
fi                  onClick={() => openCouponForm()}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-300 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Coupon</span>
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
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {coupon.description}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Discount:</span>{" "}
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `$${coupon.discountValue}`}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Min Amount:</span>{" "}
                        ${coupon.minimumAmount}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Usage:</span>{" "}
                        {coupon.usageCount || 0} / {coupon.maxUsage || "∞"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Expires:</span>{" "}
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 mt-3">
                                             <button
                         onClick={() => openCouponForm(coupon)}
                         className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                         title="Edit Coupon"
                       >
                         <Edit size={14} />
                       </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        title="Delete Coupon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-8">
              {/* Sales Analytics */}
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Sales Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${stats.totalRevenue?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Order Value</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Order Status Distribution
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.pendingOrders}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.paidOrders}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.cancelledOrders}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total</p>
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
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
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
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Category</option>
                    {(categories || []).map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary/90"
                  >
                    {editingProduct ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Coupon Form Modal */}
        {showCouponForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
              </h2>
              <form onSubmit={handleCouponSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code</label>
                  <input
                    type="text"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={couponForm.description}
                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Value {couponForm.discountType === "percentage" ? "(%)" : "($)"}
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
                  <label className="block text-sm font-medium mb-1">Minimum Amount</label>
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
                  <label className="block text-sm font-medium mb-1">Maximum Usage</label>
                  <input
                    type="number"
                    value={couponForm.maximumUsage}
                    onChange={(e) => setCouponForm({ ...couponForm, maximumUsage: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
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
                    {editingCoupon ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCouponForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
