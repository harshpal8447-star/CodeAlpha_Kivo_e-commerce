import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Filter,
  PackageCheck,
  Bike,
  FileSpreadsheet,
  ArrowLeft,
} from 'lucide-react';
import { sellerService } from '../../services/seller.service.js';
import { formatRupee } from '../../utils/currency.js';
import { exportToExcel } from '../../utils/excelExport.js';

export const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await sellerService.getOrders({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        limit: 100,
      });
      const orderList = res?.orders || res?.data?.orders || (Array.isArray(res) ? res : []);
      setOrders(orderList);
    } catch (err) {
      console.error('Failed to load seller orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleExportOrders = () => {
    if (!orders || orders.length === 0) {
      alert('No seller orders available to export.');
      return;
    }

    const data = orders.map((o) => {
      let parsedAddr = {};
      try {
        parsedAddr = typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress || '{}') : o.shippingAddress || {};
      } catch {
        parsedAddr = {};
      }
      const myItems = o.items || [];
      const itemSummaries = myItems.map((i) => `${i.productName} (Qty: ${i.quantity}, Total: ₹${i.total})`).join('; ');

      return {
        'Order Number': o.orderNumber,
        'Order Date': new Date(o.createdAt).toLocaleDateString('en-IN'),
        'Customer Name': o.customerName,
        'Customer Email': o.customerEmail,
        'Delivery Channel': o.isMinutesDelivery ? '⚡ 10-15 Min Kivo Minutes' : '📦 Standard Courier',
        'Fulfillment Status': o.status,
        'Items Ordered': itemSummaries,
        'Items Count': myItems.length,
        'Store Subtotal (₹)': o.subtotal,
        'Total Order (₹)': o.total,
        'Payment Method': o.paymentMethod,
        'Payment Status': o.paymentStatus,
        'Delivery Destination': `${parsedAddr.city || ''}, ${parsedAddr.state || ''} ${parsedAddr.postalCode || ''}`.trim(),
      };
    });

    exportToExcel(data, 'Kivo_Seller_Orders_Report', 'Seller Orders');
  };

  const handleUpdateItemStatus = async (itemId, nextStatus) => {
    setUpdatingItemId(itemId);
    try {
      await sellerService.updateOrderItemStatus(itemId, nextStatus);
      setToastMessage(`Item updated to ${nextStatus}!`);
      fetchOrders();
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      alert(err.message || 'Failed to update order item status.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')}>&times;</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/seller')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600 transition-colors shadow-2xs group"
              title="Return to Seller Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Overview</span>
            </button>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Customer Orders Received</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-semibold">
              {orders.length} Active {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Track buyer purchases for your merchandise, prepare shipments, and update dispatch milestones in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Orders Excel Button */}
          <button
            onClick={handleExportOrders}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            title="Download all orders as Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Orders (.xlsx)</span>
          </button>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-teal-700 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Cards List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading buyer orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No customer orders matching the "{statusFilter}" filter. When a buyer places an order for your items, it will immediately appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const addr = order.shippingAddress || {};
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400 text-sm">
                      {order.orderNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">
                      {new Date(order.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {order.isMinutesDelivery ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold text-[10px]">
                        <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>⚡ KIVO MINUTES (12-MIN EXPRESS)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                        <Truck className="w-3 h-3" />
                        <span>Standard Dispatch</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">Total for your items:</span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {formatRupee(order.sellerSubtotal)}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Buyer & Delivery Info */}
                  <div className="lg:col-span-1 space-y-3 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>Buyer Details</span>
                    </h3>

                    <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                      <p className="font-bold text-slate-900 dark:text-white">{order.customerName}</p>
                      <p className="flex items-center gap-1.5 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{order.customerEmail}</span>
                      </p>
                      {addr.phone && (
                        <p className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{addr.phone}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1 text-slate-600 dark:text-slate-400">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>Shipping Destination:</span>
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        {addr.street || 'Address on file'}, {addr.city || 'Mumbai'}, {addr.state || 'Maharashtra'} - {addr.postalCode || '400050'}
                      </p>
                    </div>

                    {order.isMinutesDelivery && order.assignedRider && (
                      <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 -mx-4 -mb-4 p-3 rounded-b-2xl">
                        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                          <Bike className="w-3.5 h-3.5 text-amber-500" />
                          <span>Assigned Hyperlocal Electric Rider:</span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                          {order.assignedRider}
                        </p>
                        {order.riderPhone && (
                          <p className="text-[10px] text-slate-500">Contact: {order.riderPhone}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Items Ordered & Milestone Stepper */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
                      <span>Items to Fulfill ({order.items.length})</span>
                    </h3>

                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                              alt={item.productName}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                                {item.productName}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                <span>SKU: {item.productSku || 'KV-SKU'}</span>
                                <span>•</span>
                                <span>{item.quantity} x {formatRupee(item.unitPrice)}</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  = {formatRupee(item.total)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Fulfillment Status & Transition Controls */}
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : item.status === 'DISPATCHED'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : item.status === 'PACKED'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}>
                              {item.status}
                            </span>

                            {/* State Transition Action Buttons */}
                            {item.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateItemStatus(item.id, 'PACKED')}
                                disabled={updatingItemId === item.id}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] transition-colors"
                              >
                                {updatingItemId === item.id ? 'Updating...' : 'Mark Packed'}
                              </button>
                            )}

                            {item.status === 'PACKED' && (
                              <button
                                onClick={() => handleUpdateItemStatus(item.id, 'DISPATCHED')}
                                disabled={updatingItemId === item.id}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] transition-colors"
                              >
                                {updatingItemId === item.id ? 'Updating...' : 'Dispatch'}
                              </button>
                            )}

                            {item.status === 'DISPATCHED' && (
                              <button
                                onClick={() => handleUpdateItemStatus(item.id, 'DELIVERED')}
                                disabled={updatingItemId === item.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] transition-colors"
                              >
                                {updatingItemId === item.id ? 'Updating...' : 'Mark Delivered'}
                              </button>
                            )}

                            {item.status === 'DELIVERED' && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerOrdersPage;
