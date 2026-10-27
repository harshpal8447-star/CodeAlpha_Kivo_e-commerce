import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag } from 'lucide-react';
import { orderService } from '../services/order.service.js';
import { formatINR } from '../utils/currency.js';

export const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderId) {
      orderService
        .getOrderById(orderId)
        .then(setOrder)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [order, orderId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading order details...</p>
      </div>
    );
  }

  const shippingAddr =
    typeof order?.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : order?.shippingAddress;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Confirmation Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Thank you for choosing Kivo!
        </h1>
        <p className="text-sm text-slate-500">
          Your order has been verified and confirmed. A confirmation receipt has been dispatched.
        </p>
      </div>

      {/* Order Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-700 gap-4">
          <div>
            <span className="text-xs text-slate-400">Order Reference</span>
            <div className="text-xl font-mono font-extrabold text-teal-700 dark:text-teal-400">
              {order?.orderNumber || orderId}
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-slate-400">Order Status</span>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {order?.status || 'CONFIRMED'}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping notice */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200">
          <Truck className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <span>
            Estimated dispatch within 24 hours. Tracking details will update automatically in your account.
          </span>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Purchased Essentials
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {order?.items?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-xl bg-slate-100 dark:bg-slate-700"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {item.productName}
                    </span>
                    <span className="text-slate-400 text-xs">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatINR(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Invoice Total */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700 text-xs">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
              Delivery Address
            </h4>
            {shippingAddr && (
              <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-white">{shippingAddr.fullName}</p>
                <p>{shippingAddr.street}</p>
                <p>
                  {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
                </p>
                <p>{shippingAddr.country}</p>
              </div>
            )}
          </div>

          <div className="sm:text-right space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
              Payment Summary
            </h4>
            <div className="flex justify-between sm:justify-end gap-6 text-slate-500">
              <span>Subtotal:</span>
              <span>{formatINR(order?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-6 text-slate-500">
              <span>Shipping:</span>
              <span>{order?.shippingFee === 0 ? 'Complimentary' : formatINR(order?.shippingFee || 0)}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-6 text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
              <span>Total Paid:</span>
              <span className="text-teal-700 dark:text-teal-400">
                {formatINR(order?.total || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/account/orders"
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-full shadow-sm transition-colors"
        >
          <Package className="w-4 h-4" />
          <span>View in Order History</span>
        </Link>

        <Link
          to="/products"
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-full transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
