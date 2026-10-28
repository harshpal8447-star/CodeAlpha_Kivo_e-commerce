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
  Zap,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { orderService } from '../services/order.service.js';
import { authService } from '../services/auth.service.js';
import { formatINR } from '../utils/currency.js';
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
    country: 'India',
    phone: '',
  });

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState('DEMO_PAYMENT');
  const [paymentSimulation, setPaymentSimulation] = useState('SUCCESS'); // 'SUCCESS' or 'FAILED'
  const [isMinutesDelivery, setIsMinutesDelivery] = useState(
    location.search.includes('speed=minutes') || false
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Cart item quick-delivery eligibility analysis
  const minutesEligibleCount = cart.items.filter((i) => i.isMinutesEligible).length;
  const standardOnlyCount = cart.items.length - minutesEligibleCount;
  const hasMinutesEligibleItems = minutesEligibleCount > 0;

  // Auto-switch to standard shipping if bag has zero minutes-eligible items
  useEffect(() => {
    if (!hasMinutesEligibleItems && isMinutesDelivery) {
      setIsMinutesDelivery(false);
    }
  }, [hasMinutesEligibleItems, isMinutesDelivery]);

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
        isMinutesDelivery,
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
  // Standard normal delivery is ₹40.00 (FREE on orders >= ₹499 like Amazon/Flipkart)
  // Premium 15-Minute Kivo Minutes delivery is ₹69.00 (FREE on orders >= ₹999)
  const shippingFee = isMinutesDelivery
    ? (discountedSubtotal >= 999 ? 0 : 69)
    : (discountedSubtotal >= 499 ? 0 : 40);
  const tax = parseFloat((discountedSubtotal * 0.18).toFixed(2));
  const grandTotal = parseFloat((discountedSubtotal + shippingFee + tax).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-2xs group"
          title="Return to Shopping Bag"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Bag</span>
        </button>
        <Breadcrumbs items={[{ label: 'Shopping Bag', path: '/cart' }, { label: 'Secure Checkout' }]} />
      </div>

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
                    placeholder="Flat 402, Lotus Residency, Powai"
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
                    placeholder="Mumbai"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={shippingForm.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    PIN / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    name="postalCode"
                    value={shippingForm.postalCode}
                    onChange={handleInputChange}
                    placeholder="400076"
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

          {/* Step 2: Delivery Speed Option */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>2. Delivery Speed</span>
              </h2>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 fill-amber-500" />
                <span>Minutes Hub Active</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: Standard Normal Delivery */}
              <div
                onClick={() => setIsMinutesDelivery(false)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  !isMinutesDelivery
                    ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-teal-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                    <Truck className="w-4 h-4 text-teal-600" />
                    <span>Standard Courier Delivery</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    2–4 Days
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Reliable ground and air delivery via Blue Dart & Delhivery courier networks.
                </p>
                <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Standard Fee:</span>
                  <span className="text-teal-700 dark:text-teal-400 font-extrabold">
                    {discountedSubtotal >= 499 ? 'FREE (Orders > ₹499)' : '₹40.00'}
                  </span>
                </div>
              </div>

              {/* Option 2: ⚡ Kivo Minutes Hyperlocal (Available ONLY for eligible items) */}
              <div
                onClick={() => {
                  if (hasMinutesEligibleItems) setIsMinutesDelivery(true);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  !hasMinutesEligibleItems
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                    : isMinutesDelivery
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 shadow-sm cursor-pointer'
                    : 'border-slate-200 dark:border-slate-700 hover:border-amber-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-black text-xs text-slate-950 dark:text-amber-300">
                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>⚡ Kivo Minutes Express</span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">
                    10–15 Mins
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {hasMinutesEligibleItems
                    ? 'Instant micro-warehouse dispatch via dedicated electric scooter fleet.'
                    : 'Unavailable: No items in your bag qualify for 10-15 minute delivery.'}
                </p>
                <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Express Fee:</span>
                  <span className="text-amber-700 dark:text-amber-400 font-extrabold">
                    {!hasMinutesEligibleItems
                      ? 'N/A'
                      : discountedSubtotal >= 999
                      ? 'FREE (Orders > ₹999)'
                      : '₹69.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Bag Notice if mixed */}
            {hasMinutesEligibleItems && standardOnlyCount > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Split Fulfillment Note:</strong> {minutesEligibleCount} item(s) are eligible for 10-15 minute dark-store dispatch. {standardOnlyCount} other item(s) can only be delivered via Standard Shipping (2-4 days) as they are standard marketplace products.
                </span>
              </div>
            )}

            {!hasMinutesEligibleItems && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  All items in your current bag are standard marketplace products and will be delivered via Standard Courier (₹40 / Free over ₹499). To order items in 10-15 minutes, browse the <strong>Kivo Minutes</strong> section.
                </span>
              </div>
            )}
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>3. Payment Provider</span>
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
                      UPI, NetBanking & Cards (Razorpay / Instant Simulator)
                    </span>
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Instant sandbox transaction simulator supporting UPI, RuPay, debit/credit cards, and net banking.
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
                      Cash on Delivery / UPI at Handover
                    </span>
                    <Banknote className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Order confirmed immediately. Balance settled in cash or via QR scan upon parcel inspection.
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

            {/* Compact items list with Delivery Eligibility */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between text-xs gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                      alt={item.name}
                      className="w-11 h-11 object-cover rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[190px]">
                        {item.name}
                      </span>
                      <div className="text-[11px] text-slate-400">
                        Qty: {item.quantity} × {formatINR(item.price)}
                      </div>
                      <div>
                        {item.isMinutesEligible ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                            <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span>⚡ 10–15 Min Delivery Eligible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                            <Truck className="w-2.5 h-2.5" />
                            <span>Standard Shipping (2–4 Days)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white shrink-0">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown & Delivery Bill */}
            <div className="space-y-2 text-xs sm:text-sm pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatINR(cart.subtotal)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-teal-700 dark:text-teal-400 font-semibold">
                  <span>Discount ({passedPromo})</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span className="flex items-center gap-1">
                  <span>Delivery & Handling</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                    {isMinutesDelivery ? '⚡ 15-Min Express' : 'Standard Delivery'}
                  </span>
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {shippingFee === 0 ? 'Complimentary' : formatINR(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>
                  {isMinutesDelivery
                    ? '⚡ Kivo Minutes Instant Rider Dispatch (Free > ₹999)'
                    : '📦 Standard Blue Dart Courier (Free > ₹499)'}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Estimated GST (18%)</span>
                <span>{formatINR(tax)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-700">
                <span>Total Bill Amount</span>
                <span className="text-teal-700 dark:text-teal-400 font-extrabold">
                  {formatINR(grandTotal)}
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
                  <span>Place Order ({formatINR(grandTotal)})</span>
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
