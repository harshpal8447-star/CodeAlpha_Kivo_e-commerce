import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images || '[]')
    : [];

  const mainImage = images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Link to={`/products/${product.slug || product.id}`}>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
            }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Save ${(product.compareAtPrice - product.price).toFixed(0)}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-teal-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Stock status indicator */}
        <div className="absolute bottom-3 left-3">
          {isOutOfStock ? (
            <span className="bg-slate-900/80 backdrop-blur-sm text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* Quick view button overlay */}
        <Link
          to={`/products/${product.slug || product.id}`}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
          title="View product details"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-teal-700 dark:text-teal-400">
              {product.category?.name || 'Curated'}
            </span>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-xs">{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
              <span className="text-slate-400 text-[10px]">({product.reviewCount || 12})</span>
            </div>
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.slug || product.id}`}
            className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-400 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add to Bag */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-teal-700 dark:bg-slate-700 dark:hover:bg-teal-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={isOutOfStock ? 'Product out of stock' : 'Add to cart'}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isOutOfStock ? 'Sold Out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
