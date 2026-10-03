import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 py-8 text-xs text-slate-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Assignment Context */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <span className="font-semibold text-slate-300">WeatherPulse</span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span>Task 4: Asynchronous JavaScript & RESTful APIs</span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="text-slate-400">Deadline: 20 October 2026</span>
        </div>

        {/* Right: Open-Meteo Attribution */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Weather data provided by</span>
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 underline font-medium inline-flex items-center gap-0.5"
          >
            Open-Meteo
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};
