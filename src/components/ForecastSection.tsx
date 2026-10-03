import React from 'react';
import { DailyForecastItem } from '../types/weather';
import { formatTemperature } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { Calendar } from 'lucide-react';

interface ForecastSectionProps {
  forecast: DailyForecastItem[];
  unit: 'C' | 'F';
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({
  forecast,
  unit,
}) => {
  if (!forecast || forecast.length === 0) {
    return null;
  }

  // Calculate global min and max across all 7 days for relative bar scaling
  const globalMin = Math.min(...forecast.map((f) => f.tempMin));
  const globalMax = Math.max(...forecast.map((f) => f.tempMax));
  const tempRange = Math.max(1, globalMax - globalMin);

  return (
    <div id="forecast" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            7-Day Meteorological Forecast
          </h2>
        </div>
        <span className="text-xs text-slate-400">Open-Meteo Daily Model</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecast.map((day, idx) => {
          // Calculate percentage for temperature bar
          const leftPercent = ((day.tempMin - globalMin) / tempRange) * 100;
          const widthPercent = Math.max(10, ((day.tempMax - day.tempMin) / tempRange) * 100);

          return (
            <div
              key={day.date}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 shadow-sm ${
                idx === 0
                  ? 'bg-slate-900/95 border-sky-500/40 ring-1 ring-sky-500/20 shadow-md'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Day header */}
              <div className="flex flex-col items-start gap-0.5">
                <span className={`text-sm font-bold ${idx === 0 ? 'text-sky-300' : 'text-slate-100'}`}>
                  {day.dayName}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {day.formattedDate}
                </span>
              </div>

              {/* Weather icon & condition */}
              <div className="flex flex-col items-start gap-2 my-1">
                <div className="p-2 rounded-lg bg-slate-800/70 border border-slate-700/50">
                  <WeatherIcon
                    iconName={day.condition.iconName}
                    category={day.condition.category}
                    className="w-7 h-7"
                  />
                </div>
                <div
                  className="text-xs font-semibold text-slate-200 line-clamp-1"
                  title={day.condition.label}
                >
                  {day.condition.label}
                </div>
              </div>

              {/* Min & Max temperatures */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80 w-full">
                <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-400 font-medium">
                    {formatTemperature(day.tempMin, unit)}
                  </span>
                  <span className="text-white font-bold">
                    {formatTemperature(day.tempMax, unit)}
                  </span>
                </div>

                {/* Relative thermal bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
