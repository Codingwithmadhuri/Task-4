import React from 'react';
import { CurrentWeatherState } from '../types/weather';
import { formatTemperature } from '../utils/weatherCodes';
import {
  Droplets,
  Wind,
  CloudRain,
  Thermometer,
  Compass,
  Gauge,
} from 'lucide-react';

interface WeatherMetricsGridProps {
  weather: CurrentWeatherState;
  unit: 'C' | 'F';
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({
  weather,
  unit,
}) => {
  // Qualitative comfort indicator for humidity
  const getHumidityFeedback = (val: number) => {
    if (val < 30) return 'Dry atmospheric moisture';
    if (val <= 60) return 'Comfortable humidity level';
    if (val <= 80) return 'Humid environment';
    return 'Very high humidity';
  };

  // Qualitative wind speed description
  const getWindDescription = (speedKmh: number) => {
    if (speedKmh < 5) return 'Calm breeze';
    if (speedKmh < 20) return 'Gentle / moderate breeze';
    if (speedKmh < 40) return 'Strong breeze';
    return 'High winds';
  };

  // Qualitative precipitation description
  const getPrecipitationDescription = (precip: number) => {
    if (precip === 0) return 'Zero precipitation recorded';
    if (precip < 2) return 'Trace to light rainfall';
    if (precip < 10) return 'Moderate rainfall';
    return 'Heavy accumulation';
  };

  const metrics = [
    {
      id: 'feels-like',
      label: 'Feels Like',
      value: formatTemperature(weather.apparentTemperature, unit),
      subtext: `Actual: ${formatTemperature(weather.temperature, unit)}`,
      icon: Thermometer,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      id: 'humidity',
      label: 'Relative Humidity',
      value: `${weather.humidity}%`,
      subtext: getHumidityFeedback(weather.humidity),
      icon: Droplets,
      iconColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      id: 'wind',
      label: 'Wind Speed',
      value: `${weather.windSpeed} km/h`,
      subtext: getWindDescription(weather.windSpeed),
      icon: Wind,
      iconColor: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
    },
    {
      id: 'precipitation',
      label: 'Precipitation',
      value: `${weather.precipitation} ${weather.precipitationUnit}`,
      subtext: getPrecipitationDescription(weather.precipitation),
      icon: CloudRain,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      id: 'coordinates',
      label: 'Coordinates',
      value: `${weather.latitude.toFixed(2)}°, ${weather.longitude.toFixed(2)}°`,
      subtext: 'WGS84 Geodetic datum',
      icon: Compass,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      id: 'timezone',
      label: 'Observation Zone',
      value: weather.timezoneAbbr || weather.timezone.split('/').pop() || weather.timezone,
      subtext: weather.timezone,
      icon: Gauge,
      iconColor: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Atmospheric Metrics
        </h2>
        <span className="text-xs text-slate-400">Real-time telemetric readings</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {item.label}
                </span>
                <div className={`p-1.5 rounded-lg ${item.bgColor} ${item.iconColor} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs text-slate-400 truncate mt-1" title={item.subtext}>
                  {item.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
