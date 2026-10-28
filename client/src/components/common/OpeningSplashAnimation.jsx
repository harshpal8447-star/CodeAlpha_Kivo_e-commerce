import React, { useState, useEffect } from 'react';
import { Zap, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

export const OpeningSplashAnimation = ({ onFinish }) => {
  const isTest = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test';
  const [progress, setProgress] = useState(isTest ? 100 : 0);
  const [statusText, setStatusText] = useState('Initializing Kivo Network...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFinished, setIsFinished] = useState(isTest);

  useEffect(() => {
    if (isTest) {
      if (onFinish) onFinish();
      return;
    }

    const statusMilestones = [
      { at: 15, text: 'Connecting to Hyperlocal Darkstores...' },
      { at: 45, text: 'Synchronizing Kivo Minutes 15-Min Inventory...' },
      { at: 75, text: 'Loading Curated Marketplace & Verified Sellers...' },
      { at: 95, text: 'Preparing Your Performance Dashboard...' },
      { at: 100, text: 'Welcome to Kivo' },
    ];

    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds total presentation

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      const matched = statusMilestones.find((m) => pct >= m.at && pct < (m.at + 30));
      if (matched) {
        setStatusText(matched.text);
      } else if (pct >= 100) {
        setStatusText('Welcome to Kivo');
      }

      if (pct >= 100) {
        clearInterval(interval);
        // Start smooth fade out
        setTimeout(() => {
          setIsFadingOut(true);
        }, 150);

        // Fully finish and unmount
        setTimeout(() => {
          setIsFinished(true);
          if (onFinish) onFinish();
        }, 800);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isTest, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsFinished(true);
      if (onFinish) onFinish();
    }, 300);
  };

  if (isFinished) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950 text-white select-none transition-all duration-700 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0d3d38 0%, #061e1b 35%, #020617 80%, #000000 100%)',
      }}
    >
      {/* Ambient background glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Skip button in top corner */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 hover:text-white transition-all backdrop-blur-md"
      >
        <span>Skip</span>
        <ArrowRight className="w-3 h-3" />
      </button>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md w-full space-y-6">
        {/* Animated Brand Emblem */}
        <div className="relative flex items-center justify-center">
          {/* Multiple expanding radar rings */}
          <div className="absolute w-28 h-28 rounded-full border border-teal-500/30 animate-ping opacity-60" />
          <div className="absolute w-36 h-36 rounded-full border border-teal-400/20 animate-pulse" />

          {/* Central Logo Box */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 p-0.5 shadow-2xl shadow-teal-500/40">
            <div className="w-full h-full bg-slate-900/90 rounded-[22px] flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
              {/* Inner subtle shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 via-transparent to-white/10" />

              <div className="relative flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-teal-400 stroke-[2.2]" />
                <div className="absolute -top-1 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-full p-1 shadow-md shadow-amber-500/30">
                  <Zap className="w-3 h-3 fill-slate-950 text-slate-950" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Typography & Tagline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[11px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>Fast-Commerce & Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-sans">
            kivo<span className="text-teal-400 drop-shadow-[0_0_12px_rgba(45,212,191,0.6)]">.</span>
          </h1>

          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
            15-Minute Kivo Minutes & Curated Multi-Vendor Marketplace
          </p>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full max-w-xs space-y-2.5 pt-2">
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-75 ease-out shadow-sm shadow-teal-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="truncate pr-2 text-slate-300">{statusText}</span>
            <span className="font-bold text-teal-400 shrink-0">{progress}%</span>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            ⚡ 15-Min Delivery
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            🛍️ 100+ Products
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            ✨ Verified Reviews
          </span>
        </div>
      </div>
    </div>
  );
};

export default OpeningSplashAnimation;
