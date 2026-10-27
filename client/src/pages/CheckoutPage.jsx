import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Banknote,
  MapPin,
  Plus,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { orderService } from '../services/order.service.js';
import { authService } from '../services/auth.service.js';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';

export const CheckoutPage = () => {
  const { cart, clearCart, showToast } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const passedPromo = location.state?.promoCode || '';

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  // Address Form
  const [shippingForm, setShippingForm] = useState({
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
  });

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState('DEMO_PAYMENT');
  const [paymentSimulation, setPaymentSimulation] = useState('SUCCESS'); // 'SUCCESS' or 'FAILED'
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load saved addresses for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      authService.getAddresses().then((addrs) => {
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) {
          setSelectedAddressId(def.id);
        } else {
          setUseCustomAddress(true);
        }
      });
    } else {
      setUseCustomAddress(true);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In to Complete Checkout</h2>
        <p className="text-xs text-slate-500">
          An authenticated session is required to link orders and securely preserve delivery history.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            state={{ from: location }}
            className="inline-block w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            Sign In / Register
          </Link>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-2.5 bg-teal-700 text-white text-xs font-semibold rounded-xl"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    let finalAddress = null;
    if (!useCustomAddress && selectedAddressId) {
      const found = savedAddresses.find((a) => a.id === selectedAddressId);
      if (found) {
        finalAddress = {
          fullName: found.fullName,
          street: found.street,
          city: found.city,
          state: found.state,
          postalCode: found.postalCode,
          country: found.country,
          phone: found.phone,
        };
      }
    }

    if (!finalAddress) {
      if (
        !shippingForm.fullName ||
        !shippingForm.street ||
        !shippingForm.city ||
        !shippingForm.state ||
        !shippingForm.postalCode
      ) {
        setErrorMessage('Please fill in all required shipping address fields.');
        return;
      }
      finalAddress = shippingForm;
    }

    try {
      setSubmitting(true);
      const order = await orderService.createOrder({
        shippingAddress: finalAddress,
        paymentMethod,
        paymentSimulation,
        promoCode: passedPromo,
      });

      // Clear local cart
      await clearCart();
      showToast('Order successfully placed!', 'success');
      navigate(`/order-success/${order.id}`, { state: { order } });
    } catch (err) {
      setErrorMessage(
        err.message || 'Payment simulation failed or server-side stock validation prevented order.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const discount = passedPromo === 'KIVO10' ? parseFloat((cart.subtotal * 0.1).toFixed(2)) : 0;
  const discountedSubtotal = Math.max(0, cart.subtotal - discount);
  const shippingFee = discountedSubtotal >= 50 ? 0 : 5.99;
  const tax = parseFloat((discountedSubtotal * 0.08).toFixed(2));
  const grandTotal = parseFloat((discountedSubtotal + shippingFee + tax).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Shopping Bag', path: '/cart' }, { label: 'Secure Checkout' }]} />

      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Lock className="w-6 h-6 text-teal-700 dark:text-teal-400" />
          <span>Secure Checkout</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your items and select shipping preferences. Stock and pricing are verified before completion.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <span className="font-bold">Transaction Notice:</span> {errorMessage}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shipping & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Shipping Address */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>1. Shipping Destination</span>
              </h2>
            </div>

            {/* Saved addresses selector */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select from your saved addresses:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setUseCustomAddress(false);
                      }}
                      className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                        !useCustomAddress && selectedAddressId === addr.id
                          ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/40 text-slate-900 dark:text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-slate-500">{addr.street}</p>
                      <p className="text-slate-500">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setUseCustomAddress(!useCustomAddress)}
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{useCustomAddress ? 'Use saved address instead' : 'Ship to a different address'}</span>
                </button>
              </div>
            )}

            {/* Custom address form inputs */}
            {(useCustomAddress || savedAddresses.length === 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={shippingForm.fullName}
                    onChange={handleInputChange}
                    placeholder="Sarah Mitchell"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Street Address & Apartment *
                  </label>
                  <input
                    type="text"
                    required
                    name="street"
                    value={shippingForm.street}
                    onChange={handleInputChange}
                    placeholder="742 Evergreen Terrace, Suite 4B"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={shippingForm.city}
                    onChange={handleInputChange}
                    placeholder="Portland"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    State / Province *
                  </label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={shippingForm.state}
                    onChange={handleInputChange}
                    placeholder="OR"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    ZIP / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    name="postalCode"
                    value={shippingForm.postalCode}
                    onChange={handleInputChange}
                    placeholder="97201"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingForm.country}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>2. Payment Provider</span>
              </h2>
              <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full">
                Sandbox / Demo Mode
              </span>
            </div>

            <div className="space-y-3">
              {/* Option: Demo Payment Simulator */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'DEMO_PAYMENT'
                    ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="DEMO_PAYMENT"
                  checked={paymentMethod === 'DEMO_PAYMENT'}
                  onChange={() => setPaymentMethod('DEMO_PAYMENT')}
                  className="mt-1 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Kivo Development Payment Simulator
                    </span>
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Instant sandbox transaction simulator for evaluating order creation and stock decrements.
                  </p>

                  {/* Simulator Outcome Chooser */}
                  {paymentMethod === 'DEMO_PAYMENT' && (
                    <div className="mt-3 pt-3 border-t border-teal-100 dark:border-teal-900/60 flex items-center gap-4 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Simulate:</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="simOutcome"
                          checked={paymentSimulation === 'SUCCESS'}
                          onChange={() => setPaymentSimulation('SUCCESS')}
                          className="text-teal-600"
                        />
                        <span className="text-teal-700 dark:text-teal-400 font-semibold">Success</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="simOutcome"
                          checked={paymentSimulation === 'FAILED'}
                          onChange={() => setPaymentSimulation('FAILED')}
                          className="text-rose-600"
                        />
                        <span className="text-rose-600 font-semibold">Simulate Failure (Rollback)</span>
                      </label>
                    </div>
                  )}
                </div>
              </label>

              {/* Option: Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Cash on Delivery (Pay at Handover)
                    </span>
                    <Banknote className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Order confirmed immediately. Balance settled upon parcel inspection at your address.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Submit */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
              Review Bag ({cart.itemCount} items)
            </h3>

            {/* Compact items list */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg bg-slate-100 dark:bg-slate-700"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[180px]">
                        {item.name}
                      </span>
                      <span className="text-slate-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2 text-xs sm:text-sm pt-2 border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ${cart.subtotal.toFixed(2)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-teal-700 dark:text-teal-400 font-semibold">
                  <span>Discount ({passedPromo})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'Complimentary' : `$${shippingFee.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Estimated Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-700">
                <span>Total Due</span>
                <span className="text-teal-700 dark:text-teal-400 font-extrabold">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 px-4 rounded-xl text-sm shadow-md transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Place Order (${grandTotal.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
