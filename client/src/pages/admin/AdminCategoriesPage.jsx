import React, { useState, useEffect } from 'react';
import { Tags, Package } from 'lucide-react';
import { productService } from '../../services/product.service.js';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Product Taxonomies & Categories
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Curate category navigation structures and view product distribution per department.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                  alt={cat.name}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</h3>
                  <span className="font-mono text-[11px] text-slate-400">slug: {cat.slug}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {cat.description || 'Curated departmental collection.'}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Package className="w-3.5 h-3.5 text-teal-600" />
                  <span>{cat.productCount || 0} active products</span>
                </span>
                <span className="text-teal-700 dark:text-teal-400 font-semibold text-[11px]">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
