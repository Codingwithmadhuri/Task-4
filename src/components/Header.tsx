import React from 'react';
import { Activity, Code2, Globe } from 'lucide-react';
import { RegionScope } from '../types/weather';

interface HeaderProps {
  unit: 'C' | 'F';
  onToggleUnit: () => void;
  onOpenInspector: () => void;
  regionScope: RegionScope;
  onChangeRegionScope: (scope: RegionScope) => void;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  onToggleUnit,
  onOpenInspector,
  regionScope,
  onChangeRegionScope,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: WeatherPulse Brand wordmark */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              WeatherPulse
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Current Conditions, 7-Day Forecast) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400" aria-label="Section navigation">
          <a
            href="#current-weather"
            className="hover:text-sky-300 transition-colors"
          >
            Current Conditions
          </a>
          <a
            href="#forecast"
            className="hover:text-sky-300 transition-colors"
          >
            7-Day Forecast
          </a>
        </nav>

        {/* Zone 3: Actions (Location Selector, Temperature Toggle, REST Inspector) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* India / Global Location Selector */}
          <div
            className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold"
            role="group"
            aria-label="Location search mode"
          >
            <button
              type="button"
              onClick={() => onChangeRegionScope('india')}
              className={`px-2 sm:px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                regionScope === 'india'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Search cities in India"
              aria-pressed={regionScope === 'india'}
            >
              <span>🇮🇳</span>
              <span className="hidden sm:inline">India</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeRegionScope('global')}
              className={`px-2 sm:px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                regionScope === 'global'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Search cities worldwide"
              aria-pressed={regionScope === 'global'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Global</span>
            </button>
          </div>

          {/* °C / °F Temperature Toggle */}
          <div
            className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold"
            role="group"
            aria-label="Temperature unit selection"
          >
            <button
              type="button"
              onClick={unit === 'F' ? onToggleUnit : undefined}
              className={`px-2 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                unit === 'C'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-pressed={unit === 'C'}
            >
              °C
            </button>
            <button
              type="button"
              onClick={unit === 'C' ? onToggleUnit : undefined}
              className={`px-2 sm:px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                unit === 'F'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-pressed={unit === 'F'}
            >
              °F
            </button>
          </div>

          {/* REST Inspector Trigger Button */}
          <button
            type="button"
            onClick={onOpenInspector}
            className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer"
            title="Inspect REST API Requests and JSON Payloads"
            aria-label="Open REST API Inspector"
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden md:inline">REST Inspector</span>
          </button>
        </div>
      </div>
    </header>
  );
};
