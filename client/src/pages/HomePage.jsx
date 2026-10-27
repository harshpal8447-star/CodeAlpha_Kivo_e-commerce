import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { productService } from '../services/product.service.js';
import ProductGrid from '../components/product/ProductGrid.jsx';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [featured, cats] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getCategories(),
        ]);
        setFeaturedProducts(featured);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-transparent dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-900 py-16 sm:py-24 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The 2026 Curated Collection</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Curated essentials for <span className="text-teal-700 dark:text-teal-400">mindful living</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Kivo sources objects of enduring utility, understated acoustics, and artisanal stoneware. Designed for everyday longevity with transparent origins.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/products"
                  className="px-6 py-3.5 rounded-full bg-slate-900 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/products?category=audio-tech"
                  className="px-6 py-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
                >
                  Audio & Tech
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Free shipping across India over ₹999</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>30-day hassle-free returns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Authoritative stock tracking</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                    alt="Kivo Studio Over-Ear ANC Headphones"
                    className="w-full h-80 sm:h-96 object-cover object-center"
                  />
                  <div className="p-6 bg-white dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                          Featured Drop
                        </span>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                          Kivo Studio ANC Headphones
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Custom beryllium drivers &bull; 42hr battery</p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-lg text-slate-900 dark:text-white">₹24,999</span>
                        <span className="block text-[11px] text-slate-400 line-through">₹29,999</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating pill */}
                <div className="absolute -bottom-4 -left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                    <Star className="w-4 h-4 fill-teal-600 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">4.9 / 5.0 Rating</div>
                    <div className="text-[10px] text-slate-500">Over 1,200 verified reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
              Hand-Picked Selection
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Essentials
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 transition-colors"
          >
            <span>View all products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} loading={loading} />
      </section>

      {/* Category Discovery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
            Browse by Domain
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Curated Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Explore refined craftsmanship across each domain of modern life.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-4 text-center hover:shadow-md transition-all flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-slate-100 dark:bg-slate-700 border border-slate-100 dark:border-slate-700">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {cat.productCount ? `${cat.productCount} items` : 'Explore'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Seasonal Curated Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-block bg-teal-700/80 border border-teal-500/30 text-teal-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Artisanal Studio Spotlight
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Designed for daily touch, built for generations.
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              We collaborate with small-batch workshops that prioritize heavyweight organic textiles, CNC-milled anodized alloys, and zero plastic packaging.
            </p>
            <div className="pt-2">
              <Link
                to="/products?category=home-living"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-xs sm:text-sm hover:bg-teal-50 transition-colors shadow"
              >
                <span>Shop Home & Living</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
