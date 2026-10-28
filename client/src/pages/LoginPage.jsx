import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, User, Store, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // If user is already authenticated as ADMIN or SELLER, auto-redirect directly to their dashboard
  React.useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'SELLER') {
        navigate('/seller', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      const loggedUser = response?.user || response;
      const role = loggedUser?.role;

      // Super Admin and Sellers directly land on their performance & revenue dashboards
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
        return;
      }
      if (role === 'SELLER') {
        navigate('/seller', { replace: true });
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white font-sans">
            kivo<span className="text-teal-600">.</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-xs text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
            create a new customer profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Pre-fills */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Demo Evaluation
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Instant Pre-fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('sarah.mitchell@example.com', 'Customer123!')}
                className="flex items-center justify-start gap-1.5 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-semibold transition-colors"
                title="Customer (Sarah Mitchell)"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">🛍️ Sarah (Buyer)</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('seller@kivo.com', 'SellerPassword123!')}
                className="flex items-center justify-start gap-1.5 p-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] font-semibold transition-colors"
                title="Seller 1: Apex Retail & Tech Pvt Ltd"
              >
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate">🏪 Apex Tech (Seller)</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('artisan@kivo.com', 'SellerPassword123!')}
                className="flex items-center justify-start gap-1.5 p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-[11px] font-semibold transition-colors"
                title="Seller 2: Aura Living & Artisanal Studio"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate">🎨 Aura Living (Seller)</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials('admin@kivo.com', 'AdminPassword123!')}
                className="flex items-center justify-start gap-1.5 p-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-[11px] font-semibold transition-colors"
                title="Super Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span className="truncate">👑 Super Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
