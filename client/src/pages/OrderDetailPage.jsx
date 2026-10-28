import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  CreditCard,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Building,
  Zap,
  Phone,
  FileSpreadsheet,
} from 'lucide-react';
import { orderService } from '../services/order.service.js';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import { formatINR } from '../utils/currency.js';
import { exportToExcel } from '../utils/excelExport.js';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService
      .getOrderById(id)
      .then((data) => {
        if (data) {
          setOrder(data);
        } else {
          setError('Order record could not be found.');
        }
      })
      .catch((err) => {
        console.error('Error fetching order:', err);
        setError(err.message || 'Unable to retrieve order details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Retrieving order tracking and receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Not Found</h2>
        <p className="text-xs text-slate-500">
          We could not locate an order matching reference "{id}". Please verify the order number or check your order history.
        </p>
        <div className="pt-2">
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Order History</span>
          </Link>
        </div>
      </div>
    );
  }

  const shippingAddr =
    typeof order.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress;

  const isMinutes = order.isMinutesDelivery || order.orderNumber?.startsWith('KV-MIN-');

  const standardMilestones = [
    { key: 'CONFIRMED', title: 'Order Confirmed', desc: 'Payment verified and inventory locked' },
    { key: 'PROCESSING', title: 'Processing & Packing', desc: 'Assembled and packaged at central fulfillment' },
    { key: 'SHIPPED', title: 'Dispatched & In Transit', desc: 'Handed over to Express Courier (Blue Dart / Delhivery)' },
    { key: 'DELIVERED', title: 'Delivered', desc: 'Package received by customer' },
  ];

  const minutesMilestones = [
    { key: 'CONFIRMED', title: 'Order Received', desc: 'Routed to Mumbai dark store' },
    { key: 'PROCESSING', title: 'Picked & Packed', desc: 'Packed into thermal tote in 2 mins' },
    { key: 'SHIPPED', title: 'Rider Dispatched', desc: 'Electric scooter en route to address' },
    { key: 'DELIVERED', title: 'Delivered in 12 Mins', desc: 'Handed to customer at doorstep' },
  ];

  const milestones = isMinutes ? minutesMilestones : standardMilestones;
  const milestoneKeys = milestones.map((m) => m.key);
  const currentStep = order.status === 'CANCELLED' ? -1 : milestoneKeys.indexOf(order.status);

  const handleExportInvoice = () => {
    if (!order) return;
    const itemsData = (order.items || []).map((item, index) => ({
      'Item No.': index + 1,
      'Product Name': item.productName,
      'SKU': item.productSku || 'N/A',
      'Unit Price (₹)': item.unitPrice,
      'Quantity': item.quantity,
      'Line Total (₹)': item.total,
      'Delivery Tag': item.isMinutesItem ? '⚡ 10-15 Min Hyperlocal' : '📦 Standard Courier (2-4 Days)',
      'Status': item.status || 'CONFIRMED',
    }));

    // Add summary row at the bottom
    itemsData.push({
      'Item No.': '',
      'Product Name': 'TOTAL INVOICE AMOUNT',
      'SKU': '',
      'Unit Price (₹)': '',
      'Quantity': '',
      'Line Total (₹)': order.total,
      'Delivery Tag': `Subtotal: ₹${order.subtotal} | Shipping: ₹${order.shippingFee} | Tax: ₹${order.tax}`,
      'Status': `Payment: ${order.paymentStatus}`,
    });

    exportToExcel(itemsData, `Kivo_Invoice_${order.orderNumber}`, 'Invoice');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <button
          onClick={() => navigate('/account/orders')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-2xs group"
          title="Return to Order History"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Orders</span>
        </button>
        <Breadcrumbs
          items={[
            { label: 'My Account', path: '/account' },
            { label: 'Orders', path: '/account/orders' },
            { label: order.orderNumber },
          ]}
        />
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Order Reference</span>
            {isMinutes && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full border border-amber-300">
                <Zap className="w-3 h-3 fill-slate-950 text-slate-950" />
                <span>Kivo Minutes</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
            {order.orderNumber}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportInvoice}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            title="Download invoice as Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Invoice (.xlsx)</span>
          </button>

          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>
        </div>
      </div>

      {/* Live Tracking Timeline */}
      {order.status === 'CANCELLED' ? (
        <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-200 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <strong className="block font-bold text-sm">This order was cancelled.</strong>
            <span>Payment was not processed and inventory was restored.</span>
          </div>
        </div>
      ) : isMinutes ? (
        <div className="bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-400 text-slate-950 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg border border-amber-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-950/15 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-300 flex items-center justify-center font-black shadow">
                <Zap className="w-6 h-6 fill-amber-400 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg tracking-tight">⚡ Kivo Minutes Live Hyperlocal Tracking</h2>
                <span className="text-xs font-semibold text-slate-800">Packed at Kivo Bandra Dark Store #08</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 bg-slate-950 text-amber-300 rounded-full font-black text-xs uppercase tracking-wider shadow">
                {order.status === 'DELIVERED' ? '✔ Delivered in 11 Mins' : '⚡ ETA: Arriving in 12 Mins'}
              </span>
            </div>
          </div>

          {/* Stepper Grid for Minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2">
            {milestones.map((m, idx) => {
              const isCompleted = idx <= (currentStep === -1 ? 0 : currentStep);
              const isCurrent = idx === currentStep;

              return (
                <div key={m.key} className="relative flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-colors flex-shrink-0 ${
                      isCompleted
                        ? 'bg-slate-950 text-amber-300 shadow-md'
                        : 'bg-amber-500/40 text-slate-800'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-amber-400" /> : idx + 1}
                  </div>
                  <div>
                    <span className="block font-black text-xs text-slate-950">
                      {m.title}
                    </span>
                    <span className="text-[11px] text-slate-800 block leading-tight mt-0.5 font-medium">
                      {m.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rider contact banner */}
          <div className="p-4 bg-slate-950/10 rounded-2xl border border-slate-950/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-300 flex items-center justify-center font-bold">
                🛵
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-700">Dedicated Kivo Minutes Rider</span>
                <div className="font-extrabold text-sm">{order.assignedRider || 'Vikram Sen (Hero Electric Nyx #412)'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono font-bold text-xs bg-slate-950 text-white px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{order.riderPhone || '+91 98201 88990'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Shipment Tracking</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800 uppercase tracking-wider">
              Status: {order.status}
            </span>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2">
            {milestones.map((m, idx) => {
              const isCompleted = idx <= (currentStep === -1 ? 0 : currentStep);
              const isCurrent = idx === currentStep;

              return (
                <div key={m.key} className="relative flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors flex-shrink-0 ${
                      isCompleted
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div>
                    <span
                      className={`block font-bold text-xs ${
                        isCurrent
                          ? 'text-teal-700 dark:text-teal-400'
                          : isCompleted
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {m.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                      {m.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Estimated delivery within 2-4 business days via Express Air Courier.</span>
          </div>
        </div>
      )}

      {/* Detailed Order Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Purchased Items */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
            Ordered Articles ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-4">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                    alt={item.productName}
                    className="w-14 h-14 object-cover rounded-xl bg-slate-100 dark:bg-slate-700"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80';
                    }}
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {item.productName}
                    </span>
                    <span className="text-slate-400 text-xs">SKU: {item.productSku || 'KV-ITEM'}</span>
                    <span className="text-slate-500 block text-xs mt-0.5">
                      {formatINR(item.unitPrice)} &times; {item.quantity}
                    </span>
                    <div className="mt-1">
                      {item.isMinutesItem ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                          <Zap className="w-2.5 h-2.5 fill-amber-500" />
                          <span>⚡ 10–15 Mins Hyperlocal Delivery</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          <Truck className="w-2.5 h-2.5" />
                          <span>Standard Courier Dispatch (2–4 Days)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  {formatINR(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial & Address Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Shipping snapshot */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-5 space-y-2 text-xs shadow-sm">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Delivery Address</span>
            </h4>
            {shippingAddr && (
              <div className="text-slate-700 dark:text-slate-300 space-y-0.5 leading-relaxed">
                <p className="font-bold text-slate-900 dark:text-white">{shippingAddr.fullName}</p>
                <p>{shippingAddr.street}</p>
                <p>
                  {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
                </p>
                <p>{shippingAddr.country || 'India'}</p>
                {shippingAddr.phone && <p className="text-slate-400 pt-1">Tel: {shippingAddr.phone}</p>}
              </div>
            )}
          </div>

          {/* Payment breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-5 space-y-2.5 text-xs shadow-sm">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <CreditCard className="w-3.5 h-3.5 text-teal-600" />
              <span>Tax Invoice & Payment</span>
            </h4>

            <div className="flex justify-between text-slate-500">
              <span>Payment Mode:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{order.paymentMethod}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>Payment Status:</span>
              <span className="font-bold text-teal-700 dark:text-teal-400">{order.paymentStatus}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? 'Complimentary' : formatINR(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated GST (18%)</span>
                <span>{formatINR(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-teal-700 dark:text-teal-400 font-semibold">
                  <span>Promo Savings</span>
                  <span>-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
                <span>Total Amount Paid</span>
                <span className="text-teal-700 dark:text-teal-400">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
