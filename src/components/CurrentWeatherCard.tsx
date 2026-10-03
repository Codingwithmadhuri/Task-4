import React from 'react';
import { CurrentWeatherState } from '../types/weather';
import { formatTemperature, formatObservationTime24 } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { Sun, Moon, Clock, Globe, MapPin, RefreshCw } from 'lucide-react';

interface CurrentWeatherCardProps {
  weather: CurrentWeatherState;
  unit: 'C' | 'F';
  todayMaxTemp?: number;
  todayMinTemp?: number;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  unit,
  todayMaxTemp,
  todayMinTemp,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
}) => {
  // Format local observation time safely using 24-hour clock & returned timezone
  const formattedTime = React.useMemo(() => {
    return formatObservationTime24(
      weather.observationTime,
      weather.timezone,
      weather.timezoneAbbr
    );
  }, [weather.observationTime, weather.timezone, weather.timezoneAbbr]);

  const isIndiaLocation = weather.country?.toLowerCase() === 'india' || weather.countryCode === 'IN';

  return (
    <div
      id="current-weather"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-slate-800 p-6 md:p-8 shadow-xl"
    >
      {/* Background ambient light based on condition & day/night */}
      <div
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
          weather.isDay ? (isIndiaLocation ? 'bg-amber-500' : 'bg-sky-400') : 'bg-indigo-600'
        }`}
      />

      {/* Top Meta Bar: Observations & Refresh Control */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-sky-400 uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5" />
          <span>Current Observations</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 font-mono tabular-nums">
            {weather.latitude.toFixed(2)}°N, {weather.longitude.toFixed(2)}°E
          </span>
          {isIndiaLocation && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span>🇮🇳</span>
                <span>India Station</span>
              </span>
            </>
          )}
        </div>

        {/* Last Updated Timestamp & Manual Refresh Button */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {lastUpdated && (
            <span className="text-slate-400 font-mono text-xs tabular-nums flex items-center gap-1">
              <span>Updated:</span>
              <span className="text-slate-200 font-semibold">{lastUpdated}</span>
            </span>
          )}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/80 transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
              title="Refresh real-time weather readings from Open-Meteo"
              aria-label="Refresh weather data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-sky-400 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Location & Main Temp */}
        <div className="space-y-4">
          {/* Location Title, Admin Region, Country & Coordinates Displayed Together (Requirement 2) */}
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {weather.city}
              </h1>
              {weather.admin1 && (
                <span className="text-lg sm:text-2xl font-semibold text-slate-300">
                  {weather.admin1}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-sm md:text-base text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  {[weather.admin1, weather.country].filter(Boolean).join(', ')}
                  {weather.countryCode ? ` (${weather.countryCode})` : ''}
                </span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-xs text-sky-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700/60 tabular-nums">
                {weather.latitude.toFixed(2)}°N, {weather.longitude.toFixed(2)}°E
              </span>
            </div>
          </div>

          {/* Temperature & Condition Highlight */}
          <div className="flex items-baseline gap-4">
            <span className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-mono tabular-nums">
              {formatTemperature(weather.temperature, unit)}
            </span>
            <div className="space-y-1">
              <div className="text-base sm:text-lg font-semibold text-slate-200">
                {weather.condition.label}
              </div>
              <div className="text-xs text-slate-400">
                Feels like{' '}
                <span className="font-semibold text-slate-200 font-mono tabular-nums">
                  {formatTemperature(weather.apparentTemperature, unit)}
                </span>
              </div>
            </div>
          </div>

          {/* High / Low of today */}
          {todayMaxTemp !== undefined && todayMinTemp !== undefined && (
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <span className="text-rose-400 font-semibold">H:</span>{' '}
                <span className="font-mono tabular-nums text-slate-200 font-medium">
                  {formatTemperature(todayMaxTemp, unit)}
                </span>
              </span>
              <span className="text-slate-600">/</span>
              <span className="flex items-center gap-1">
                <span className="text-sky-400 font-semibold">L:</span>{' '}
                <span className="font-mono tabular-nums text-slate-200 font-medium">
                  {formatTemperature(todayMinTemp, unit)}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Weather Icon & State Badges */}
        <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-4 self-stretch md:self-auto border-t md:border-t-0 border-slate-800/80 pt-4 md:pt-0">
          {/* Main Weather Icon Presentation */}
          <div className="flex items-center justify-center p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-inner">
            <WeatherIcon
              iconName={weather.condition.iconName}
              category={weather.condition.category}
              isDay={weather.isDay}
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>

          {/* Observation Metadata Badges */}
          <div className="flex flex-col md:items-end gap-1.5 text-xs text-slate-400">
            {/* Day / Night State */}
            <div className="flex items-center gap-1.5 font-medium">
              {weather.isDay ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300">Daytime Observation</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="text-slate-300">Nighttime Observation</span>
                </>
              )}
            </div>

            {/* Local 24-Hour Time & Timezone */}
            <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs tabular-nums bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Condition Description Banner */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4 text-xs text-slate-400">
        <p className="italic text-slate-300">
          "{weather.condition.description}"
        </p>
        <span className="font-mono text-xs text-slate-400 tabular-nums shrink-0">
          WMO Code {weather.weatherCode}
        </span>
      </div>
    </div>
  );
};
