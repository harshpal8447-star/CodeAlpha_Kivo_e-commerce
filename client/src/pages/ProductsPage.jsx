import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/product.service.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ProductFilters from '../components/product/ProductFilters.jsx';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters from query params or local state
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSort = searchParams.get('sort') || 'featured';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentInStock = searchParams.get('inStock') === 'true';

  // Load Categories once
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        category: currentCategory,
        search: currentSearch,
        sort: currentSort,
        minPrice: currentMinPrice,
        maxPrice: currentMaxPrice,
        inStock: currentInStock ? 'true' : undefined,
      };

      const res = await productService.getProducts(params);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    currentCategory,
    currentSearch,
    currentSort,
    currentMinPrice,
    currentMaxPrice,
    currentInStock,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update query params helper
  const updateQueryParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handlePriceChange = (type, val) => {
    updateQueryParam(type === 'min' ? 'minPrice' : 'maxPrice', val);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Shop', path: '/products' },
    ...(currentCategory
      ? [{ label: categories.find((c) => c.slug === currentCategory)?.name || currentCategory }]
      : []),
    ...(currentSearch ? [{ label: `Search: "${currentSearch}"` }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header with Title and Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.name || 'Category'
              : currentSearch
              ? `Search: "${currentSearch}"`
              : 'All Design Essentials'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {products.length} of {pagination.total} crafted items
          </p>
        </div>

        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <span>Filters & Sort</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-28">
          <ProductFilters
            categories={categories}
            selectedCategory={currentCategory}
            onSelectCategory={(slug) => updateQueryParam('category', slug)}
            minPrice={currentMinPrice}
            maxPrice={currentMaxPrice}
            onPriceChange={handlePriceChange}
            inStockOnly={currentInStock}
            onToggleInStock={(checked) => updateQueryParam('inStock', checked ? 'true' : '')}
            sortBy={currentSort}
            onSortChange={(sort) => updateQueryParam('sort', sort)}
            onResetFilters={handleResetFilters}
          />
        </aside>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Filters</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ProductFilters
                  categories={categories}
                  selectedCategory={currentCategory}
                  onSelectCategory={(slug) => {
                    updateQueryParam('category', slug);
                    setMobileFiltersOpen(false);
                  }}
                  minPrice={currentMinPrice}
                  maxPrice={currentMaxPrice}
                  onPriceChange={handlePriceChange}
                  inStockOnly={currentInStock}
                  onToggleInStock={(checked) => updateQueryParam('inStock', checked ? 'true' : '')}
                  sortBy={currentSort}
                  onSortChange={(sort) => updateQueryParam('sort', sort)}
                  onResetFilters={handleResetFilters}
                />
              </div>

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-6 w-full py-3 bg-teal-700 text-white font-semibold rounded-xl text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <section className="lg:col-span-3 space-y-8">
          <ProductGrid
            products={products}
            loading={loading}
            emptyMessage={
              currentSearch || currentCategory
                ? 'No products matched your exact filter combination. Try adjusting price range or category.'
                : 'No products currently available.'
            }
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200/80 dark:border-slate-800">
              <button
                onClick={() => updateQueryParam('page', currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1 px-2">
                {[...Array(pagination.totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateQueryParam('page', pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-teal-700 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => updateQueryParam('page', currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductsPage;
