import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Search, Grid3X3, List, ArrowLeft, Package, Star, ShoppingCart, Heart } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { useUserStore } from "../stores/useUserStore";
import API_CONFIG from "../config/api.js";
import { buildApiUrl } from "../config/api.js";
import { handleImageError } from "../lib/imageFallback";
import { formatCurrency } from "../lib/currency";
import { categoryLabel } from "../lib/categories";
import { productImage } from "../lib/productImage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import NotFoundPage from "./NotFoundPage";

const SORT_VALUES = ["name-asc", "name-desc", "price-asc", "price-desc", "createdAt-desc", "createdAt-asc"];
const PAGE_SIZE = 12;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProductCard = ({ product, inWishlist: isInWishlist, inCart, onToggleWishlist, onToggleCart }) => {
  const { t } = useTranslation();

  return (
    <motion.div variants={itemVariants}>
      <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <Link to={`/product/${product._id}`}>
              <img
                src={productImage(product.image, 480)}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                onError={handleImageError}
              />
            </Link>
            <div className="absolute top-2 end-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleWishlist(product);
                }}
              >
                <Heart 
                  className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </Button>
            </div>
            {product.isFeatured && (
              <div className="absolute top-2 start-2">
                <Badge variant="destructive" className="text-xs">
                  {t('categoryProducts.badges.featured')}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              <bdi>{product.name}</bdi>
            </h3>
          </Link>
          
          {/* Category Badge */}
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {categoryLabel(t, product.categoryId?.name || product.category)}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            <bdi>{product.description}</bdi>
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{(product.averageRating || 0).toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
            </div>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
          </div>

          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCart(product);
            }}
            className={`w-full ${
              inCart
                ? "bg-red-500 hover:bg-red-600"
                : ""
            }`}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 me-2" />
            {inCart ? t('categoryProducts.buttons.removeFromCart') : t('categoryProducts.buttons.addToCart')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ProductListItem = ({ product, inWishlist: isInWishlist, inCart, onToggleWishlist, onToggleCart }) => {
  const { t } = useTranslation();

  return (
    <motion.div variants={itemVariants}>
      <Card className="group transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Link to={`/product/${product._id}`} className="relative w-32 h-32 flex-shrink-0">
              <img
                src={productImage(product.image, 480)}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover rounded-lg"
                onError={handleImageError}
              />
              {product.isFeatured && (
                <Badge variant="destructive" className="absolute top-2 start-2 text-xs">
                  {t('categoryProducts.badges.featured')}
                </Badge>
              )}
            </Link>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      <bdi>{product.name}</bdi>
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {categoryLabel(t, product.categoryId?.name || product.category)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{(product.averageRating || 0).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleWishlist(product);
                  }}
                >
                  <Heart 
                    className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </Button>
              </div>
              
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                <bdi>{product.description}</bdi>
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </span>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleCart(product);
                  }}
                  className={inCart ? "bg-red-500 hover:bg-red-600" : ""}
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 me-2" />
                  {inCart ? t('categoryProducts.buttons.removeFromCart') : t('categoryProducts.buttons.addToCart')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CategoryProductsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const sortValue = SORT_VALUES.includes(searchParams.get("sort")) ? searchParams.get("sort") : "createdAt-desc";
  const [sortBy, sortOrder] = sortValue.split("-");
  const currentPage = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [viewMode, setViewMode] = useState("grid");
  const [totalPages, setTotalPages] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const typingTimer = useRef(null);

  const { user } = useUserStore();
  const { toggleCart, isInCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore();

  useDocumentTitle(category ? categoryLabel(t, category.name) : null);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  useEffect(() => {
    let cancelled = false;
    setCategory(null);
    setNotFound(false);
    axios
      .get(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.GET_BY_ID(id)))
      .then((response) => {
        if (!cancelled && response.data.success) setCategory(response.data.data);
      })
      .catch((err) => {
        // 400 is a malformed id, 404 an unknown or inactive category.
        if (!cancelled && [400, 404].includes(err.response?.status)) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: currentPage,
      limit: PAGE_SIZE,
      sortBy,
      sortOrder,
      ...(searchQuery && { search: searchQuery })
    });

    axios
      .get(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.GET_PRODUCTS_BY_ID(id)) + `?${params}`)
      .then((response) => {
        if (cancelled) return;
        if (response.data.success) {
          setProducts(response.data.data.data || response.data.data);
          setTotalPages(response.data.pagination?.totalPages || 1);
        } else {
          setError(t('categoryProducts.errors.fetchFailed'));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if ([400, 404].includes(err.response?.status)) {
          setNotFound(true);
          return;
        }
        setError(err.response?.data?.message || t('categoryProducts.errors.fetchFailed'));
        toast.error(t('categoryProducts.toast.loadFailed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, searchQuery, sortBy, sortOrder, currentPage, reloadKey, t]);

  const updateParams = (changes, { push = false } = {}) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, String(value));
          else next.delete(key);
        }
        return next;
      },
      { replace: !push }
    );
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => updateParams({ q: value.trim(), page: null }), 400);
  };

  const clearSearch = () => {
    clearTimeout(typingTimer.current);
    setSearchInput("");
    updateParams({ q: null, page: null });
  };

  const handleSortChange = (value) => updateParams({ sort: value === "createdAt-desc" ? null : value, page: null });

  const setCurrentPage = (page) => updateParams({ page: page > 1 ? page : null }, { push: true });

  const handleToggleCart = async (product) => {
    if (!user) {
      toast.error(t('categoryProducts.toast.loginRequiredCart'));
      return;
    }

    try {
      const result = await toggleCart(product);
      if (result.success) {
        // Success message is handled in the store
      } else {
        toast.error(result.message || t('common.failedUpdateCart'));
      }
    } catch {
      toast.error(t('categoryProducts.toast.cartUpdateFailed'));
    }
  };

  const handleWishlistToggle = async (product) => {
    if (!user) {
      toast.error(t('categoryProducts.toast.loginRequiredWishlist'));
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
      toast.error(t('categoryProducts.toast.wishlistUpdateFailed'));
    }
  };

  const cardProps = (product) => ({
    inWishlist: wishlist.some(item => item._id === product._id),
    inCart: isInCart(product._id),
    onToggleWishlist: handleWishlistToggle,
    onToggleCart: handleToggleCart,
  });

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="h-full">
          <CardHeader className="p-0">
            <Skeleton className="w-full h-48 rounded-t-lg" />
          </CardHeader>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (notFound) {
    return <NotFoundPage />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {t('categoryProducts.errors.loadingTitle')}
          </h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => setReloadKey((key) => key + 1)} variant="outline">
            {t('categoryProducts.buttons.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/categories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="rtl:rotate-180 h-4 w-4 me-2" />
              {t('categoryProducts.navigation.backToCategories')}
            </Button>
          </Link>
        </div>
        
        {category && (
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{categoryLabel(t, category.name)}</h1>
              <p className="text-muted-foreground"><bdi>{category.description}</bdi></p>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('categoryProducts.search.placeholder')}
              value={searchInput}
              onChange={handleSearch}
              className="ps-10"
            />
          </div>

          {/* Sort */}
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t('categoryProducts.sort.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">{t('categoryProducts.sort.nameAsc')}</SelectItem>
              <SelectItem value="name-desc">{t('categoryProducts.sort.nameDesc')}</SelectItem>
              <SelectItem value="price-asc">{t('categoryProducts.sort.priceAsc')}</SelectItem>
              <SelectItem value="price-desc">{t('categoryProducts.sort.priceDesc')}</SelectItem>
              <SelectItem value="createdAt-desc">{t('categoryProducts.sort.newest')}</SelectItem>
              <SelectItem value="createdAt-asc">{t('categoryProducts.sort.oldest')}</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-e-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-s-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {loading && products.length === 0 ? (
        <LoadingSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('categoryProducts.empty.title')}</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? t('categoryProducts.empty.searchMessage')
              : t('categoryProducts.empty.categoryMessage')}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={clearSearch}
            >
              {t('categoryProducts.buttons.clearSearch')}
            </Button>
          )}
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            } ${loading ? "opacity-60 transition-opacity" : ""}`}
          >
            {products.map((product) =>
              viewMode === "grid" ? (
                <ProductCard key={product._id} product={product} {...cardProps(product)} />
              ) : (
                <ProductListItem key={product._id} product={product} {...cardProps(product)} />
              )
            )}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  {t('categoryProducts.pagination.previous')}
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10 h-10 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('categoryProducts.pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Results Count */}
      {!loading && products.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {t('categoryProducts.results.showing', { count: products.length, category: categoryLabel(t, category?.name) })}
        </div>
      )}
    </div>
  );
};

export default CategoryProductsPage;