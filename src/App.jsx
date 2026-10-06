import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import ScrollManager from "./components/ScrollManager";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import { useUserStore } from "./stores/useUserStore";
import { useCartStore } from "./stores/useCartStore";
import { useWishlistStore } from "./stores/useWishlistStore";
import "./App.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const DealsPage = lazy(() => import("./pages/DealsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const CategoryProductsPage = lazy(() => import("./pages/CategoryProductsPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ForgetPasswordPage = lazy(() => import("./pages/ForgetPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const EmailConfirmationPage = lazy(() => import("./pages/EmailConfirmationPage"));
const PurchaseSuccessPage = lazy(() => import("./pages/PurchaseSuccessPage"));
const PurchaseCancelPage = lazy(() => import("./pages/PurchaseCancelPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Warm up the most visited pages once the first screen has rendered.
const preloadCommonPages = (isLoggedIn) => {
  import("./pages/ShopPage");
  import("./pages/ProductDetailPage");
  import("./pages/CategoriesPage");
  import("./pages/CategoryProductsPage");
  import("./pages/SearchPage");
  if (!isLoggedIn) {
    import("./pages/LoginPage");
    import("./pages/SignUpPage");
  }
};

// Pages with a fixed title; product, category and 404 pages set their own.
const PAGE_TITLES = {
  "/": "",
  "/shop": "nav.shop",
  "/deals": "nav.deals",
  "/about": "nav.about",
  "/contact": "nav.contact",
  "/categories": "nav.categories",
  "/search": "titles.search",
  "/login": "nav.signin",
  "/signup": "titles.signup",
  "/forget-password": "titles.forgotPassword",
  "/reset-password": "titles.resetPassword",
  "/profile": "nav.profile",
  "/cart": "nav.cart",
  "/checkout": "titles.checkout",
  "/wishlist": "nav.wishlist",
  "/purchase-success": "titles.purchaseSuccess",
  "/purchase-cancel": "titles.purchaseCancel",
  "/admin": "nav.admin",
};

const RouteTitle = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const key = pathname.startsWith("/confirm-email/") ? "titles.confirmEmail" : PAGE_TITLES[pathname];
  useDocumentTitle(key === undefined ? null : key && t(key));
  return null;
};

const RequireAuth = ({ user, children }) => {
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

const RequireAdmin = ({ user, children }) => {
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.data?.user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

// Signed-in visitors skip the login and sign-up pages and go where they were headed.
const GuestOnly = ({ user, children }) => {
  const location = useLocation();
  if (user) return <Navigate to={location.state?.from || "/"} replace />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const { user, checkAuth, justLoggedOut, initializeUser } = useUserStore();
  const getCartItems = useCartStore((state) => state.getCartItems);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  useEffect(() => {
    const storedUser = initializeUser();

    // Verify the stored session with the server, unless the user has just logged out.
    if (storedUser && !justLoggedOut) {
      checkAuth(true);
    }
    const timer = setTimeout(() => preloadCommonPages(Boolean(storedUser)), 2000);
    return () => clearTimeout(timer);
  }, [justLoggedOut, initializeUser, checkAuth]);

  // Keyed on the account id: the stored user and the verified profile are different objects
  // for the same person and must not trigger a second fetch.
  const userId = user?.data?.user?._id;
  useEffect(() => {
    if (userId) {
      // Both stores report their own errors.
      getCartItems().catch(() => {});
      fetchWishlist().catch(() => {});
    }
  }, [userId, getCartItems, fetchWishlist]);

  // The home page renders its own navbar over the hero section.
  const showGlobalNavbar = location.pathname !== "/";
  const showFooter = !["/login", "/signup", "/forget-password", "/reset-password", "/admin"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <ScrollManager />
      <RouteTitle />
      {showGlobalNavbar && <Navbar />}

      <Suspense fallback={<LoadingSpinner />}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={showGlobalNavbar ? "pt-20" : ""}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:id/products" element={<CategoryProductsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<GuestOnly user={user}><LoginPage /></GuestOnly>} />
            <Route path="/signup" element={<GuestOnly user={user}><SignUpPage /></GuestOnly>} />
            <Route path="/forget-password" element={<ForgetPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/confirm-email/:token" element={<EmailConfirmationPage />} />

            {/* Protected Routes */}
            <Route path="/profile" element={<RequireAuth user={user}><ProfilePage /></RequireAuth>} />
            <Route path="/cart" element={<RequireAuth user={user}><CartPage /></RequireAuth>} />
            <Route path="/checkout" element={<RequireAuth user={user}><CheckoutPage /></RequireAuth>} />
            <Route path="/wishlist" element={<RequireAuth user={user}><WishlistPage /></RequireAuth>} />
            <Route
              path="/purchase-success"
              element={<PurchaseSuccessPage />}
            />
            <Route
              path="/purchase-cancel"
              element={<PurchaseCancelPage />}
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<RequireAdmin user={user}><AdminDashboard /></RequireAdmin>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.div>
      </Suspense>

      {showFooter && <Footer />}

      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          bottom: "20px",
          insetInline: "20px",
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            color: "#374151",
            border: "1px solid rgba(209, 213, 219, 0.5)",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            backdropFilter: "blur(10px)",
            fontSize: "14px",
            fontWeight: "500",
            padding: "16px 20px",
            maxWidth: "400px",
            zIndex: 9999,
            cursor: "pointer",
            marginTop: "0",
            marginBottom: "0",
          },
          success: {
            style: {
              background: "rgba(34, 197, 94, 0.95)",
              color: "white",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            },
            iconTheme: {
              primary: "white",
              secondary: "#22c55e",
            },
          },
          error: {
            style: {
              background: "rgba(239, 68, 68, 0.95)",
              color: "white",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            },
            iconTheme: {
              primary: "white",
              secondary: "#ef4444",
            },
          },
          loading: {
            style: {
              background: "rgba(59, 130, 246, 0.95)",
              color: "white",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            },
            iconTheme: {
              primary: "white",
              secondary: "#3b82f6",
            },
          },
        }}
      />
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
