import { WeatherConditionInfo, WeatherCategory } from '../types/weather';

/**
 * Maps WMO (World Meteorological Organization) weather interpretation codes
 * to user-friendly conditions, categories, and icon identifiers.
 *
 * Source: Open-Meteo API documentation & WMO Code Table 4677.
 */
export const WMO_WEATHER_MAP: Record<number, { label: string; description: string; category: WeatherCategory }> = {
  0: {
    label: 'Clear Sky',
    description: 'Cloudless conditions with optimal visibility',
    category: 'clear',
  },
  1: {
    label: 'Mainly Clear',
    description: 'Mostly clear skies with fleeting sparse clouds',
    category: 'clear',
  },
  2: {
    label: 'Partly Cloudy',
    description: 'Scattered clouds with intermittent sunshine',
    category: 'clouds',
  },
  3: {
    label: 'Overcast',
    description: 'Thick continuous cloud cover',
    category: 'clouds',
  },
  45: {
    label: 'Foggy',
    description: 'Dense fog reducing ground visibility',
    category: 'fog',
  },
  48: {
    label: 'Depositing Rime Fog',
    description: 'Freezing fog forming crystalline ice deposits',
    category: 'fog',
  },
  51: {
    label: 'Light Drizzle',
    description: 'Fine, gentle water droplets with minimal accumulation',
    category: 'drizzle',
  },
  53: {
    label: 'Moderate Drizzle',
    description: 'Steady fine mist with continuous wetness',
    category: 'drizzle',
  },
  55: {
    label: 'Dense Drizzle',
    description: 'Heavy precipitation mist reducing visibility',
    category: 'drizzle',
  },
  56: {
    label: 'Light Freezing Drizzle',
    description: 'Fine mist freezing upon ground contact',
    category: 'drizzle',
  },
  57: {
    label: 'Dense Freezing Drizzle',
    description: 'Intense freezing drizzle forming glaze ice',
    category: 'drizzle',
  },
  61: {
    label: 'Slight Rain',
    description: 'Light scattered rainfall',
    category: 'rain',
  },
  63: {
    label: 'Moderate Rain',
    description: 'Steady continuous rainfall',
    category: 'rain',
  },
  65: {
    label: 'Heavy Rain',
    description: 'Intense downpour with rapid surface runoff',
    category: 'rain',
  },
  66: {
    label: 'Light Freezing Rain',
    description: 'Rain turning to ice on frozen surfaces',
    category: 'rain',
  },
  67: {
    label: 'Heavy Freezing Rain',
    description: 'Hazardous freezing downpour causing glaze ice',
    category: 'rain',
  },
  71: {
    label: 'Slight Snowfall',
    description: 'Light flurries with low accumulation',
    category: 'snow',
  },
  73: {
    label: 'Moderate Snowfall',
    description: 'Steady snow falling with moderate ground cover',
    category: 'snow',
  },
  75: {
    label: 'Heavy Snowfall',
    description: 'Intense snowfall with accumulation',
    category: 'snow',
  },
  77: {
    label: 'Snow Grains',
    description: 'Small opaque white grains of ice',
    category: 'snow',
  },
  80: {
    label: 'Slight Rain Showers',
    description: 'Brief, passing rain showers',
    category: 'rain',
  },
  81: {
    label: 'Moderate Rain Showers',
    description: 'Passing showers of moderate intensity',
    category: 'rain',
  },
  82: {
    label: 'Violent Rain Showers',
    description: 'Sudden, torrentially heavy cloudbursts',
    category: 'rain',
  },
  85: {
    label: 'Slight Snow Showers',
    description: 'Brief intermittent snow flurries',
    category: 'snow',
  },
  86: {
    label: 'Heavy Snow Showers',
    description: 'Sudden, dense squalls of falling snow',
    category: 'snow',
  },
  95: {
    label: 'Thunderstorm',
    description: 'Thunder and lightning accompanied by rain',
    category: 'thunderstorm',
  },
  96: {
    label: 'Thunderstorm with Slight Hail',
    description: 'Electrical storm with small ice pellets',
    category: 'thunderstorm',
  },
  99: {
    label: 'Thunderstorm with Heavy Hail',
    description: 'Severe electrical storm with destructive hail stones',
    category: 'thunderstorm',
  },
};

/**
 * Reusable function that translates an Open-Meteo WMO weather code into
 * readable conditions, an accurate icon identifier, and categorical styling.
 *
 * @param code WMO weather code from Open-Meteo response
 * @param isDay Boolean indicating if the observation is during daytime
 * @returns WeatherConditionInfo object with labels, descriptions, and icon metadata
 */
export function getWeatherCondition(code: number, isDay: boolean = true): WeatherConditionInfo {
  const match = WMO_WEATHER_MAP[code];

  if (!match) {
    return {
      code,
      label: 'Unknown Condition',
      description: `WMO code ${code} reported by weather station`,
      category: 'clouds',
      iconName: isDay ? 'Sun' : 'Moon',
    };
  }

  let iconName = 'Cloud';

  switch (match.category) {
    case 'clear':
      iconName = isDay ? 'Sun' : 'Moon';
      break;
    case 'clouds':
      if (code === 2) {
        iconName = isDay ? 'CloudSun' : 'CloudMoon';
      } else {
        iconName = 'Cloud';
      }
      break;
    case 'fog':
      iconName = 'CloudFog';
      break;
    case 'drizzle':
      iconName = 'CloudDrizzle';
      break;
    case 'rain':
      iconName = code >= 80 ? 'CloudRainWind' : 'CloudRain';
      break;
    case 'snow':
      iconName = 'CloudSnow';
      break;
    case 'thunderstorm':
      iconName = 'CloudLightning';
      break;
  }

  return {
    code,
    label: match.label,
    description: match.description,
    category: match.category,
    iconName,
  };
}

/**
 * Converts Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

/**
 * Formats temperature according to current unit system
 */
export function formatTemperature(celsius: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${Math.round(celsius * 10) / 10}°C`;
}

/**
 * Formats ISO date into human-readable day name and date in Indian format (e.g. 14 Oct 2026).
 */
export function formatForecastDate(isoDate: string): { dayName: string; formattedDate: string } {
  try {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);

      const today = new Date();
      const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const isTomorrow =
        date.getFullYear() === tomorrow.getFullYear() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getDate() === tomorrow.getDate();

      const dayName = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
      // Indian standard date format: DD MMM YYYY (e.g., "14 Oct 2026")
      const formattedDate = `${day} ${monthShort} ${year}`;

      return { dayName, formattedDate };
    }
  } catch (e) {
    // Fallback
  }
  return { dayName: isoDate, formattedDate: isoDate };
}

/**
 * Formats observation time into a 24-hour clock with returned time-zone information (e.g. "14:30 (IST)").
 */
export function formatObservationTime24(
  isoTime: string,
  timezone: string,
  timezoneAbbr?: string
): string {
  try {
    const parts = isoTime.split('T');
    if (parts.length === 2) {
      const time24 = parts[1]; // Already in 24-hour format HH:mm
      const [year, month, day] = parts[0].split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mName = monthNames[parseInt(month, 10) - 1] || month;
      const dateStr = `${parseInt(day, 10)} ${mName} ${year}`;

      const zoneName = timezone === 'Asia/Kolkata' ? 'IST' : (timezoneAbbr || timezone.split('/').pop() || timezone);
      return `${time24} ${zoneName} · ${dateStr}`;
    }
  } catch {
    // Fallback
  }
  return `${isoTime} (${timezoneAbbr || timezone})`;
}
