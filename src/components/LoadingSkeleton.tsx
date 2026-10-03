import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="space-y-6 animate-pulse"
    >
      <span className="sr-only">Fetching real-time weather data...</span>

      {/* Floating status badge */}
      <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-sky-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Executing asynchronous REST fetch to Open-Meteo...</span>
      </div>

      {/* Main Current Weather Card Skeleton */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="w-32 h-4 bg-slate-800 rounded" />
            <div className="w-56 h-10 bg-slate-800 rounded-lg" />
            <div className="w-40 h-4 bg-slate-800/80 rounded" />
            <div className="w-48 h-14 bg-slate-800 rounded-xl" />
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="w-24 h-24 bg-slate-800 rounded-2xl" />
            <div className="w-36 h-4 bg-slate-800 rounded" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/60 flex justify-between">
          <div className="w-64 h-4 bg-slate-800 rounded" />
          <div className="w-20 h-4 bg-slate-800 rounded" />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="w-16 h-3 bg-slate-800 rounded" />
              <div className="w-6 h-6 bg-slate-800 rounded-lg" />
            </div>
            <div className="w-20 h-6 bg-slate-800 rounded" />
            <div className="w-24 h-3 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Forecast Section Skeleton */}
      <div className="space-y-3">
        <div className="w-48 h-4 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
            >
              <div className="w-16 h-4 bg-slate-800 rounded" />
              <div className="w-12 h-12 bg-slate-800 rounded-lg mx-auto" />
              <div className="w-full h-4 bg-slate-800 rounded" />
              <div className="w-full h-1.5 bg-slate-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
