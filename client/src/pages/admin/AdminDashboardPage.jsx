import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Zap,
  Store,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { adminService } from '../../services/admin.service.js';
import { formatINR } from '../../utils/currency.js';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getMetrics(),
      adminService.getProducts(),
      adminService.getSellers(),
    ])
      .then(([metricsData, prods, sellersData]) => {
        setData(metricsData);
        setProducts(prods || []);
        setSellers(sellersData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading store performance metrics...</p>
      </div>
    );
  }

  const { metrics, lowStockAlerts, recentOrders } = data || {
    metrics: { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 },
    lowStockAlerts: [],
    recentOrders: [],
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatINR(metrics.totalRevenue),
      sub: 'Verified gross sales',
      icon: DollarSign,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-400',
    },
    {
      label: 'Customer Orders',
      value: metrics.totalOrders,
      sub: 'Lifetime order count',
      icon: ShoppingCart,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
    },
    {
      label: 'Active Catalogue',
      value: metrics.totalProducts,
      sub: 'Listed SKUs',
      icon: Package,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
    },
    {
      label: 'Registered Buyers',
      value: metrics.totalCustomers,
      sub: 'Verified customer accounts',
      icon: Users,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 dark:text-cyan-400',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Executive Store Overview
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Live summary of commerce metrics, inventory replenishment flags, and dispatch queues.
        </p>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{card.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Replenishment Alert */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Low Stock Alert ({lowStockAlerts.length} items below threshold of 10 units)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockAlerts.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-amber-100 dark:border-amber-900/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                    {item.name}
                  </span>
                  <span className="text-slate-400 text-[10px]">SKU: {item.sku}</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold rounded-lg text-[11px]">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⚡ Table 1: Live Kivo Minutes Dark-Store SKUs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-amber-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Zap className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚡ Live Kivo Minutes Dark-Store SKUs Table</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300">
                  {products.filter((p) => p.isMinutesEligible).length} Quick Items
                </span>
              </h2>
              <p className="text-xs text-slate-500">Products stocked in local dark stores for 10-15 minute electric rider delivery.</p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All SKUs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-100 dark:border-amber-900/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-amber-50/40 dark:bg-amber-950/20">
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">⚡ Quick Price</th>
                <th className="py-2.5 px-3">Standard Price</th>
                <th className="py-2.5 px-3">Speed</th>
                <th className="py-2.5 px-3">Dark Store Units</th>
                <th className="py-2.5 px-3">Channel Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/60 dark:divide-amber-900/40">
              {products
                .filter((p) => p.isMinutesEligible)
                .slice(0, 5)
                .map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/20 dark:hover:bg-amber-950/20">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-500">{p.sku}</td>
                    <td className="py-2.5 px-3 font-black text-emerald-600 dark:text-emerald-400">
                      {formatINR(p.minutesPrice || p.price)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 line-through">{formatINR(p.price)}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold text-[10px]">
                        <Zap className="w-2.5 h-2.5" /> {p.deliveryTimeMinutes || 12}m
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{p.stock} units</td>
                    <td className="py-2.5 px-3 text-slate-500">{p.minutesCategory || p.category?.name || 'General'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🏪 Table 2: Registered Marketplace Sellers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>🏪 Registered Marketplace Sellers Table</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300">
                  {sellers.length} Partners
                </span>
              </h2>
              <p className="text-xs text-slate-500">Partner merchant companies and enterprise seller accounts operating on Kivo.</p>
            </div>
          </div>
          <Link
            to="/admin/sellers"
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All Sellers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-950/40">
                <th className="py-2.5 px-3">Company & Brand</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3">Catalog SKUs</th>
                <th className="py-2.5 px-3">Gross Revenue</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sellers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{s.companyName || s.name}</span>
                    <span className="text-[11px] text-teal-600 font-medium">{s.storeName}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{s.email}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">{s.sellerGstin || 'N/A'}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{s.totalProducts} SKUs</td>
                  <td className="py-2.5 px-3 font-black text-slate-900 dark:text-white">{formatINR(s.totalRevenue || 0)}</td>
                  <td className="py-2.5 px-3">
                    {s.isSellerApproved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[10px]">
                        <CheckCircle className="w-2.5 h-2.5" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📦 Table 3: Recent Orders Overview Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            Recent Customer Orders Table
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Order Ref</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 font-mono font-bold text-teal-700 dark:text-teal-400">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {ord.customerName}
                    </span>
                    <span className="text-slate-400 text-[10px]">{ord.customerEmail}</span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-teal-700 dark:text-teal-400 font-semibold">
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {formatINR(ord.total)}
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storefront Access Banner (Bottom navigation for Super Admin) */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-teal-800/50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Store className="w-3.5 h-3.5" />
              <span>Public Storefront Portal</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Switch to Live Customer Storefront
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Experience the marketplace as a buyer. Browse active categories, test product searching, simulate checkout with calibrated delivery fees, or view live dark-store inventory.
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
              <span>Browse Catalog</span>
            </Link>

            <Link
              to="/minutes"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-colors shadow"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ Kivo Minutes</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
