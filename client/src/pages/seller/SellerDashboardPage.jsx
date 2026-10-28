import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Package,
  Zap,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  ShoppingBag,
  CheckCircle,
  Truck,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { sellerService } from '../../services/seller.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatRupee } from '../../utils/currency.js';

export const SellerDashboardPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        const [metricData, profileData] = await Promise.all([
          sellerService.getMetrics(),
          sellerService.getProfile(),
        ]);
        setMetrics(metricData?.metrics || null);
        setRecentSales(metricData?.recentSales || []);
        setProfile(profileData || null);
      } catch (err) {
        console.error('Failed to load seller dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 🏪 Seller Header & Company Identity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-teal-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Store className="w-3.5 h-3.5" />
            <span>Kivo Partner Seller Portal</span>
            {profile?.isSellerApproved && (
              <span className="flex items-center gap-1 text-emerald-400 ml-1">
                <CheckCircle className="w-3 h-3" /> Verified Partner
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {profile?.storeName || user?.storeName || 'Merchant Storefront'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300">
            <strong>{profile?.companyName || user?.companyName}</strong>
            {profile?.sellerGstin && ` • GSTIN: ${profile.sellerGstin}`}
            {profile?.sellerCity && ` • Hub: ${profile.sellerCity}`}
          </p>

          <p className="text-xs text-slate-400">
            {profile?.sellerBio || 'Manage your products, live dark store inventory, received buyer orders, and fulfillment pipelines.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/seller/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>

          <Link
            to="/seller/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Buyer Orders</span>
          </Link>

          <Link
            to="/minutes"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-400/30 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>View 12-Min Storefront</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 📊 Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Seller Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatRupee(metrics?.totalRevenue || 0)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Dispatched & confirmed buyer transactions</p>
          </div>
        </div>

        {/* Metric 2: Total Received Orders */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Orders Received</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.totalOrders || 0}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Total customer checkouts containing your items</p>
          </div>
        </div>

        {/* Metric 3: Active Products */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Products</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.totalProducts || 0}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Active SKUs listed under your company</p>
          </div>
        </div>

        {/* Metric 4: Kivo Minutes SKUs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">⚡ 12-Min Dark Store SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.minutesSkus || 0}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Enabled for hyperlocal 10-15m dispatch</p>
          </div>
        </div>
      </div>

      {/* 📦 Recent Buyer Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Buyer Orders
            </h2>
            <p className="text-xs text-slate-500">
              Orders placed by customers for your store's merchandise
            </p>
          </div>

          <Link
            to="/seller/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentSales.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs text-slate-500">No buyer orders received yet. Once buyers order your products, they will appear here live.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Item Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSales.map((sale) => (
                  <tr key={sale.itemId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700 dark:text-teal-400">
                      {sale.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      {sale.customerName}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {sale.productName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {sale.quantity}x
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      {formatRupee(sale.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      {sale.isMinutesDelivery ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                          <Zap className="w-2.5 h-2.5" /> 12 MINS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[10px]">
                          <Truck className="w-2.5 h-2.5" /> Standard
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : sale.status === 'DISPATCHED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : sale.status === 'PACKED'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/seller/orders"
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[11px] font-semibold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboardPage;
