import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Filter,
  Grid,
  List,
  ChevronDown,
} from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import ProductCard from "../components/ProductCard";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { STORE_CATEGORIES, categoryLabel, categorySlug } from "../lib/categories";

const SORT_OPTIONS = ["newest", "price-low", "price-high", "name"];

const ShopPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");

  // Filters live in the URL so they survive refresh, Back and shared links.
  const filters = {
    category: searchParams.get("category") || "",
    priceRange: [searchParams.get("min") || "", searchParams.get("max") || ""],
    sortBy: SORT_OPTIONS.includes(searchParams.get("sort")) ? searchParams.get("sort") : "newest",
  };
  const [showFilters, setShowFilters] = useState(
    () => Boolean(searchParams.get("min") || searchParams.get("max") || searchParams.get("sort"))
  );

  const products = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const fetchAllProducts = useProductStore((state) => state.fetchAllProducts);
  const { toggleCart } = useCartStore();
  const { toggleWishlist, wishlist } = useWishlistStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const handleToggleCart = async product => {
    const result = await toggleCart(product);
    if (!result?.success) {
      toast.error(result?.message || t('shop.errors.cartUpdateFailed'));
    }
  };

  const handleWishlistToggle = product => toggleWishlist(product);

  const updateParams = (changes) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleCategoryChange = category => updateParams({ category });

  const filteredProducts = products.filter(product => {
    if (filters.category && categorySlug(product.category) !== categorySlug(filters.category)) {
      return false;
    }

    // An empty bound means no limit, so phones and laptops are not hidden by default.
    const [min, max] = filters.priceRange;
    if (min !== "" && product.price < Number(min)) return false;
    if (max !== "" && product.price > Number(max)) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });


  const filterSection = (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: showFilters ? "auto" : 0 }}
      className="overflow-hidden"
    >
      <div className="bg-white/95 backdrop-blur-lg shadow-lg border border-gray-200/50 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">{t('shop.filters.category')}</label>
            <select
              value={filters.category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all duration-200"
            >
              <option value="">{t('shop.filters.allCategories')}</option>
              {STORE_CATEGORIES.map(category => (
                <option key={category.key} value={categorySlug(category.name)}>
                  {t(`categories.${category.key}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {t('shop.filters.priceRange')}
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder={t('shop.filters.min')}
                value={filters.priceRange[0]}
                onChange={e => updateParams({ min: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all duration-200"
              />
              <span className="flex items-center text-gray-500">-</span>
              <input
                type="number"
                placeholder={t('shop.filters.max')}
                value={filters.priceRange[1]}
                onChange={e => updateParams({ max: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">{t('shop.filters.sortBy')}</label>
            <select
              value={filters.sortBy}
              onChange={e => updateParams({ sort: e.target.value === "newest" ? "" : e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all duration-200"
            >
              <option value="newest">{t('shop.sort.newest')}</option>
              <option value="price-low">{t('shop.sort.priceLowToHigh')}</option>
              <option value="price-high">{t('shop.sort.priceHighToLow')}</option>
              <option value="name">{t('shop.sort.nameAtoZ')}</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
            {filters.category ? categoryLabel(t, filters.category) : t('shop.title')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('shop.productsFound', { count: sortedProducts.length })}
          </p>
        </motion.div>

        {/* Filters Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 bg-white/95 backdrop-blur-sm shadow-sm"
          >
            <Filter size={20} className="text-gray-600" />
            <span className="font-medium text-gray-700">{t('shop.filters.title')}</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 text-gray-500 ${showFilters ? "rotate-180" : ""}`}
            />
          </motion.button>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
            >
              <Grid size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
            >
              <List size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        {filterSection}

        {/* Products Grid */}
        {loading && products.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white/95 backdrop-blur-lg shadow-lg border border-gray-200/50 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{t('shop.empty.title')}</h2>
              <p className="text-gray-600">
                {t('shop.empty.message')}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {sortedProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                onAddToCart={handleToggleCart}
                onWishlistToggle={handleWishlistToggle}
                isInWishlist={wishlist.some(item => item._id === product._id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
