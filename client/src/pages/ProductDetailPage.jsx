import React, { useState, useEffect } from 'react';
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
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProduct(identifier);
        setProduct(data.product);
        setRelated(data.related || []);
        if (data.product.images && data.product.images.length > 0) {
          setSelectedImage(data.product.images[0]);
        }
        setQuantity(1);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [identifier]);

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

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleBuyNow = () => {
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
        reviews: [newReview, ...(prev.reviews || [])],
        reviewCount: (prev.reviewCount || 0) + 1,
      }));

      setReviewSuccess(true);
      setReviewComment('');
      setReviewTitle('');
    } catch (err) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Shop', path: '/products' },
    { label: product.category?.name || 'Category', path: `/products?category=${product.category?.slug}` },
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
              src={selectedImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
              }}
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Save ${(product.compareAtPrice - product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === img
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
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {product.rating ? product.rating.toFixed(1) : '4.8'}
              </span>
              <span className="text-xs text-slate-400">({product.reviewCount || 0} reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatINR(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-base text-slate-400 line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
            <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold ml-auto">
              In Stock & Ready to Dispatch
            </span>
          </div>

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

      {/* Customer Reviews Section */}
      <section className="pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Customer Reviews ({product.reviews?.length || 0})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authentic feedback from verified product owners.
            </p>
          </div>
        </div>

        {/* Write a review form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 space-y-4 max-w-2xl">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>Share your experience with this item</span>
          </h3>

          {reviewSuccess && (
            <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-teal-800 dark:text-teal-300 text-xs font-medium">
              ✓ Thank you! Your review has been submitted and added to this product.
            </div>
          )}

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setReviewRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          num <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    {reviewRating} out of 5 stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Headline (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exceptional sound and comfort"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Review
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Share details regarding build quality, tactile feel, and daily utility..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-40"
              >
                {reviewSubmitting ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </form>
          ) : (
            <div className="text-xs text-slate-500">
              Please{' '}
              <Link to="/login" className="text-teal-700 dark:text-teal-400 font-semibold underline">
                sign in to your Kivo account
              </Link>{' '}
              to submit a review.
            </div>
          )}
        </div>

        {/* Existing reviews list */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                      {rev.user?.name ? rev.user.name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {rev.user?.name || 'Verified Owner'}
                      </span>
                      {rev.verifiedPurchase && (
                        <span className="ml-2 text-[10px] text-teal-700 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.title && (
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white pt-1">
                    {rev.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No customer reviews yet. Be the first to share your thoughts!</p>
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
