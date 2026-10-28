import React from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Zap,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/common/Toast.jsx';
import { useCart } from '../context/CartContext.jsx';

export const SellerLayout = () => {
  const { user, loading, logout } = useAuth();
  const { toast } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Verifying seller credentials...</p>
        </div>
      </div>
    );
  }

  const isSellerOrAdmin = user && (user.role === 'SELLER' || user.role === 'ADMIN');
  if (!isSellerOrAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { label: 'Store Overview', path: '/seller', icon: LayoutDashboard },
    { label: 'Product Catalog', path: '/seller/products', icon: Package },
    { label: 'Buyer Orders', path: '/seller/orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 space-y-2">
          <Link to="/seller" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Store className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              kivo<span className="text-teal-400">.</span>seller
            </span>
          </Link>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="block text-[11px] font-bold text-white truncate">
              {user.storeName || user.companyName || 'Seller Store'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle className="w-3 h-3" /> Verified Partner
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Store Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              Hyperlocal Channels
            </div>
            <Link
              to="/minutes"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Kivo Minutes</span>
              </div>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Store className="w-4 h-4 text-teal-400" />
            <span>Buyer Storefront</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 rounded-lg hover:bg-slate-800 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Seller</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/seller');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors shadow-2xs group"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {user.storeName || user.companyName || 'Seller Partner Console'}
            </span>
            <span className="hidden sm:inline-block text-slate-400">&bull;</span>
            <span className="hidden sm:inline-block text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              Active Merchant Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-xs font-bold border border-teal-200 dark:border-teal-800 transition-colors"
              title="Visit live marketplace storefront"
            >
              <Store className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>🛍️ Storefront</span>
            </Link>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {user.name}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">
                {user.role}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="p-6 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default SellerLayout;
