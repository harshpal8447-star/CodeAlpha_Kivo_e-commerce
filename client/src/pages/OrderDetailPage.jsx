import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  CreditCard,
  MapPin,
  Calendar,
} from 'lucide-react';
import { orderService } from '../services/order.service.js';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrderById(id)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading order records...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order not found</h2>
        <p className="text-xs text-slate-500">
          We could not locate this order in your account history.
        </p>
        <Link
          to="/account/orders"
          className="inline-block px-5 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-semibold"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  const shippingAddr =
    typeof order.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress;

  const statuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStep = statuses.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'My Account', path: '/account' },
          { label: 'Orders', path: '/account/orders' },
          { label: order.orderNumber },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 gap-4">
        <div>
          <span className="text-xs text-slate-400">Order Reference</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
            {order.orderNumber}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {/* Progress Stepper */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {statuses.map((step, idx) => {
              const isPast = idx <= currentStep;
              return (
                <div key={step} className="space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition-colors ${
                      isPast
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`block font-semibold text-[11px] uppercase tracking-wider ${
                      isPast ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Order Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Purchased Items */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
            Itemized Articles ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-4">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                    alt={item.productName}
                    className="w-14 h-14 object-cover rounded-xl bg-slate-100 dark:bg-slate-700"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {item.productName}
                    </span>
                    <span className="text-slate-400 text-xs">SKU: {item.productSku || 'KV-ITEM'}</span>
                    <span className="text-slate-500 block text-xs mt-0.5">
                      ${item.unitPrice.toFixed(2)} &times; {item.quantity}
                    </span>
                  </div>
                </div>

                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  ${item.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Address and Financials */}
        <div className="lg:col-span-4 space-y-4">
          {/* Shipping snapshot */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-5 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Destination Address</span>
            </h4>
            {shippingAddr && (
              <div className="text-slate-700 dark:text-slate-300 space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-white">{shippingAddr.fullName}</p>
                <p>{shippingAddr.street}</p>
                <p>
                  {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
                </p>
                <p>{shippingAddr.country}</p>
                {shippingAddr.phone && <p className="text-slate-400 pt-1">Tel: {shippingAddr.phone}</p>}
              </div>
            )}
          </div>

          {/* Payment receipt */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-5 space-y-2.5 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <CreditCard className="w-3.5 h-3.5 text-teal-600" />
              <span>Payment Details</span>
            </h4>

            <div className="flex justify-between text-slate-500">
              <span>Payment Method:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{order.paymentMethod}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>Payment Status:</span>
              <span className="font-bold text-teal-700 dark:text-teal-400">{order.paymentStatus}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? 'Complimentary' : `$${order.shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-teal-700 dark:text-teal-400 font-semibold">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
                <span>Total</span>
                <span className="text-teal-700 dark:text-teal-400">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
