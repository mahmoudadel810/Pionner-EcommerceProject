import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Search, Grid3X3, List, Star, ShoppingCart, Heart, Eye, X, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useUserStore } from "../stores/useUserStore";
import API_CONFIG from "../config/api.js";
import { buildApiUrl } from "../config/api.js";
import { useTranslation } from "react-i18next";
import { handleImageError } from "../lib/imageFallback";
import { formatCurrency } from "../lib/currency";
import { STORE_CATEGORIES, categoryLabel } from "../lib/categories";
import { productImage } from "../lib/productImage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// The API has no price filter, so the selected range is applied to the returned page.
const isInPriceRange = (price, range) => {
  if (!range || range === "all") return true;
  if (range.endsWith("+")) return price >= Number(range.slice(0, -1));
  const [min, max] = range.split("-").map(Number);
  return price >= min && price <= max;
};

const SORT_VALUES = ["relevance", "name-asc", "name-desc", "price-asc", "price-desc", "createdAt-desc"];
const PRICE_VALUES = ["all", "0-100", "100-500", "500-1000", "1000+"];
const PAGE_SIZES = ["6", "12", "24", "48"];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const SearchResultCard = ({ product, inWishlist, inCart, onToggleWishlist, onToggleCart }) => {
  const { t } = useTranslation();

  return (
    <motion.div variants={itemVariants}>
      <Link to={`/product/${product._id}`} className="block h-full">
      <Card className="group h-full transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-blue-500/20 bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={productImage(product.image, 480)}
              alt={product.name}
              width={480}
              height={192}
              loading="lazy"
              decoding="async"
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-4 end-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleWishlist(product);
                }}
                className="w-8 h-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
              >
                <Heart
                  size={16}
                  className={inWishlist ? "fill-red-500 text-red-500" : ""}
                />
              </Button>
              <span
                aria-hidden="true"
                className="w-8 h-8 inline-flex items-center justify-center rounded-md bg-white/20 backdrop-blur-sm text-white"
              >
                <Eye size={16} />
              </span>
            </div>
            <div className="absolute bottom-4 start-4 end-4">
              <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                <bdi>{product.name}</bdi>
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {formatCurrency(product.price)}
                </Badge>
                {product.reviewCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm">{product.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
            <bdi>{product.description}</bdi>
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {categoryLabel(t, product.category)}
              </Badge>
              {product.isFeatured && (
                <Badge variant="destructive" className="text-xs bg-gradient-to-r from-red-500 to-pink-500">
                  {t('featured.featured_badge')}
                </Badge>
              )}
            </div>
            <Button
              variant={inCart ? "destructive" : "default"}
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCart(product);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <ShoppingCart size={16} className="me-1" />
              {inCart ? t('home.remove_from_cart') : t('home.add_to_cart')}
            </Button>
          </div>
        </CardContent>
      </Card>
      </Link>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="h-full bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-0">
            <Skeleton className="w-full h-48 rounded-t-lg" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
);

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Every search setting lives in the URL so refresh, Back and shared links reproduce the results.
  const query = searchParams.get('q') || '';
  const sortBy = SORT_VALUES.includes(searchParams.get('sort')) ? searchParams.get('sort') : "relevance";
  const categoryFilter = searchParams.get('category') || "all";
  const priceRange = PRICE_VALUES.includes(searchParams.get('price')) ? searchParams.get('price') : "all";
  const itemsPerPage = PAGE_SIZES.includes(searchParams.get('limit')) ? Number(searchParams.get('limit')) : 12;
  const requestedPage = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(query));
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(query);
  const [viewMode, setViewMode] = useState("grid");
  const [reloadKey, setReloadKey] = useState(0);
  const typingTimer = useRef(null);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const { currentPage, totalPages, totalItems } = paginationInfo;

  const { toggleCart, isInCart } = useCartStore();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { user } = useUserStore();

  // Keep the box in step with the URL (Back/Forward, navbar searches).
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = {
      search: query.trim(),
      page: String(requestedPage),
      limit: String(itemsPerPage),
      ...(categoryFilter !== "all" && { category: categoryFilter }),
    };
    if (sortBy !== "relevance") {
      const [field, order] = sortBy.split("-");
      params.sortBy = field;
      params.sortOrder = order;
    }

    axios
      .get(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.GET_ALL) + `?${new URLSearchParams(params)}`)
      .then((response) => {
        if (cancelled) return;
        if (!response.data.success) {
          setError(t('search.errors.fetchFailed'));
          return;
        }
        const items = Array.isArray(response.data.data) ? response.data.data : [];
        setProducts(items.filter((product) => isInPriceRange(product.price, priceRange)));
        const pagination = response.data.pagination;
        setPaginationInfo({
          currentPage: pagination?.currentPage || requestedPage,
          totalPages: pagination?.totalPages || 1,
          totalItems: pagination?.totalCount || items.length,
          hasNextPage: pagination?.hasNextPage || false,
          hasPrevPage: pagination?.hasPrevPage || false,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || t('search.errors.fetchFailed'));
        toast.error(t('search.errors.loadFailed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, sortBy, categoryFilter, priceRange, itemsPerPage, requestedPage, reloadKey, t]);

  // Filter changes replace the current entry and start again from page 1.
  const updateParams = (changes, { push = false } = {}) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === undefined || value === "") next.delete(key);
          else next.set(key, String(value));
        }
        return next;
      },
      { replace: !push }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    clearTimeout(typingTimer.current);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(typingTimer.current);
    if (!value.trim()) return;
    typingTimer.current = setTimeout(() => {
      updateParams({ q: value.trim(), page: null });
    }, 400);
  };

  const clearSearch = () => {
    clearTimeout(typingTimer.current);
    setSearchQuery("");
    navigate("/search");
  };

  const handleSortChange = (value) => updateParams({ sort: value === "relevance" ? null : value, page: null });
  const handleCategoryFilterChange = (value) => updateParams({ category: value === "all" ? null : value, page: null });
  const handlePriceRangeChange = (value) => updateParams({ price: value === "all" ? null : value, page: null });
  const handleItemsPerPageChange = (value) => updateParams({ limit: value === "12" ? null : value, page: null });

  const handleRefresh = () => setReloadKey((key) => key + 1);

  // Page changes are history entries, so Back returns to the previous page of results.
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      updateParams({ page: page === 1 ? null : page }, { push: true });
    }
  };

  const goToNextPage = () => {
    if (paginationInfo.hasNextPage) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (paginationInfo.hasPrevPage) {
      goToPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => {
    goToPage(1);
  };

  const goToLastPage = () => {
    goToPage(totalPages);
  };

  const handleToggleCart = async (product) => {
    if (!user) {
      toast.error(t('search.errors.loginRequired'));
      return;
    }

    try {
      const result = await toggleCart(product);
      if (!result.success) {
        toast.error(result.message || t('search.errors.cartUpdateFailed'));
      }
    } catch {
      toast.error(t('search.errors.cartUpdateFailed'));
    }
  };

  const handleWishlistToggle = async (product) => {
    if (!user) {
      toast.error(t('search.errors.loginRequired'));
      return;
    }

    try {
      const isInWishlist = wishlist.some(item => item._id === product._id);
      if (isInWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch {
      toast.error(t('search.errors.wishlistUpdateFailed'));
    }
  };

  useDocumentTitle(query ? t('titles.searchFor', { query }) : null);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Search size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('search.errorTitle')}
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button 
              onClick={handleRefresh} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              {t('search.tryAgain')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-16 lg:py-24 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 start-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 end-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg"
            >
              <Search size={28} className="text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4"
            >
              {t('search.heroTitle')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('search.heroHighlight')}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto"
            >
              {query ? t('search.searchingFor', { query }) : t('search.enterSearchTerm')}
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute start-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full ps-12 pe-12 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute end-2 top-1/2 transform -translate-y-1/2 h-10 w-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Search Results Section */}
      {query && (
        <section className="pb-20">
          <div className="container mx-auto px-4">
            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Sort */}
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-full sm:w-40 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                        <SelectValue placeholder={t('search.filters.sortBy')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">{t('search.filters.relevance')}</SelectItem>
                        <SelectItem value="name-asc">{t('search.filters.nameAZ')}</SelectItem>
                        <SelectItem value="name-desc">{t('search.filters.nameZA')}</SelectItem>
                        <SelectItem value="price-asc">{t('search.filters.priceLowHigh')}</SelectItem>
                        <SelectItem value="price-desc">{t('search.filters.priceHighLow')}</SelectItem>
                        <SelectItem value="createdAt-desc">{t('search.filters.newest')}</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Category Filter */}
                    <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                      <SelectTrigger className="w-full sm:w-40 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                        <SelectValue placeholder={t('search.filters.category')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('search.filters.allCategories')}</SelectItem>
                        {STORE_CATEGORIES.map((category) => (
                          <SelectItem key={category.key} value={category.name}>
                            {t(`categories.${category.key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Price Range */}
                    <Select value={priceRange} onValueChange={handlePriceRangeChange}>
                      <SelectTrigger className="w-full sm:w-40 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                        <SelectValue placeholder={t('search.filters.priceRange')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('search.filters.allPrices')}</SelectItem>
                        <SelectItem value="0-100">{t('search.filters.under100')}</SelectItem>
                        <SelectItem value="100-500">{t('search.filters.range100to500')}</SelectItem>
                        <SelectItem value="500-1000">{t('search.filters.range500to1000')}</SelectItem>
                        <SelectItem value="1000+">{t('search.filters.over1000')}</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Mode */}
                    <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-e-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-s-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Items per page */}
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-36 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                        <SelectValue placeholder={t('search.filters.perPage')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">{t('search.filters.sixPerPage')}</SelectItem>
                        <SelectItem value="12">{t('search.filters.twelvePerPage')}</SelectItem>
                        <SelectItem value="24">{t('search.filters.twentyFourPerPage')}</SelectItem>
                        <SelectItem value="48">{t('search.filters.fortyEightPerPage')}</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Refresh Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={loading}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    >
                      <RefreshCw className={`h-4 w-4 me-2 ${loading ? 'animate-spin' : ''}`} />
                      {t('search.filters.refresh')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Search Results */}
            {loading ? (
              <LoadingSkeleton />
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('search.noProductsFound')}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {t('search.noProductsMatch', { query })}
                </p>
                <Button
                  onClick={clearSearch}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  {t('search.clearSearch')}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid gap-8 ${
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 max-w-2xl mx-auto"
                }`}
              >
                {products.map((product) => (
                  <SearchResultCard
                    key={product._id}
                    product={product}
                    inWishlist={wishlist.some(item => item._id === product._id)}
                    inCart={isInCart(product._id)}
                    onToggleWishlist={handleWishlistToggle}
                    onToggleCart={handleToggleCart}
                  />
                ))}
              </motion.div>
            )}

            {/* Results Count */}
            {!loading && products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-12 text-center"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <p className="text-gray-600 font-medium">
                    {t('search.foundProducts', { count: totalItems, query })}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-12"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    {/* Pagination Info */}
                    <div className="text-center sm:text-left">
                      <p className="text-gray-600 font-medium">
                        {t('search.showingRange', { 
                          start: ((currentPage - 1) * itemsPerPage) + 1,
                          end: Math.min(currentPage * itemsPerPage, totalItems),
                          total: totalItems
                        })}
                      </p>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      {/* First Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToFirstPage}
                        disabled={!paginationInfo.hasPrevPage || loading}
                        className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>

                      {/* Previous Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={!paginationInfo.hasPrevPage || loading}
                        className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <ChevronLeft className="rtl:rotate-180 h-4 w-4" />
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              disabled={loading}
                              className={`rounded-xl px-3 py-2 min-w-[40px] transition-all duration-200 ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                                  : "hover:bg-blue-50 hover:border-blue-300"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Next Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={!paginationInfo.hasNextPage || loading}
                        className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <ChevronRight className="rtl:rotate-180 h-4 w-4" />
                      </Button>

                      {/* Last Page */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToLastPage}
                        disabled={!paginationInfo.hasNextPage || loading}
                        className="rounded-xl px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage;