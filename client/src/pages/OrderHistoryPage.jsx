import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Search,
  Truck,
  RotateCcw,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { orderService } from '../services/order.service.js';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import { formatINR } from '../utils/currency.js';

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackQuery, setTrackQuery] = useState('');
  const [trackError, setTrackError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    orderService
      .getMyOrders()
      .then((data) => {
        const orderList = Array.isArray(data) ? data : data?.orders || [];
        setOrders(orderList);
      })
      .catch((err) => {
        console.error('Failed to load orders:', err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    const cleanRef = trackQuery.trim().toUpperCase();
    navigate(`/account/orders/${encodeURIComponent(cleanRef)}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'SHIPPED':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'CANCELLED':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'PROCESSING':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'My Account', path: '/account' }, { label: 'Order History & Tracking' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Order History & Live Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your past purchases, track active shipments, and view itemized invoices in Indian Rupees (₹).
          </p>
        </div>

        {/* Quick Order Lookup Bar */}
        <form onSubmit={handleTrackSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Track by ref e.g. KV-2026-..."
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-600 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your purchase records...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400 mx-auto">
            <Package className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">No orders placed yet</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            When you purchase items from Kivo, your orders, delivery status, and tracking updates will appear right here.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-full shadow-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      {(order.isMinutesDelivery || order.orderNumber?.startsWith('KV-MIN-')) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full border border-amber-300">
                          <Zap className="w-3 h-3 fill-slate-950 text-slate-950" />
                          <span>12 Min Delivery</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    {formatINR(order.total)}
                  </span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5 flex-shrink-0">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-100 dark:border-slate-700"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80';
                        }}
                      />
                      <div className="text-xs pr-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block max-w-[160px] truncate">
                          {item.productName}
                        </span>
                        <span className="text-slate-400">Qty: {item.quantity} &bull; {formatINR(item.unitPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-teal-700 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track & View Receipt</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
