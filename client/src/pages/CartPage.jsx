import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Truck,
  Zap,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../utils/currency.js';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, showToast } = useCart();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    if (promoCode.trim().toUpperCase() === 'KIVO10') {
      const discount = parseFloat((cart.subtotal * 0.1).toFixed(2));
      setPromoDiscount(discount);
      setAppliedPromo('KIVO10');
      showToast('Promo code KIVO10 applied: 10% discount deducted!', 'success');
    } else {
      showToast('Invalid promo code. Try "KIVO10" for 10% off.', 'error');
    }
  };

  const finalSubtotal = Math.max(0, cart.subtotal - promoDiscount);
  // Standard delivery is ₹40, free on orders ₹499 and above (like Amazon / Flipkart)
  const finalShipping = finalSubtotal === 0 || finalSubtotal >= 499 ? 0 : 40;
  const finalTax = parseFloat((finalSubtotal * 0.18).toFixed(2));
  const finalTotal = parseFloat((finalSubtotal + finalShipping + finalTax).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shopping Bag
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {cart.itemCount} items ready for dispatch
          </p>
        </div>

        {cart.items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Bag</span>
          </button>
        )}
      </div>

      {cart.items.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400 mx-auto">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your bag is empty</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Explore our curated catalogue of minimalist headphones, ceramic homeware, and organic apparel.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-full shadow-sm transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
            {cart.items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <Link
                      to={`/products/${item.slug || item.productId}`}
                      className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white sm:hidden">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">SKU: {item.sku || 'KV-ITEM'}</span>
                    <span>•</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formatINR(item.price)} each
                    </span>
                    {item.isMinutesEligible ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                        <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        <span>⚡ 10–15 Min Delivery Eligible</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        <Truck className="w-2.5 h-2.5" />
                        <span>Standard Shipping (2–4 Days)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-teal-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-teal-600 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="hidden sm:inline font-extrabold text-base text-slate-900 dark:text-white min-w-[80px] text-right">
                    {formatINR(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Promo Code Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 space-y-5">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatINR(cart.subtotal)}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-teal-700 dark:text-teal-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Promo ({appliedPromo})
                    </span>
                    <span>-{formatINR(promoDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Estimated Shipping</span>
                  <span>{finalShipping === 0 ? 'Complimentary' : formatINR(finalShipping)}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Estimated GST (18%)</span>
                  <span>{formatINR(finalTax)}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span>Total</span>
                  <span className="text-teal-700 dark:text-teal-400 font-extrabold">
                    {formatINR(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Try 'KIVO10'"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs uppercase focus:outline-none focus:border-teal-600 text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </form>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout', { state: { promoCode: appliedPromo } })}
                className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 px-4 rounded-xl text-sm shadow-sm transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 transition-colors font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Assurance */}
            <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Prices and available inventory are authoritatively validated on checkout.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
