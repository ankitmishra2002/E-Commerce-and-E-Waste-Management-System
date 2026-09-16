import React from 'react';

/**
 * PageLoader — full-screen animated loader shown as the Suspense fallback
 * during lazy route chunk downloads. Matches the app's brand palette.
 */
export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-dark-950 transition-colors">
      {/* Animated ring */}
      <div className="relative w-16 h-16">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
        {/* Spinning border */}
        <div className="relative w-16 h-16 rounded-full border-4 border-brand-200 dark:border-brand-900 border-t-brand-600 dark:border-t-brand-400 animate-spin" />
      </div>

      {/* Brand name */}
      <p className="mt-5 heading-display text-xl font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-600 animate-pulse">
        SparkIT
      </p>

      {/* Subtitle */}
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-600 font-medium tracking-wide">
        Loading page…
      </p>
    </div>
  );
}
