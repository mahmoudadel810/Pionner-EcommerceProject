import { useState, useEffect, memo, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "./ui/navigation-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Avatar } from "./ui/avatar";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
  Home,
  LogOut,
  Package,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import LanguageSwitcher from "./LanguageSwitcher";
import axios from "../lib/axios";
import "../App.css";
import API_CONFIG from "../config/api.js";
import { STORE_CATEGORIES, categoryLabel, categorySlug } from "../lib/categories";
import { buildApiUrl } from "../config/api.js";

const Navbar = memo(() => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    if (!showUserDropdown) return;
    function handleClickOutside(event) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown]);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUserStore();

  // Menus close whenever the page changes, including Back/Forward and programmatic navigation.
  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserDropdown(false);
  }, [location.pathname, location.search]);
  const { cart } = useCartStore();
  const { wishlist } = useWishlistStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const categories = STORE_CATEGORIES.map((category) => ({
    ...category,
    name: t(`categories.${category.key}`),
    href: `/shop?category=${categorySlug(category.name)}`,
  }));

  const navLinks = [
    { name: t('nav.home'), href: "/", icon: Home },
    { name: t('nav.shop'), href: "/shop", icon: Package },
    { name: t('nav.categories'), href: "/categories", icon: Package },
    { name: t('nav.deals'), href: "/deals", badge: t('nav.hot'), icon: TrendingUp },
    { name: t('nav.about'), href: "/about" },
    { name: t('nav.contact'), href: "/contact" },
  ];

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
    setIsMenuOpen(false);
    setShowUserDropdown(false);
  }, [logout, navigate]);

  const handleSearch = useCallback(
    e => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
        setIsSearchFocused(false);
      }
    },
    [searchQuery, navigate]
  );

  const suggestionTimeout = useRef(null);

  useEffect(() => () => clearTimeout(suggestionTimeout.current), []);

  const handleSearchChange = useCallback(e => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(suggestionTimeout.current);

    if (value.length <= 2) {
      setSearchSuggestions([]);
      return;
    }

    suggestionTimeout.current = setTimeout(async () => {
      try {
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH_SUGGESTIONS) + `?search=${encodeURIComponent(value)}&limit=4`;
        const response = await axios.get(url);
        setSearchSuggestions(response.data.success ? response.data.data || [] : []);
      } catch {
        setSearchSuggestions([]);
      }
    }, 300);
  }, []);

  const cartItemCount = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );
  const wishlistItemCount = wishlist.length;

  const isActive = useCallback(
    href => {
      const { pathname } = location;
      if (href === "/") return pathname === "/";
      // A product page belongs to the shop.
      if (href === "/shop" && pathname.startsWith("/product/")) return true;
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [location]
  );

  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 start-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50"
            : "bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-200/50"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-3 select-none group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-blue-600 to-orange-500 rounded-sm"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
                {t('company.name')}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {navLinks.map(link => (
                    <NavigationMenuItem key={link.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={link.href}
                          className={`nav-animated-link px-2 xl:px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200 flex items-center relative group ${
                            isActive(link.href)
                              ? "text-blue-600 bg-blue-50 shadow-sm"
                              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          {link.icon && (
                            <link.icon
                              size={18}
                              className={`me-2 transition-colors ${
                                isActive(link.href)
                                  ? "text-blue-600"
                                  : "text-gray-500 group-hover:text-blue-600"
                              }`}
                            />
                          )}
                          {link.name}
                          {link.badge && (
                            <Badge className="ms-2 bg-red-500 text-white text-xs animate-pulse">
                              {link.badge}
                            </Badge>
                          )}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center w-80 lg:w-56 xl:w-80 relative">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
                  />
                  <Input
                    type="text"
                    placeholder={t('nav.search_placeholder')}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsSearchFocused(false), 200)
                    }
                    className="w-full ps-10 pe-4 py-2.5 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                {/* Search Suggestions */}
                {isSearchFocused && searchSuggestions.length > 0 && (
                  <div className="absolute top-full start-0 end-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[300px]">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion._id || index}
                        type="button"
                        onClick={() => {
                          if (suggestion._id) {
                            navigate(`/product/${suggestion._id}`);
                            setSearchQuery("");
                          } else {
                            setSearchQuery(suggestion.name);
                          }
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-start px-6 py-3 hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <Search
                            size={16}
                            className="me-3 text-gray-400 flex-shrink-0"
                          />
                          <span className="truncate text-sm font-medium">
                            <bdi>{suggestion.name}</bdi>
                          </span>
                        </div>
                        {suggestion.category && (
                          <Badge className="ms-3 text-xs bg-gray-100 text-gray-600 flex-shrink-0">
                            {categoryLabel(t, suggestion.category)}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-1">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* Wishlist */}
              <Button
                asChild
                variant="ghost"
                className={`relative hidden md:flex p-2.5 rounded-xl transition-colors ${
                  isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
                }`}
              >
                <Link to="/wishlist" aria-label={t('nav.wishlist')}>
                <Heart size={20} className="text-gray-600" />
                {wishlistItemCount > 0 && (
                  <Badge className="absolute -top-1 -end-1 bg-pink-500 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {wishlistItemCount}
                  </Badge>
                )}
                </Link>
              </Button>

              {/* Cart */}
              <Button
                asChild
                variant="ghost"
                className="relative p-2.5 rounded-xl transition-colors hover:bg-gray-100"
              >
                <Link to="/cart" aria-label={t('nav.cart')}>
                <ShoppingCart size={20} className="text-gray-600" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -end-1 bg-blue-600 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartItemCount}
                  </Badge>
                )}
                </Link>
              </Button>

              {/* User Menu - Simplified Dropdown */}
              {user ? (
                <div
                  className="relative hidden md:flex items-center"
                  ref={userDropdownRef}
                >
                  <button
                    onClick={() => setShowUserDropdown(prev => !prev)}
                    className="flex items-center gap-2 p-2 rounded-xl transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.data?.user?.profileImage ? (
                        <img 
                          src={user.data.user.profileImage} 
                          alt={t('nav.profile')} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        user.data?.user?.name?.charAt(0).toUpperCase() || <User size={18} />
                      )}
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      {user.data?.user?.name || t('nav.user')}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showUserDropdown && (
                    <div className="absolute top-full end-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                      {/* Profile Header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.data?.user?.profileImage ? (
                              <img 
                                src={user.data.user.profileImage} 
                                alt={t('nav.profile')} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              user.data?.user?.name?.charAt(0).toUpperCase() || <User size={20} />
                            )}
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {user.data?.user?.name || t('nav.user')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.data?.user?.email || t('nav.noEmail')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserDropdown(false)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors text-start"
                        >
                          <User size={18} />
                          <span className="font-medium">{t('nav.profile')}</span>
                        </Link>

                        {/* Admin Dashboard Link */}
                        {user.data?.user?.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserDropdown(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors text-start"
                          >
                            <Shield size={18} />
                            <span className="font-medium">{t('nav.admin')}</span>
                          </Link>
                        )}

                        <div className="border-t border-gray-100 my-1" />

                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:text-white hover:bg-red-500 transition-colors text-start"
                        >
                          <LogOut size={18} />
                          <span className="font-medium">{t('nav.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                asChild
                variant="ghost"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100"
              >
                <Link to="/login" state={{ from: location }}>
                  <User size={20} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {t('auth.signIn')}
                  </span>
                </Link>
              </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                className="flex lg:hidden p-2.5 rounded-xl transition-colors hover:bg-gray-100 z-50"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={t('nav.toggleMenu')}
              >
                {isMenuOpen ? (
                  <X size={24} className="text-gray-600" />
                ) : (
                  <Menu size={24} className="text-gray-600" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl lg:hidden">
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto px-4 pt-24 pb-8">
              {/* Mobile Search */}
              <div className="mb-8">
                <form onSubmit={handleSearch} className="relative">
                  <Search
                    size={20}
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    type="text"
                    placeholder={t('nav.search_placeholder')}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full ps-10 pe-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-gray-900 placeholder:text-gray-500"
                  />
                </form>
              </div>

              {/* Main Navigation */}
              <div className="space-y-2 mb-8">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                      isActive(link.href)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    {link.icon && (
                      <link.icon
                        size={20}
                        className={
                          isActive(link.href) ? "text-white" : "text-gray-500"
                        }
                      />
                    )}
                    <span className="text-lg font-medium">{link.name}</span>
                    {link.badge && (
                      <Badge className="ms-auto bg-red-500 text-white text-xs">
                        {link.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">
                  {t('nav.categories')}
                </h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <Link
                      key={category.name}
                      to={category.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient} text-white`}
                      >
                        <category.icon size={20} />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Account Section - Mobile */}
              {user ? (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                      <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.data?.user?.profileImage ? (
                          <img 
                            src={user.data.user.profileImage} 
                            alt={t('nav.profile')} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          user.data?.user?.name?.charAt(0).toUpperCase() || <User size={18} />
                        )}
                      </Avatar>
                      <div className="">
                        <p className="font-medium text-gray-900">{user.data?.user?.name || t('nav.user')}</p>
                        <p className="text-sm text-gray-500">{user.data?.user?.email || t('nav.noEmail')}</p>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={20} />
                      <span className="font-medium">{t('nav.profile')}</span>
                    </Link>

                    <Link
                      to="/cart"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingCart size={20} />
                      <span className="font-medium">
                        {t('nav.cart')} ({cartItemCount})
                      </span>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Heart size={20} />
                      <span className="font-medium">
                        {t('nav.wishlist')} ({wishlistItemCount})
                      </span>
                    </Link>

                    {/* Admin Dashboard Link - Mobile */}
                    {user.data?.user?.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <Shield size={20} />
                        <span className="font-medium">{t('nav.admin')}</span>
                      </Link>
                    )}

                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors justify-start"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">{t('nav.logout')}</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Separator className="my-6" />
                  <Button
                    asChild
                    variant="default"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg"
                  >
                    <Link to="/login" state={{ from: location }} onClick={closeMobileMenu}>
                      <User size={20} className="me-2" />
                      {t('auth.signIn')}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
