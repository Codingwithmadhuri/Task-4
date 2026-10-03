/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { ForecastSection } from './components/ForecastSection';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorMessage } from './components/ErrorMessage';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { Footer } from './components/Footer';
import {
  WeatherDashboardData,
  GeocodingResult,
  RegionScope,
} from './types/weather';
import {
  getCompleteWeatherData,
  WeatherAppError,
} from './services/weatherApi';

export default function App() {
  const [dashboardData, setDashboardData] = useState<WeatherDashboardData | null>(null);
  const [alternativeMatches, setAlternativeMatches] = useState<GeocodingResult[]>([]);
  const [requiresLocationSelection, setRequiresLocationSelection] = useState<boolean>(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | WeatherAppError | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [regionScope, setRegionScope] = useState<RegionScope>('india');
  const [lastSearchedCity, setLastSearchedCity] = useState<string>('Pune');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Race condition protection: Sequence ID and AbortController
  const currentRequestSeq = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Primary asynchronous function to fetch weather data for a city.
   * Employs AbortController and request sequencing to prevent race conditions.
   * Filters by countryCode='IN' when in India mode.
   *
   * @param city City name query
   * @param locationOverride Explicit location selected by the user
   * @param scopeOverride Optional override for region scope
   * @param isDirectQuickCity Whether this was triggered by a quick-access button
   */
  const executeWeatherFetch = useCallback(
    async (
      city: string,
      locationOverride?: GeocodingResult,
      scopeOverride?: RegionScope,
      isDirectQuickCity?: boolean
    ) => {
      // 1. Abort previous in-flight request if pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 2. Setup new AbortController and sequence ticket
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const sequenceId = ++currentRequestSeq.current;

      const activeScope = scopeOverride || regionScope;
      const countryCode = activeScope === 'india' ? 'IN' : undefined;

      setIsLoading(true);
      setError(null);
      if (!locationOverride) {
        setAlternativeMatches([]);
        setRequiresLocationSelection(false);
      }

      try {
        const { dashboardData: resultData, allMatches, requiresSelection } = await getCompleteWeatherData(
          city,
          locationOverride,
          countryCode,
          isDirectQuickCity,
          controller.signal
        );

        // Verify that this response corresponds to the latest search query
        if (sequenceId === currentRequestSeq.current) {
          if (requiresSelection) {
            // Multiple cities matched or no exact match (Requirements 4, 5, 7)
            // Weather data is NOT updated until the user selects their intended city and state.
            setAlternativeMatches(allMatches);
            setRequiresLocationSelection(true);
            setActiveSearchQuery(city);
            setError(null);
          } else if (resultData) {
            // Valid location resolved and forecast succeeded
            setDashboardData(resultData);
            setAlternativeMatches(
              allMatches.length > 1
                ? allMatches.filter((m) => m.id !== resultData.rawGeocodingResult.id)
                : []
            );
            setRequiresLocationSelection(false);
            setLastSearchedCity(resultData.current.city);
            setActiveSearchQuery('');
            setError(null);

            // Update last updated timestamp
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
            const tzSuffix =
              resultData.current.timezone === 'Asia/Kolkata'
                ? 'IST'
                : resultData.current.timezoneAbbr || '';
            setLastUpdatedTime(`${timeStr} ${tzSuffix}`.trim());
          }
        }
      } catch (err: unknown) {
        // If aborted by a newer search request, ignore silently
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        // Only commit error if this is still the active request sequence
        if (sequenceId === currentRequestSeq.current) {
          console.error('[WeatherPulse] Error during weather fetch:', err);
          // Preserve existing dashboardData so the UI doesn't break
          setAlternativeMatches([]);
          setRequiresLocationSelection(false);
          if (err instanceof WeatherAppError) {
            setError(err);
          } else if (err instanceof Error) {
            setError(err);
          } else {
            setError(new WeatherAppError('An unexpected error occurred.', 'UNKNOWN' as any));
          }
        }
      } finally {
        if (sequenceId === currentRequestSeq.current) {
          setIsLoading(false);
        }
      }
    },
    [regionScope]
  );

  // Initial load: Fetch default Indian city "Pune" directly with live India weather
  useEffect(() => {
    executeWeatherFetch('Pune', undefined, 'india', true);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeWeatherFetch]);

  // Standard user search
  const handleSearch = (city: string) => {
    executeWeatherFetch(city);
  };

  // Quick-access button clicked (e.g. Pune, Mumbai, New Delhi) - fetches exact city (Requirement 6)
  const handleQuickCitySearch = (city: string) => {
    executeWeatherFetch(city, undefined, undefined, true);
  };

  // User clicked a specific location option from the disambiguation list (Requirement 5 & 7)
  const handleSelectAlternative = (location: GeocodingResult) => {
    executeWeatherFetch(location.name, location);
  };

  const handleDismissAlternatives = () => {
    setAlternativeMatches([]);
    setRequiresLocationSelection(false);
    setActiveSearchQuery('');
  };

  const handleRefresh = () => {
    if (dashboardData?.rawGeocodingResult) {
      executeWeatherFetch(
        dashboardData.current.city,
        dashboardData.rawGeocodingResult
      );
    } else if (lastSearchedCity) {
      executeWeatherFetch(lastSearchedCity, undefined, undefined, true);
    }
  };

  const handleToggleUnit = () => {
    setUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  const handleRegionScopeChange = (newScope: RegionScope) => {
    setRegionScope(newScope);
    setError(null);
    setAlternativeMatches([]);
    setRequiresLocationSelection(false);
    setActiveSearchQuery('');
    // If switching to India and currently on a non-Indian city, load Pune
    if (newScope === 'india' && dashboardData?.current.country?.toLowerCase() !== 'india') {
      executeWeatherFetch('Pune', undefined, 'india', true);
    }
  };

  // Find today's forecast for high/low display in the current weather card
  const todayForecast = dashboardData?.forecast?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Top Bar Header */}
      <Header
        unit={unit}
        onToggleUnit={handleToggleUnit}
        onOpenInspector={() => setIsInspectorOpen(true)}
        regionScope={regionScope}
        onChangeRegionScope={handleRegionScopeChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12 space-y-8">
        {/* City Search Bar & Disambiguation Selector */}
        <section aria-label="City Weather Search" className="space-y-3">
          <SearchBar
            onSearch={handleSearch}
            onQuickCitySearch={handleQuickCitySearch}
            isLoading={isLoading}
            alternativeMatches={alternativeMatches}
            onSelectAlternative={handleSelectAlternative}
            onDismissAlternatives={handleDismissAlternatives}
            requiresSelection={requiresLocationSelection}
            searchQuery={activeSearchQuery}
            currentCity={dashboardData?.current.city}
            regionScope={regionScope}
            onChangeRegionScope={handleRegionScopeChange}
          />
        </section>

        {/* Error Feedback Area (Feature E & Requirement 8) */}
        {error && (
          <section aria-live="assertive" className="max-w-3xl mx-auto">
            <ErrorMessage
              error={error}
              onRetry={handleRefresh}
              onDismiss={() => setError(null)}
            />
          </section>
        )}

        {/* Dynamic Weather Display Area */}
        {isLoading && !dashboardData ? (
          /* Loading State (Feature D) */
          <LoadingSkeleton />
        ) : dashboardData ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Feature B: Current Weather Summary Card with Full Location Info (Requirement 2) */}
            <CurrentWeatherCard
              weather={dashboardData.current}
              unit={unit}
              todayMaxTemp={todayForecast?.tempMax}
              todayMinTemp={todayForecast?.tempMin}
              lastUpdated={lastUpdatedTime}
              onRefresh={handleRefresh}
              isRefreshing={isLoading}
            />

            {/* Feature B continued: Atmospheric Metrics Grid */}
            <WeatherMetricsGrid
              weather={dashboardData.current}
              unit={unit}
            />

            {/* Feature C: Multi-Day Forecast */}
            <ForecastSection
              forecast={dashboardData.forecast}
              unit={unit}
            />
          </div>
        ) : null}
      </main>

      {/* API Payload & Technical Specs Inspector Modal */}
      <ApiInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        data={dashboardData}
      />

      {/* Footer with Data Attribution to Open-Meteo */}
      <Footer />
    </div>
  );
}
