import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
} from 'lucide-react';
import { WeatherCategory } from '../types/weather';

interface WeatherIconProps {
  iconName: string;
  category?: WeatherCategory;
  className?: string;
  isDay?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  iconName,
  category,
  className = 'w-6 h-6',
  isDay = true,
}) => {
  // Category-based color accents
  const getCategoryColor = () => {
    switch (category) {
      case 'clear':
        return isDay ? 'text-amber-400' : 'text-indigo-300';
      case 'clouds':
        return isDay ? 'text-sky-300' : 'text-slate-300';
      case 'rain':
      case 'drizzle':
        return 'text-blue-400';
      case 'snow':
        return 'text-cyan-200';
      case 'thunderstorm':
        return 'text-amber-300';
      case 'fog':
        return 'text-teal-300';
      default:
        return 'text-sky-400';
    }
  };

  const colorClass = getCategoryColor();

  switch (iconName) {
    case 'Sun':
      return <Sun className={`${className} ${colorClass}`} aria-hidden="true" />;
    case 'Moon':
      return <Moon className={`${className} ${colorClass}`} aria-hidden="true" />;
    case 'CloudSun':
      return <CloudSun className={`${className} ${colorClass}`} aria-hidden="true" />;
    case 'CloudMoon':
      return <CloudMoon className={`${className} ${colorClass}`} aria-hidden="true" />;
    case 'Cloud':
      return <Cloud className={`${className} ${colorClass}`} aria-hidden="true" />;
    case 'CloudFog':
      return <CloudFog className={`${className} ${colorClass}`} aria-hidden="true" />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} ${colorClass}`} aria-hidden="true" />;
    case 'CloudRain':
    case 'CloudRainWind':
      return <CloudRain className={`${className} ${colorClass}`} aria-hidden="true" />;
    case 'CloudSnow':
      return <CloudSnow className={`${className} ${colorClass}`} aria-hidden="true" />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} ${colorClass}`} aria-hidden="true" />;
    default:
      return <Wind className={`${className} ${colorClass}`} aria-hidden="true" />;
  }
};
