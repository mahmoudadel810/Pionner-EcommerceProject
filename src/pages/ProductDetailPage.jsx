import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  CreditCard,
} from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import { usePaymentStore } from "../stores/usePaymentStore";
import { useUserStore } from "../stores/useUserStore";
import { useProductStore } from "../stores/useProductStore";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import API_CONFIG from "../config/api.js";
import { buildApiUrl } from "../config/api.js";
import { getTranslation } from "../utils/i18nUtils.js";
import { formatCurrency } from "../lib/currency";
import { categorySlug } from "../lib/categories";
import { productImage } from "../lib/productImage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import NotFoundPage from "./NotFoundPage";

const RELATED_COUNT = 4;

const pickRelated = (products, product) =>
  products
    .filter((p) => p._id !== product._id && categorySlug(p.category) === categorySlug(product.category))
    .slice(0, RELATED_COUNT);

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { toggleCart, isInCart } = useCartStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { createCheckoutSession, redirectToCheckout } = usePaymentStore();

  const location = useLocation();
  const fetchProductsByCategory = useProductStore((state) => state.fetchProductsByCategory);

  const [product, setProduct] = useState(
    () => useProductStore.getState().products.find((p) => p._id === id) || null
  );
  const [status, setStatus] = useState(product ? "ready" : "loading");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useDocumentTitle(product?.name ?? null);

  useEffect(() => {
    let cancelled = false;
    // The catalogue is read once per product; later cache refreshes don't restart this effect.
    const cached = useProductStore.getState().products;
    const cachedProduct = cached.find((p) => p._id === id);

    setQuantity(1);
    setSelectedImage(0);
    setProduct(cachedProduct || null);
    setStatus(cachedProduct ? "ready" : "loading");
    setRelatedProducts(cachedProduct ? pickRelated(cached, cachedProduct) : []);

    const loadRelated = async (current) => {
      if (cached.length > 0) {
        setRelatedProducts(pickRelated(cached, current));
        return;
      }
      const result = await fetchProductsByCategory(current.category);
      if (!cancelled && result.success) {
        setRelatedProducts(pickRelated(result.data, current));
      }
    };

    axios
      .get(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.GET_BY_ID(id)))
      .then((response) => {
        if (cancelled) return;
        if (!response.data?.success) {
          setStatus("notFound");
          return;
        }
        setProduct(response.data.data);
        setStatus("ready");
        loadRelated(response.data.data);
      })
      .catch((error) => {
        if (cancelled) return;
        // 400 is the API's answer to a malformed id, 404 to an unknown one.
        const code = error.response?.status;
        if (code === 404 || code === 400) {
          setStatus("notFound");
        } else if (!cachedProduct) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey, fetchProductsByCategory]);

  const goBack = () => {
    // Opened directly (no history inside the app): go to the shop instead of leaving the site.
    if (location.key === "default") {
      navigate("/shop");
    } else {
      navigate(-1);
    }
  };

  const isProductInCart = isInCart(product?._id);

  const handleToggleCart = async () => {
    if (!user) {
      toast.error(t('productDetail.errors.loginRequired'));
      navigate("/login");
      return;
    }

    try {
      const result = await toggleCart({ ...product, quantity });
      if (result.success) {
        // Success message is handled in the store
      } else {
        toast.error(result.message || t('productDetail.errors.cartUpdateFailed'));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(t('common.pleaseLoginCart'));
        navigate("/login");
      } else {
        toast.error(t('common.failedUpdateCart'));
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error(t('common.pleaseLoginWishlist'));
      navigate("/login");
      return;
    }

    try {
      await toggleWishlist(product);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(t('common.pleaseLoginWishlist'));
        navigate("/login");
      }
      // Other errors are already handled in the store
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error(t('common.pleaseLoginCart'));
      navigate("/login");
      return;
    }

    setIsBuyingNow(true);
    try {
      // Create a single item cart for immediate checkout
      const singleItem = [{ ...product, quantity }];
      const result = await createCheckoutSession(singleItem);
      
      if (result.success && result.data && result.data.url) {
        redirectToCheckout(result.data.url);
      } else {
        toast.error(result.message || getTranslation('payment.errors.createCheckoutSessionFailed'));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(t('common.pleaseLoginCart'));
        navigate("/login");
      } else {
        toast.error(getTranslation('checkout.error', 'An error occurred during checkout'));
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  const isInWishlist = wishlist.some(item => item._id === product?._id);

  if (status === "notFound") {
    return <NotFoundPage />;
  }

  if (status === "error") {
    return (
      <div className="min-h-[60vh] bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg text-muted-foreground">{t('productDetail.errors.loadFailed')}</p>
        <button
          onClick={() => setReloadKey((key) => key + 1)}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors duration-300"
        >
          {t('common.try_again')}
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const images = [...new Set([product.image, ...(product.images || [])].filter(Boolean))];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={goBack}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <ChevronLeft className="rtl:rotate-180" size={20} />
            <span>{t('productDetail.back')}</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-card rounded-2xl overflow-hidden">
                <img
                  key={product._id}
                  src={productImage(images[selectedImage] || images[0], 800)}
                  alt={product.name}
                  width={800}
                  height={800}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex space-x-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square w-20 bg-card rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={productImage(image, 160)}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                <bdi>{product.name}</bdi>
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                <bdi>{product.description}</bdi>
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <bdi>-{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</bdi>
                    </span>
                  </>
                )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.round(product.averageRating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                ({product.reviewCount || 0} {t('productDetail.reviews')})
              </span>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('productDetail.quantity')}
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-secondary/80 transition-colors duration-300"
                >
                  -
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-secondary/80 transition-colors duration-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggleCart}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2 ${
                  isProductInCart
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                <ShoppingCart size={20} />
                <span>{isProductInCart ? t('productDetail.removeFromCart') : t('productDetail.addToCart')}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={isBuyingNow}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBuyingNow ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CreditCard size={20} />
                )}
                <span>{isBuyingNow ? t('productDetail.processing') : t('productDetail.buyNow')}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWishlistToggle}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  isInWishlist
                    ? "bg-red-500 border-red-500 text-white"
                    : "bg-transparent border-border text-foreground hover:border-red-500 hover:text-red-500"
                }`}
              >
                <Heart
                  size={20}
                  className={isInWishlist ? "fill-current" : ""}
                />
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center space-x-3">
                <Truck size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t('productDetail.freeShipping')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('productDetail.onOrdersOver')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t('productDetail.securePayment')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('productDetail.secureCheckout')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-foreground">{t('productDetail.easyReturns')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('productDetail.returnPolicy')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20"
          >
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {t('productDetail.relatedProducts')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <motion.div
                  key={relatedProduct._id}
                  whileHover={{ y: -5 }}
                  className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
                >
                  <Link to={`/product/${relatedProduct._id}`} className="block">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={productImage(relatedProduct.image, 480)}
                      alt={relatedProduct.name}
                      width={480}
                      height={480}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      <bdi>{relatedProduct.name}</bdi>
                    </h3>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(relatedProduct.price)}
                    </p>
                  </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
