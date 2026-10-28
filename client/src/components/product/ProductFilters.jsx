import React from 'react';
import { Filter, RotateCcw, Check, Zap } from 'lucide-react';

export const ProductFilters = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onPriceChange,
  inStockOnly,
  onToggleInStock,
  minutesOnly,
  onToggleMinutes,
  sortBy,
  onSortChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Filter className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <span>Filter Products</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-slate-500 hover:text-teal-700 dark:hover:text-teal-400 flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Kivo Minutes Instant Dispatch Filter */}
      <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-1">
        <label className="flex items-center justify-between cursor-pointer text-xs font-bold text-slate-900 dark:text-white select-none">
          <span className="flex items-center gap-1.5 text-amber-950 dark:text-amber-300">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-600" />
            <span>Kivo Minutes Only</span>
          </span>
          <input
            type="checkbox"
            checked={Boolean(minutesOnly)}
            onChange={(e) => onToggleMinutes && onToggleMinutes(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-amber-400"
          />
        </label>
        <p className="text-[10px] text-amber-800/90 dark:text-amber-400/90 leading-tight">
          ⚡ 10–15 min instant delivery from local dark stores
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Category
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
              !selectedCategory
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>All Categories</span>
            {!selectedCategory && <Check className="w-3.5 h-3.5" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>{cat.name}</span>
              {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400">Min (₹)</span>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onPriceChange('min', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-600"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Max (₹)</span>
            <input
              type="number"
              placeholder="50000"
              value={maxPrice}
              onChange={(e) => onPriceChange('max', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>
      </div>

      {/* Stock Availability */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Availability
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 dark:bg-slate-900"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Sort Results
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-teal-600"
        >
          <option value="featured">Featured & Best Matches</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">New Arrivals</option>
          <option value="name-asc">Alphabetical: A - Z</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;
