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
} from 'lucide-react';
import { adminService } from '../../services/admin.service.js';
import { formatINR } from '../../utils/currency.js';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getMetrics()
      .then(setData)
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

      {/* Recent Orders Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            Recent Customer Orders
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
    </div>
  );
};

export default AdminDashboardPage;
