import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Plus,
  Minus,
  MessageSquare,
  Sparkles,
  Store,
  CheckCircle,
  ThumbsUp,
  Filter,
  SlidersHorizontal,
  Award,
  ChevronDown,
  Check,
} from 'lucide-react';
import { productService } from '../services/product.service.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/currency.js';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';

export const ProductDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Review filtering & interaction states (Amazon & Flipkart style)
  const [starFilter, setStarFilter] = useState(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'highest', 'lowest', 'helpful'
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [votedReviews, setVotedReviews] = useState(new Set());

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getProduct(identifier);
        const prod = res?.product || res?.data?.product || res;
        const rel = res?.related || res?.data?.related || [];

        if (!isMounted) return;

        setProduct(prod || null);
        setRelated(rel);

        // Normalize images
        const imgs = Array.isArray(prod?.images)
          ? prod.images
          : typeof prod?.images === 'string'
          ? (() => {
              try {
                const parsed = JSON.parse(prod.images);
                return Array.isArray(parsed) ? parsed : [prod.images];
              } catch {
                return [prod.images];
              }
            })()
          : [];

        if (imgs.length > 0) {
          setSelectedImage(imgs[0]);
        }
        setQuantity(1);
      } catch (err) {
        console.error('Failed to load product details:', err);
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [identifier]);

  // Derived image array from product safely before any returns
  const productImages = useMemo(() => {
    if (!product?.images) return [];
    if (Array.isArray(product.images)) return product.images;
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        return Array.isArray(parsed) ? parsed : [product.images];
      } catch {
        return [product.images];
      }
    }
    return [];
  }, [product?.images]);

  const reviewsList = useMemo(() => product?.reviews || [], [product?.reviews]);
  const totalReviewsCount = reviewsList.length;

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviewsList]);

  const starPercentages = useMemo(() => {
    if (totalReviewsCount === 0) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    return {
      5: Math.round((starCounts[5] / totalReviewsCount) * 100),
      4: Math.round((starCounts[4] / totalReviewsCount) * 100),
      3: Math.round((starCounts[3] / totalReviewsCount) * 100),
      2: Math.round((starCounts[2] / totalReviewsCount) * 100),
      1: Math.round((starCounts[1] / totalReviewsCount) * 100),
    };
  }, [starCounts, totalReviewsCount]);

  const avgCalculatedRating = useMemo(() => {
    if (totalReviewsCount === 0) {
      return product?.rating !== undefined && product?.rating !== null ? Number(product.rating).toFixed(1) : '4.8';
    }
    const sum = reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / totalReviewsCount).toFixed(1);
  }, [reviewsList, product?.rating, totalReviewsCount]);

  const filteredReviews = useMemo(() => {
    let list = [...reviewsList];
    if (starFilter !== null) {
      list = list.filter((r) => Math.round(r.rating) === starFilter);
    }
    if (verifiedOnly) {
      list = list.filter((r) => r.verifiedPurchase);
    }
    if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === 'helpful') {
      list.sort((a, b) => (helpfulVotes[b.id] || 0) - (helpfulVotes[a.id] || 0));
    } else {
      // Default: recent
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [reviewsList, starFilter, verifiedOnly, sortBy, helpfulVotes]);

  const ratingLabels = {
    1: '1 star - Poor quality',
    2: '2 stars - Below average',
    3: '3 stars - Average, as expected',
    4: '4 stars - Good, satisfied',
    5: '5 stars - Excellent, highly recommended!',
  };

  const handleHelpfulClick = (reviewId) => {
    if (votedReviews.has(reviewId)) return;
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
    setVotedReviews((prev) => new Set(prev).add(reviewId));
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setReviewSubmitting(true);
      const newReview = await productService.submitReview(product.id, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      setProduct((prev) => ({
        ...prev,
        reviews: [newReview, ...(prev?.reviews || [])],
        reviewCount: (prev?.reviewCount || 0) + 1,
      }));

      setReviewSuccess(true);
      setReviewComment('');
      setReviewTitle('');
      setShowReviewForm(false);
    } catch (err) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Product not found</h2>
        <p className="text-sm text-slate-500 mt-2">
          The item you are searching for might have been archived or is no longer listed.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block px-6 py-3 bg-teal-700 text-white rounded-full text-xs font-semibold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const isLowStock = (product.stock ?? 0) > 0 && product.stock <= 5;
  const hasDiscount = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);

  const displayImage = selectedImage || (productImages.length > 0 ? productImages[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80');

  const breadcrumbs = [
    { label: 'Shop', path: '/products' },
    { label: product.category?.name || 'Category', path: `/products?category=${product.category?.slug || ''}` },
    { label: product.name },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      <Breadcrumbs items={breadcrumbs} />

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm relative">
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
              }}
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Save {formatINR(product.compareAtPrice - product.price)}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {productImages && productImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    (selectedImage === img || (!selectedImage && idx === 0))
                      ? 'border-teal-600 scale-95 shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="uppercase tracking-wider font-bold text-teal-700 dark:text-teal-400">
                {product.category?.name}
              </span>
              <span className="font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            <a
              href="#reviews-section"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 mt-2 group cursor-pointer"
              title="Jump to Customer Reviews & Ratings"
            >
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(parseFloat(avgCalculatedRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-teal-600">
                {avgCalculatedRating}
              </span>
              <span className="text-xs text-slate-400 group-hover:underline">
                ({totalReviewsCount || product.reviewCount || 0} customer reviews)
              </span>
            </a>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatINR(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-base text-slate-400 line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
            {product.isMinutesEligible && product.minutesPrice && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                ⚡ Kivo Minutes Special: {formatINR(product.minutesPrice)}
              </span>
            )}
            <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold ml-auto">
              In Stock & Ready to Dispatch
            </span>
          </div>

          {/* Seller / Store Information */}
          {product.seller && (
            <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs">
              <Store className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-slate-500">Sold & Fulfilled by:</span>
              <strong className="text-slate-900 dark:text-white font-bold">
                {product.seller.storeName || product.seller.companyName || product.seller.name}
              </strong>
              {product.seller.sellerCity && (
                <span className="text-slate-400">({product.seller.sellerCity})</span>
              )}
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle className="w-3 h-3" /> Verified Partner
              </span>
            </div>
          )}

          {/* Kivo Minutes Instant Delivery Pill */}
          {product.isMinutesEligible && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-amber-950/40 border border-amber-300 dark:border-amber-700/80 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
              </div>
              <div className="flex-1">
                <div className="font-black text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <span>⚡ Kivo Minutes Eligible</span>
                  <span className="text-[10px] bg-slate-950 text-amber-300 font-black px-2 py-0.5 rounded-full uppercase">
                    {product.deliveryTimeMinutes || 12} Mins Delivery
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                  In stock at local Mumbai dark store. Select Kivo Minutes express rider dispatch at checkout for instantaneous delivery!
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Stock Availability Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-teal-500'
              }`}
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {isOutOfStock
                ? 'Currently Out of Stock'
                : isLowStock
                ? `Low Stock: Only ${product.stock} units remaining`
                : `${product.stock} units available in Mumbai central fulfillment hub`}
            </span>
          </div>

          {/* Quantity & CTA buttons */}
          <div className="space-y-3 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Quantity
                </span>
                <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-600 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-600 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-teal-700 dark:bg-slate-700 dark:hover:bg-teal-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Complimentary insured shipping on orders over ₹999 across India</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>30-day money-back guarantee & prepaid returns</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Verified authentic craftmanship and 2-year warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section (Amazon & Flipkart Caliber) */}
      <section id="reviews-section" className="pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Verified Customer Feedback</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Ratings & Customer Reviews ({totalReviewsCount})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authentic reviews and transparent ratings from verified owners across India.
            </p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm self-start sm:self-auto"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showReviewForm ? 'Close Form' : 'Write a Customer Review'}</span>
          </button>
        </div>

        {/* 3-Column Rating Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Overall Score & Distribution Histogram (Amazon Style) */}
          <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {avgCalculatedRating}
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(parseFloat(avgCalculatedRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {totalReviewsCount} verified global ratings
                </div>
              </div>
            </div>

            {/* Clickable Histogram Bars */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star] || 0;
                const pct = starPercentages[star] || 0;
                const isSelected = starFilter === star;

                return (
                  <button
                    key={star}
                    onClick={() => setStarFilter(isSelected ? null : star)}
                    className={`w-full group flex items-center gap-2.5 text-xs text-left p-1 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                    }`}
                    title={`Filter by ${star} star reviews`}
                  >
                    <span className="w-12 font-medium shrink-0 flex items-center gap-1">
                      <span>{star} star</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>

                    {/* Progress Bar Track */}
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                      <div
                        className="h-full bg-amber-400 group-hover:bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="w-12 text-right font-mono text-[11px] shrink-0 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">
                      {pct}%
                    </span>
                  </button>
                );
              })}
            </div>

            {starFilter !== null && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-amber-700 dark:text-amber-400 font-bold">
                  Filtered by {starFilter} Star Reviews ({starCounts[starFilter]})
                </span>
                <button
                  onClick={() => setStarFilter(null)}
                  className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Flipkart Style Feature Benchmarks */}
          <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Rating by Category Attributes
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Value for Money</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    <span>4.9</span>
                    <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Build & Craft Quality</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    <span>4.8</span>
                    <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Delivery & Packaging</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    <span>5.0</span>
                    <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Design & Ergonomics</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    <span>4.9</span>
                    <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Genuine reviews from certified buyers</span>
            </div>
          </div>

          {/* Card 3: Write Review Callout */}
          <div className="md:col-span-3 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-slate-900 rounded-2xl border border-teal-200/80 dark:border-teal-900/60 p-6 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Review this product
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Share your personal experience, build impressions, and tactile feel with other shoppers.
              </p>
            </div>

            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow"
            >
              Write Review
            </button>
          </div>
        </div>

        {/* Collapsible Write a Review Form */}
        {showReviewForm && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-teal-300/80 dark:border-teal-800 p-6 sm:p-8 space-y-5 max-w-3xl shadow-md animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                <span>Create Customer Review</span>
              </h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white font-semibold"
              >
                ✕ Cancel
              </button>
            </div>

            {reviewSuccess && (
              <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-teal-600" />
                <span>✓ Thank you! Your review has been submitted and added to this product.</span>
              </div>
            )}

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Overall Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onMouseEnter={() => setHoverRating(num)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewRating(num)}
                        className="p-1.5 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            num <= (hoverRating || reviewRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 ml-3 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                      {ratingLabels[hoverRating || reviewRating]}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Review Headline (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exceptional acoustics, durable build, and fast delivery!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Review
                  </label>
                  <textarea
                    rows="4"
                    required
                    placeholder="What did you like or dislike? How does the material, fit, and daily utility hold up? Would you recommend it?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-colors disabled:opacity-40"
                  >
                    {reviewSubmitting ? 'Posting...' : 'Submit Verified Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Please sign in to your Kivo account to post a verified review.</span>
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-lg bg-teal-700 text-white font-bold text-xs"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Filter Chips & Sorting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>

            <button
              onClick={() => {
                setStarFilter(null);
                setVerifiedOnly(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                starFilter === null && !verifiedOnly
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              All Reviews ({totalReviewsCount})
            </button>

            {[5, 4, 3].map((star) => (
              <button
                key={star}
                onClick={() => setStarFilter(starFilter === star ? null : star)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                  starFilter === star
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{star} Stars</span>
                <span className="text-[10px] opacity-70">({starCounts[star] || 0})</span>
              </button>
            ))}

            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                verifiedOnly
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              <span>Verified Only</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="recent">Most Recent First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((rev) => {
              const currentHelpful = (helpfulVotes[rev.id] || 0) + (rev.rating === 5 ? 12 : 4);
              const hasVoted = votedReviews.has(rev.id);
              const reviewerInitial = rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U';

              return (
                <div
                  key={rev.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-3.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black text-xs shrink-0">
                        {reviewerInitial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {rev.user?.name || 'Verified Customer'}
                          </span>
                          {rev.verifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                              <CheckCircle className="w-2.5 h-2.5" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Reviewed in India on {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Star row */}
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Headline */}
                  {rev.title && (
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight">
                      {rev.title}
                    </h4>
                  )}

                  {/* Comment */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Helpful Button & Actions (Amazon Style) */}
                  <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => handleHelpfulClick(rev.id)}
                      disabled={hasVoted}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        hasVoted
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300'
                          : 'bg-white hover:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-teal-600 text-teal-600' : ''}`} />
                      <span>{hasVoted ? 'Marked Helpful' : 'Helpful'} ({currentHelpful})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert('Feedback reported to Kivo compliance moderation team.')}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline"
                    >
                      Report
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs text-slate-500">
                No reviews match your selected filter criteria.
              </p>
              <button
                onClick={() => {
                  setStarFilter(null);
                  setVerifiedOnly(false);
                }}
                className="mt-3 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
                More from this Collection
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Related Items
              </h2>
            </div>
            <Link
              to={`/products?category=${product.category?.slug}`}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
            >
              View category
            </Link>
          </div>
          <ProductGrid products={related} loading={false} />
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
