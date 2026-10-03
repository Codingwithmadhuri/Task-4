import React, { useState } from 'react';
import { Search, Loader2, X, MapPin, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { GeocodingResult, RegionScope } from '../types/weather';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onQuickCitySearch?: (city: string) => void;
  isLoading: boolean;
  alternativeMatches?: GeocodingResult[];
  onSelectAlternative?: (location: GeocodingResult) => void;
  onDismissAlternatives?: () => void;
  requiresSelection?: boolean;
  searchQuery?: string;
  currentCity?: string;
  regionScope: RegionScope;
  onChangeRegionScope?: (scope: RegionScope) => void;
}

// Section 4 requirement: Quick-access city chips for Pune, Mumbai, Delhi, Bengaluru, Chennai, and Hyderabad.
const INDIAN_PRIMARY_CITIES = [
  'Pune',
  'Mumbai',
  'New Delhi',
  'Bengaluru',
  'Chennai',
  'Hyderabad',
];

// Additional popular Indian hubs
const INDIAN_EXTENDED_CITIES = [
  'Kolkata',
  'Ahmedabad',
  'Nagpur',
  'Nashik',
  'Jaipur',
  'Lucknow',
  'Bhopal',
  'Indore',
  'Surat',
  'Patna',
  'Kochi',
  'Guwahati',
  'Srinagar',
  'Chandigarh',
];

