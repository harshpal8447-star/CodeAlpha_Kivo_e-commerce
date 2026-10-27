import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Home, Search } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-6 shadow-sm">
        <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-2">
        Error 404 &bull; Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-md">
        The destination you seek is unavailable.
      </h1>

      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-3 leading-relaxed">
        The requested URL was not found on this server. It may have moved or no longer exists.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-full shadow-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>

        <Link
          to="/products"
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-full transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Browse All Items</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
