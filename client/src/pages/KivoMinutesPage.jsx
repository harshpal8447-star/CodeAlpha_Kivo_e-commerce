import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Clock,
  Bike,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  MapPin,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { productService } from '../services/product.service.js';
import { useCart } from '../context/CartContext.jsx';
import { formatRupee } from '../utils/currency.js';

const QUICK_CATEGORIES = [
  'All Quick Items',
  'Instant Munchies',
  'Fast Tech & Cables',
  'Beverages & Cold Brew',
  'Daily Care & Grooming',
  'Desk Essentials',
];

export const KivoMinutesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Quick Items');
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, addToCart, updateQuantity, getItemQuantity, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMinutesProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          minutes: true,
          limit: 50,
        });
        const items = res.products || res.data?.products || [];
        setProducts(items);
      } catch (err) {
        console.error('Failed to load Kivo Minutes products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMinutesProducts();
  }, []);

  // Filter products by selected quick category and search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'All Quick Items' ||
      p.minutesCategory === activeCategory ||
      (activeCategory === 'Instant Munchies' && p.category?.slug === 'wellness-scents') ||
      (activeCategory === 'Fast Tech & Cables' && p.category?.slug === 'audio-tech') ||
      (activeCategory === 'Beverages & Cold Brew' && p.name.toLowerCase().includes('coffee')) ||
      (activeCategory === 'Daily Care & Grooming' && (p.category?.slug === 'wellness-scents' || p.category?.slug === 'footwear')) ||
      (activeCategory === 'Desk Essentials' && (p.category?.slug === 'workspace-desk' || p.category?.slug === 'home-living'));

    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const minutesItemsInCart = cart.items.length;
  const minutesCartSubtotal = cart.subtotal;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 pb-28">
      {/* ⚡ Top Hyperlocal Header & Dark Store Banner */}
      <section className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border-b border-emerald-800/40 relative overflow-hidden">
        {/* Glow backdrop decorative effect */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide animate-pulse">
                <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                <span>KIVO MINUTES • LIVE HYPERLOCAL NETWORK</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Ultra-Fast Essentials in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                  10 to 15 Minutes
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Direct from our automated temperature-controlled micro-dark stores to your doorstep.
                Exclusive quick-commerce prices lower than regular delivery.
              </p>

              {/* Delivery Address Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Delivering to: <strong className="text-white">Bandra West, Mumbai (400050)</strong></span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>

            {/* Micro-Dark Store Live Stats Card */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 border-b border-slate-800 pb-2.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Dark Store Hub #04 Active
                </span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] text-emerald-300">
                  1.2 km away
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-800/60 p-2.5 rounded-xl">
                  <span className="block text-2xl font-black text-amber-400">12 min</span>
                  <span className="text-[11px] text-slate-400 font-medium">Avg. Delivery ETA</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-xl">
                  <span className="block text-2xl font-black text-emerald-400">₹29</span>
                  <span className="text-[11px] text-slate-400 font-medium">Free over ₹499</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Bike className="w-3.5 h-3.5 text-teal-400" />
                <span>100% Electric Scooter Fleet with Insulated Bags</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔍 Search Bar & Quick Categories Carousel */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 10-minute snacks, charging cables, coffee, grooming essentials..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  {category === 'All Quick Items' && <Sparkles className="w-3 h-3 text-amber-300" />}
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📦 Quick-Commerce Product Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{activeCategory}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {filteredProducts.length} Items Available Now
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant micro-warehouse dispatch • Guaranteed within 15 minutes
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-3"
              >
                <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching items currently found in your local dark store
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with another keyword or view all quick items to browse all available 12-minute stock.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All Quick Items');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const qtyInCart = getItemQuantity(product.id);
              const primaryImage = Array.isArray(product.images)
                ? product.images[0]
                : typeof product.images === 'string'
                ? JSON.parse(product.images)[0]
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

              const activePrice = product.minutesPrice || product.price;
              const hasDiscount = product.compareAtPrice || (product.minutesPrice && product.minutesPrice < product.price);
              const originalPrice = product.compareAtPrice || product.price;

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-3 sm:p-4 space-y-3">
                    {/* Image with 10-15 Min Badge */}
                    <div className="relative aspect-square w-full rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* ⚡ Live ETA Badge */}
                      <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        <span>{product.deliveryTimeMinutes || 12} MINS</span>
                      </div>

                      {product.seller?.storeName && (
                        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-slate-200 text-[9px] font-medium px-2 py-0.5 rounded-md truncate max-w-[85%]">
                          {product.seller.storeName}
                        </div>
                      )}
                    </div>

                    {/* Product Name & Description */}
                    <div>
                      <Link
                        to={`/products/${product.slug}`}
                        className="block font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-emerald-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {formatRupee(activePrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatRupee(originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 🛒 High-Speed 1-Click + / - Cart Controls */}
                  <div className="p-3 sm:p-4 pt-0">
                    {qtyInCart === 0 ? (
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-xs tracking-wide transition-all shadow-2xs hover:shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between bg-emerald-600 text-white rounded-xl py-1 px-1.5 shadow-sm">
                        <button
                          onClick={() => updateQuantity(product.id, qtyInCart - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 stroke-[3]" />
                        </button>
                        <span className="font-extrabold text-xs">{qtyInCart} in cart</span>
                        <button
                          onClick={() => updateQuantity(product.id, qtyInCart + 1)}
                          disabled={qtyInCart >= product.stock}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 🚀 Sticky Bottom Quick Checkout Bar */}
      {minutesItemsInCart > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-emerald-500/40 py-3 px-4 sm:px-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-white">
                    {minutesItemsInCart} {minutesItemsInCart === 1 ? 'item' : 'items'} • {formatRupee(minutesCartSubtotal)}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                    ⚡ 12 Mins ETA
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 hidden sm:block">
                  Guaranteed electric rider dispatch to Bandra West, Mumbai
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                View Cart
              </button>

              <button
                onClick={() => navigate('/checkout?speed=minutes')}
                className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
              >
                <span>Quick Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KivoMinutesPage;
