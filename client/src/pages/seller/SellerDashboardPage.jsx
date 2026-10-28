import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Package,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  ShoppingBag,
  CheckCircle,
  Truck,
  ExternalLink,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { sellerService } from '../../services/seller.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatRupee } from '../../utils/currency.js';

export const SellerDashboardPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        const [metricData, profileData, productsData] = await Promise.all([
          sellerService.getMetrics(),
          sellerService.getProfile(),
          sellerService.getProducts({ limit: 50 }),
        ]);
        setMetrics(metricData?.metrics || null);
        setRecentSales(metricData?.recentSales || []);
        setProfile(profileData || null);
        setProducts(productsData?.products || []);
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

  const minutesProducts = products.filter((p) => p.isMinutesEligible);
  const standardProducts = products.filter((p) => !p.isMinutesEligible);
  const lowStockProducts = products.filter((p) => p.stock < 10);

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

      {/* ⚡ TABLE 1: Kivo Minutes Quick-Commerce Hyperlocal Inventory */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/60 overflow-hidden shadow-2xs">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border-b border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚡ Kivo Minutes Dark Store Table</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
                  {minutesProducts.length} Quick SKUs Active
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Items stocked in automated micro-fulfillment hubs for guaranteed 10–15 min electric rider dispatch.
              </p>
            </div>
          </div>

          <Link
            to="/seller/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline"
          >
            <span>Manage Quick Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {minutesProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No products currently enabled for Kivo Minutes dark store fulfillment. Edit products to enable 10-15m quick delivery.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-amber-50/50 dark:bg-amber-950/20 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Quick Price</th>
                  <th className="py-3 px-4">Standard Price</th>
                  <th className="py-3 px-4">ETA</th>
                  <th className="py-3 px-4">Dark Store Stock</th>
                  <th className="py-3 px-4">Quick Category</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/60 dark:divide-amber-900/40">
                {minutesProducts.map((p) => {
                  const img = Array.isArray(p.images) ? p.images[0] : p.images;
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <span className="font-bold text-slate-900 dark:text-white block max-w-xs truncate">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">{p.sku}</td>
                      <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatRupee(p.minutesPrice || p.price)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 line-through">
                        {formatRupee(p.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold text-[10px]">
                          <Zap className="w-2.5 h-2.5" /> {p.deliveryTimeMinutes || 12} MINS
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {p.stock} units
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {p.minutesCategory || 'Essentials'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/seller/products"
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-[11px] font-semibold"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📦 TABLE 2: Standard Shipping Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📦 Standard Marketplace Courier Products Table</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300">
                  {standardProducts.length} Items (2–4 Days Delivery)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard catalog items fulfilled via insured surface and air couriers (Blue Dart & Delhivery).
              </p>
            </div>
          </div>

          <Link
            to="/seller/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
          >
            <span>Manage Standard Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {standardProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No products currently in standard-only shipping.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Delivery Mode</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {standardProducts.map((p) => {
                  const img = Array.isArray(p.images) ? p.images[0] : p.images;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <span className="font-bold text-slate-900 dark:text-white block max-w-xs truncate">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-500">{p.sku}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {p.category?.name || 'General'}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                        {formatRupee(p.price)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {p.stock} units
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                          <Truck className="w-2.5 h-2.5" /> 2–4 Days Standard
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/seller/products"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ⚠️ TABLE 3 (Conditional): Low Inventory Restock Priority Table */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 overflow-hidden shadow-2xs">
          <div className="p-5 sm:p-6 bg-rose-50/70 dark:bg-rose-950/20 border-b border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-200 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Low Stock Replenishment Priority Table ({lowStockProducts.length} items below threshold of 10)</span>
            </div>
            <Link to="/seller/products" className="text-xs text-rose-700 dark:text-rose-400 font-bold hover:underline">
              Restock Now &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-rose-50/40 dark:bg-rose-950/10 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-4">Item</th>
                  <th className="py-2.5 px-4">SKU</th>
                  <th className="py-2.5 px-4">Current Units</th>
                  <th className="py-2.5 px-4">Replenishment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100/60 dark:divide-rose-950/40">
                {lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{p.sku}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold">
                        {p.stock} units left
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-rose-600 dark:text-rose-400 font-semibold">
                      Urgent Re-order Recommended
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📦 TABLE 4: Recent Buyer Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Buyer Orders Table
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

      {/* Storefront Access Banner (Bottom navigation for Seller) */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-teal-800/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Store className="w-3.5 h-3.5" />
              <span>Seller Storefront Navigation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              View Your Store & Products on Live Marketplace
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Check how your listed inventory and Kivo Minutes micro-store catalog appear to live shoppers. Test cart additions, verify pricing, and inspect customer delivery tags.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow hover:shadow-lg hover:scale-105"
            >
              <Store className="w-4 h-4" />
              <span>Go to Storefront Home</span>
            </Link>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700"
            >
              <Package className="w-4 h-4 text-teal-400" />
              <span>View Public Catalog</span>
            </Link>

            <Link
              to="/minutes"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-colors shadow"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ Kivo Minutes Live</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