const GLOBAL_POPULAR_CITIES = [
  'London',
  'Tokyo',
  'New York',
  'Paris',
  'Sydney',
  'Cairo',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onQuickCitySearch,
  isLoading,
  alternativeMatches,
  onSelectAlternative,
  onDismissAlternatives,
  requiresSelection = false,
  searchQuery = '',
  currentCity,
  regionScope,
  onChangeRegionScope,
}) => {
  const [query, setQuery] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [showMoreIndianCities, setShowMoreIndianCities] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      setInputError('Please enter a city name before searching.');
      return;
    }

    setInputError(null);
    onSearch(trimmed);
  };

  const handleClear = () => {
    setQuery('');
    setInputError(null);
    if (onDismissAlternatives) onDismissAlternatives();
  };

  const handleQuickCityClick = (city: string) => {
    setQuery(city);
    setInputError(null);
    if (onDismissAlternatives) onDismissAlternatives();
    if (onQuickCitySearch) {
      onQuickCitySearch(city);
    } else {
      onSearch(city);
    }
  };

  const isIndiaMode = regionScope === 'india';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3.5">
      {/* Scope Indicator & Mode Switcher Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            {isIndiaMode ? (
              <>
                <span className="text-base leading-none">🇮🇳</span>
                <span className="text-amber-400 font-bold">India Meteorological Search</span>
                <span className="text-xs text-slate-400">· Filtered to country_code === "IN"</span>
              </>
            ) : (
              <>
                <span className="text-sky-400 font-bold">🌐 Global Meteorological Search</span>
                <span className="text-xs text-slate-400">· Worldwide coverage</span>
              </>
            )}
          </span>
        </div>

        {onChangeRegionScope && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline">Switch scope:</span>
            <button
              type="button"
              onClick={() => {
                if (onDismissAlternatives) onDismissAlternatives();
                onChangeRegionScope(isIndiaMode ? 'global' : 'india');
              }}
              className="text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
            >
              {isIndiaMode ? 'Switch to Global Mode' : 'Switch to India Mode'}
            </button>
          </div>
        )}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <label htmlFor="city-search-input" className="sr-only">
            {isIndiaMode ? 'Search an Indian city' : 'Search any city worldwide'}
          </label>
          <div className="absolute left-4 pointer-events-none text-slate-400">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          <input
            id="city-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (inputError) setInputError(null);
            }}
            placeholder={
              isIndiaMode
                ? 'Search an Indian city (e.g., Pune, Mumbai, New Delhi, Bengaluru)...'
                : 'Search any city worldwide (e.g., Tokyo, London, Paris)...'
            }
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
            className="w-full pl-11 pr-28 py-3.5 bg-slate-900/90 text-white placeholder-slate-400 text-sm md:text-base rounded-xl border border-slate-700/80 hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-black/20"
          />

          {/* Clear button if text entered */}
          {query.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-24 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear input"
              aria-label="Clear city input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-semibold text-sm rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Fetching...</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>

        {/* Local Validation Error */}
        {inputError && (
          <p
            id="search-input-error"
            role="alert"
            className="mt-1.5 text-xs text-rose-400 pl-1 font-medium"
          >
            {inputError}
          </p>
        )}
      </form>

      {/* Disambiguation: Multiple Locations Matching Selection (Requirements 4, 5, 7) */}
      {alternativeMatches && alternativeMatches.length > 0 && onSelectAlternative && (
        <div className="bg-slate-900/95 border border-sky-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>
                  {requiresSelection
                    ? `Multiple Locations Found for "${searchQuery || 'Search'}"`
                    : 'Locations matching your search'}
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Please select your intended city and state to load live weather observations:
              </p>
            </div>
            {onDismissAlternatives && (
              <button
                type="button"
                onClick={onDismissAlternatives}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Dismiss location list"
                aria-label="Dismiss location options"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {alternativeMatches.map((match, idx) => (
              <button
                key={`${match.id || idx}-${match.latitude}-${match.longitude}`}
                type="button"
                onClick={() => onSelectAlternative(match)}
                className="text-left p-3 rounded-lg bg-slate-950/80 hover:bg-sky-500/15 border border-slate-800 hover:border-sky-500/50 transition-all text-xs group cursor-pointer flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="space-y-1 min-w-0">
                  <div className="font-bold text-slate-100 group-hover:text-sky-300 text-sm flex items-center gap-1.5 truncate">
                    <span>{match.name}</span>
                    {match.admin1 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800/80 text-sky-300 font-medium border border-slate-700/60 truncate">
                        {match.admin1}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-xs truncate">
                    <span>{match.country || 'Unknown country'}</span>
                    {match.country_code ? ` (${match.country_code})` : ''} ·{' '}
                    <span className="font-mono tabular-nums">
                      {match.latitude.toFixed(2)}°N, {match.longitude.toFixed(2)}°E
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-slate-500 group-hover:text-sky-400 font-semibold text-xs flex items-center gap-1">
                  <span className="hidden sm:inline">Select</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access City Chips */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="font-medium text-slate-300 mr-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            {isIndiaMode ? 'Quick Access (India):' : 'Suggested (Global):'}
          </span>

          {(isIndiaMode ? INDIAN_PRIMARY_CITIES : GLOBAL_POPULAR_CITIES).map((city) => {
            const isSelected =
              currentCity?.toLowerCase() === city.toLowerCase() ||
              (city === 'New Delhi' && currentCity?.toLowerCase() === 'delhi') ||
              (city === 'Delhi' && currentCity?.toLowerCase() === 'new delhi');

            return (
              <button
                key={city}
                type="button"
                onClick={() => handleQuickCityClick(city)}
                disabled={isLoading}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? isIndiaMode
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 font-semibold shadow-sm'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                } disabled:opacity-50`}
              >
                {city}
              </button>
            );
          })}

          {isIndiaMode && (
            <button
              type="button"
              onClick={() => setShowMoreIndianCities((prev) => !prev)}
              className="px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{showMoreIndianCities ? 'Fewer' : 'More Indian Cities'}</span>
              {showMoreIndianCities ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Extended Indian Cities Drawer */}
        {isIndiaMode && showMoreIndianCities && (
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs">
            <span className="text-xs font-semibold text-slate-300 w-full mb-0.5">
              Additional Popular Indian Hubs:
            </span>
            {INDIAN_EXTENDED_CITIES.map((city) => {
              const isSelected = currentCity?.toLowerCase() === city.toLowerCase();
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleQuickCityClick(city)}
                  disabled={isLoading}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  } disabled:opacity-50`}
                >
                  {city}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
