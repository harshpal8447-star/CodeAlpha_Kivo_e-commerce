import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ShieldCheck,
  Package,
  LogOut,
  ChevronDown,
  Zap,
  MapPin,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const allCategories = [
    { name: 'Audio & Tech', path: '/products?category=audio-tech' },
    { name: 'Home & Living', path: '/products?category=home-living' },
    { name: 'Apparel', path: '/products?category=apparel' },
    { name: 'Bags & Carry', path: '/products?category=bags-carry' },
    { name: 'Footwear', path: '/products?category=footwear' },
    { name: 'Wellness & Scents', path: '/products?category=wellness-scents' },
    { name: 'Watches & Accessories', path: '/products?category=watches-accessories' },
    { name: 'Workspace & Desk', path: '/products?category=workspace-desk' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Top promotional & Kivo Minutes announcement bar */}
      <div className="bg-slate-950 text-slate-200 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 sm:gap-3">
        <Link
          to="/minutes"
          className="inline-flex items-center gap-1 text-amber-300 font-extrabold bg-amber-950/80 hover:bg-amber-900/80 px-2 py-0.5 rounded-full border border-amber-500/50 text-[10px] sm:text-[11px] transition-colors"
        >
          <Zap className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
          <span>⚡ KIVO MINUTES STOREFRONT</span>
          <span className="bg-amber-400 text-slate-950 px-1 rounded font-black text-[9px] ml-0.5">10-15 MIN</span>
        </Link>
        <span className="hidden sm:inline">&bull; Ultra-fast dark store dispatch across Mumbai &bull; Complimentary on orders over ₹499</span>
        <span className="sm:hidden">&bull; Free delivery over ₹499</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">
          {/* Mobile menu hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-teal-700 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Wordmark & Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-teal-700 dark:bg-teal-600 flex items-center justify-center text-white shadow-sm group-hover:bg-teal-800 transition-colors">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white font-sans">
              kivo<span className="text-teal-600 dark:text-teal-400">.</span>
            </span>
          </Link>

          {/* Kivo Minutes Nav Pill */}
          <Link
            to="/minutes"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-black text-xs shadow-sm hover:shadow-md hover:scale-105 transition-all border border-amber-300 group flex-shrink-0"
            title="Instant 10-15 minute delivery on essentials"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span>KIVO MINUTES</span>
            <span className="bg-slate-950 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-0.5">12 MIN</span>
          </Link>

          {/* Desktop Categories Navigation */}
          <nav className="hidden lg:flex items-center space-x-5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link
              to="/products"
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors py-1 font-semibold"
            >
              Shop All
            </Link>
            <Link
              to="/products?category=audio-tech"
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors py-1"
            >
              Audio & Tech
            </Link>
            <Link
              to="/products?category=home-living"
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors py-1"
            >
              Home & Living
            </Link>
            <Link
              to="/products?category=apparel"
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors py-1"
            >
              Apparel
            </Link>

            {/* More Categories Dropdown */}
            <div className="relative" onMouseLeave={() => setCategoriesDropdownOpen(false)}>
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                onMouseEnter={() => setCategoriesDropdownOpen(true)}
                className="flex items-center gap-1 hover:text-teal-700 dark:hover:text-teal-400 transition-colors py-1"
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in">
                  {allCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      to={cat.path}
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-teal-700"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center relative flex-1 max-w-xs md:max-w-sm ml-auto"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search design essentials, audio, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-teal-600 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
          </form>

          {/* Action Icons: Theme, Account, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Account / Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                      <Link
                        to="/seller"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700/50 font-medium"
                      >
                        <Store className="w-4 h-4 text-amber-600" />
                        <span>Seller Portal ({user?.storeName || 'Merchant'})</span>
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700/50 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Account & Addresses
                    </Link>

                    <Link
                      to="/account/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      Order History
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700/50 text-left border-t border-slate-100 dark:border-slate-700 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={`Open shopping cart containing ${cart.itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.itemCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-teal-700 dark:bg-teal-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {cart.itemCount > 99 ? '99+' : cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-full pl-9 pr-3 py-2 border border-transparent focus:border-teal-600 focus:outline-none"
            />
          </form>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3">
          {/* Mobile Kivo Minutes Hero Banner */}
          <Link
            to="/minutes"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
              <span>⚡ KIVO MINUTES (10-15 MIN)</span>
            </span>
            <span className="text-[10px] bg-slate-950 text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase">
              Live Store
            </span>
          </Link>

          <nav className="flex flex-col space-y-1">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-900 dark:text-white hover:text-teal-700 py-2 border-b border-slate-100 dark:border-slate-800"
            >
              Shop All Products
            </Link>
            {allCategories.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-700 py-1.5 border-b border-slate-100 dark:border-slate-800"
              >
                {item.name}
              </Link>
            ))}
            {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
              <Link
                to="/seller"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-amber-700 dark:text-amber-400 py-1.5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800"
              >
                <Store className="w-4 h-4 text-amber-600" />
                <span>Seller Portal ({user?.storeName || 'Merchant'})</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-teal-700 dark:text-teal-400 py-1.5"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
