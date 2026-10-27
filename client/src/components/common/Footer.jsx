import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw, HeartHandshake } from 'lucide-react';

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Trust Pillars Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Complimentary Shipping</h4>
              <p className="text-xs text-slate-400 mt-0.5">On all orders exceeding $50 across standard delivery zones.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">End-to-End Security</h4>
              <p className="text-xs text-slate-400 mt-0.5">256-bit encrypted transactions and zero plaintext secret storage.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">30-Day Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Uncomplicated, prepaid return labels for full store credit or refund.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-teal-400 flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Mindful Craftsmanship</h4>
              <p className="text-xs text-slate-400 mt-0.5">Curated from independent artisans and responsible manufacturers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Directory Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                kivo<span className="text-teal-400">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Kivo curates purposeful objects for thoughtful living. From acoustic precision to timeless home ceramics, every item is chosen for enduring utility and clean Scandinavian restraint.
            </p>
            <div className="pt-2">
              <span className="inline-block text-xs bg-slate-800 text-teal-300 font-medium px-3 py-1 rounded-full border border-slate-700">
                &bull; Built with React, Express & Prisma
              </span>
            </div>
          </div>

          {/* Directory: Explore */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=audio-tech" className="hover:text-white transition-colors">Audio & Tech</Link></li>
              <li><Link to="/products?category=home-living" className="hover:text-white transition-colors">Home & Living</Link></li>
              <li><Link to="/products?category=apparel" className="hover:text-white transition-colors">Apparel & Knitwear</Link></li>
              <li><Link to="/products?category=bags-carry" className="hover:text-white transition-colors">Bags & Luggage</Link></li>
            </ul>
          </div>

          {/* Directory: Account & Help */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Assistance</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/account/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">Account Settings</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Bag</Link></li>
              <li><span className="text-slate-500 cursor-not-allowed">Shipping Policy</span></li>
              <li><span className="text-slate-500 cursor-not-allowed">Privacy & Terms</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">The Kivo Dispatch</h4>
            <p className="text-xs text-slate-400 mb-3">
              Receive concise product drops, artisanal studio interviews, and seasonal edits. No spam.
            </p>
            {subscribed ? (
              <div className="p-3 bg-teal-900/50 border border-teal-700 rounded-xl text-teal-200 text-xs">
                ✓ Thank you. You have been enrolled in our seasonal dispatch.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-slate-800 text-xs rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-white transition-colors"
                    title="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Unsubscribe anytime with 1-click.</p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Kivo Goods Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Production Grade E-Commerce Demo</span>
            <span>&bull;</span>
            <span>Portland &bull; London &bull; Tokyo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
