/**
 * Asynchronous Open-Meteo REST API Client
 * Task 4: Real-Time Weather Dashboard
 *
 * Implements fetch(), async/await, try/catch/finally, status checks,
 * country-code scoping, and disambiguation protections.
 */

import {
  GeocodingResponse,
  GeocodingResult,
  OpenMeteoForecastResponse,
  WeatherDashboardData,
  CurrentWeatherState,
  DailyForecastItem,
} from '../types/weather';
import {
  getWeatherCondition,
  formatForecastDate,
} from '../utils/weatherCodes';

export type WeatherErrorCode =
  | 'EMPTY_INPUT'
  | 'CITY_NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'HTTP_ERROR'
  | 'INVALID_JSON'
  | 'MISSING_DATA';

export class WeatherAppError extends Error {
  code: WeatherErrorCode;
  httpStatus?: number;
  statusCode?: number;

  constructor(message: string, code: WeatherErrorCode, httpStatus?: number) {
    super(message);
    this.name = 'WeatherAppError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.statusCode = httpStatus;
  }
}

/**
 * Encodes a city name safely for inclusion in REST API query parameters.
 */
export function sanitizeCityInput(input: string): string {
  if (!input || input.trim().length === 0) {
    throw new WeatherAppError('Please enter a city name to search.', 'EMPTY_INPUT');
  }
  return input.trim();
}

/**
 * Fetches geographical coordinates for a city using Open-Meteo Geocoding REST API.
 * In India mode, strictly filters results so only country_code === "IN" is accepted.
 *
 * @param city City name entered by user
 * @param countryCode Optional 2-letter ISO country code (e.g. 'IN')
 * @param signal Optional AbortSignal to cancel stale requests
 * @returns Array of matching locations
 */
export async function searchCityCoordinates(
  city: string,
  countryCode?: string,
  signal?: AbortSignal
): Promise<GeocodingResult[]> {
  const sanitized = sanitizeCityInput(city);
  const encodedCity = encodeURIComponent(sanitized);
  const countryParam = countryCode ? `&countryCode=${encodeURIComponent(countryCode.toUpperCase())}` : '';
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedCity}&count=10&language=en&format=json${countryParam}`;

  let response: Response;
  try {
    response = await fetch(geocodingUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err; // Re-throw abort to be handled by caller
    }
    console.error('[WeatherPulse] Network failure during geocoding:', err);
    throw new WeatherAppError(
      'Unable to connect to the geocoding service. Please check your network connection and try again.',
      'NETWORK_ERROR'
    );
  }

  if (!response.ok) {
    console.error(`[WeatherPulse] Geocoding HTTP error: ${response.status} ${response.statusText}`);
    throw new WeatherAppError(
      `Geocoding service returned HTTP ${response.status} (${response.statusText || 'Error'}).`,
      'HTTP_ERROR',
      response.status
    );
  }

  let data: GeocodingResponse;
  try {
    data = await response.json();
  } catch (err: unknown) {
    console.error('[WeatherPulse] Failed to parse geocoding JSON:', err);
    throw new WeatherAppError(
      'Received an invalid JSON response from the geocoding service.',
      'INVALID_JSON'
    );
  }

  let results = data && Array.isArray(data.results) ? data.results : [];

  // In India mode, strictly accept results where country_code === "IN" (Requirement 3)
  if (countryCode && countryCode.toUpperCase() === 'IN') {
    results = results.filter(
      (r) => r.country_code?.toUpperCase() === 'IN'
    );
  }

  if (results.length === 0) {
    if (countryCode?.toUpperCase() === 'IN') {
      throw new WeatherAppError(
        `No Indian location found matching "${sanitized}". In India mode, only locations with country_code "IN" are accepted. Please verify the spelling or switch to Global mode.`,
        'CITY_NOT_FOUND'
      );
    }
    throw new WeatherAppError(
      `No location found matching "${sanitized}". Please verify the city spelling and try again.`,
      'CITY_NOT_FOUND'
    );
  }

  return results;
}

/**
 * Fetches real-time weather and 7-day forecast using Open-Meteo Forecast REST API.
 *
 * @param latitude Geographic latitude
 * @param longitude Geographic longitude
 * @param signal Optional AbortSignal
 * @returns Raw Open-Meteo forecast JSON response
 */
export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<{ forecast: OpenMeteoForecastResponse; url: string }> {
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    throw new WeatherAppError('Invalid latitude or longitude coordinates provided.', 'MISSING_DATA');
  }

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

  let response: Response;
  try {
    response = await fetch(forecastUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    console.error('[WeatherPulse] Network failure during forecast fetch:', err);
    throw new WeatherAppError(
      'Unable to connect to the weather forecast service. Please check your network connection.',
      'NETWORK_ERROR'
    );
  }

  if (!response.ok) {
    console.error(`[WeatherPulse] Forecast HTTP error: ${response.status} ${response.statusText}`);
    throw new WeatherAppError(
      `Forecast service returned HTTP ${response.status} (${response.statusText || 'Error'}).`,
      'HTTP_ERROR',
      response.status
    );
  }

  let data: OpenMeteoForecastResponse;
  try {
    data = await response.json();
  } catch (err: unknown) {
    console.error('[WeatherPulse] Failed to parse forecast JSON:', err);
    throw new WeatherAppError(
      'Received an invalid JSON response from the weather forecast service.',
      'INVALID_JSON'
    );
  }

  if (!data || !data.current || typeof data.current.temperature_2m === 'undefined') {
    console.error('[WeatherPulse] Incomplete forecast response payload:', data);
    throw new WeatherAppError(
      'The weather forecast response is missing required meteorological fields.',
      'MISSING_DATA'
    );
  }

  return { forecast: data, url: forecastUrl };
}

export interface CompleteWeatherResult {
  dashboardData?: WeatherDashboardData;
  allMatches: GeocodingResult[];
  requiresSelection?: boolean;
}

/**
 * End-to-end asynchronous workflow that converts a city name into coordinates,
 * fetches real-time meteorological metrics and multi-day forecast, and transforms
 * the response into a structured dashboard state.
 *
 * Disambiguation logic:
 * - When locationOverride is passed, immediately fetches for that location.
 * - When isDirectQuickCity is true, finds the exact matching city.
 * - When multiple cities match or no exact match exists, flags requiresSelection so the user selects city/state.
 */
export async function getCompleteWeatherData(
  city: string,
  locationOverride?: GeocodingResult,
  countryCode?: string,
  isDirectQuickCity?: boolean,
  signal?: AbortSignal
): Promise<CompleteWeatherResult> {
  const startTime = performance.now();

  let selectedLocation: GeocodingResult | undefined;
  let allMatches: GeocodingResult[] = [];

  if (locationOverride) {
    selectedLocation = locationOverride;
    allMatches = [locationOverride];
  } else {
    allMatches = await searchCityCoordinates(city, countryCode, signal);

    if (isDirectQuickCity) {
      // Direct quick-access button clicked (e.g. Pune, Mumbai, New Delhi, Bengaluru):
      // Match exact city name
      const exact = allMatches.find(
        (m) => m.name.toLowerCase() === city.trim().toLowerCase()
      );
      selectedLocation = exact || allMatches[0];
    } else {
      // Custom user search:
      const trimmedQuery = city.trim().toLowerCase();
      const exactMatches = allMatches.filter(
        (m) => m.name.toLowerCase() === trimmedQuery
      );

      if (exactMatches.length === 1) {
        // Unambiguous exact match found
        selectedLocation = exactMatches[0];
      } else {
        // Multiple cities matched or no exact match
        // Do not silently select the first geocoding result (Requirements 4, 5, 7)
        return {
          allMatches,
          requiresSelection: true,
        };
      }
    }
  }

  // Update weather data only after a valid location is selected and forecast succeeds (Requirement 7)
  const { forecast, url: forecastUrl } = await fetchWeatherForecast(
    selectedLocation.latitude,
    selectedLocation.longitude,
    signal
  );

  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);

  // Parse current weather
  const current = forecast.current;
  const isDay = current.is_day === 1;
  const conditionInfo = getWeatherCondition(current.weather_code, isDay);

  // Ensure selected result's actual name, admin1, country, countryCode, latitude, and longitude are stored together (Requirement 2)
  const currentSummary: CurrentWeatherState = {
    city: selectedLocation.name,
    country: selectedLocation.country,
    countryCode: selectedLocation.country_code,
    admin1: selectedLocation.admin1,
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature ?? current.temperature_2m,
    humidity: current.relative_humidity_2m ?? 0,
    windSpeed: current.wind_speed_10m ?? 0,
    precipitation: current.precipitation ?? 0,
    precipitationUnit: forecast.current_units?.precipitation || 'mm',
    weatherCode: current.weather_code,
    isDay,
    condition: conditionInfo,
    observationTime: current.time,
    timezone: forecast.timezone || selectedLocation.timezone || 'UTC',
    timezoneAbbr: forecast.timezone_abbreviation,
  };

  // Parse daily forecast
  const dailyForecastList: DailyForecastItem[] = [];
  if (forecast.daily && Array.isArray(forecast.daily.time)) {
    const times = forecast.daily.time;
    const codes = forecast.daily.weather_code || [];
    const maxTemps = forecast.daily.temperature_2m_max || [];
    const minTemps = forecast.daily.temperature_2m_min || [];

    for (let i = 0; i < times.length; i++) {
      const dateStr = times[i];
      const code = codes[i] ?? 0;
      const { dayName, formattedDate } = formatForecastDate(dateStr);
      const condition = getWeatherCondition(code, true);

      dailyForecastList.push({
        date: dateStr,
        dayName,
        formattedDate,
        weatherCode: code,
        condition,
        tempMax: maxTemps[i],
        tempMin: minTemps[i],
      });
    }
  }

  const countryParam = countryCode ? `&countryCode=${encodeURIComponent(countryCode.toUpperCase())}` : '';
  const geocodingUrl = locationOverride
    ? 'Direct selection (geocoding bypassed)'
    : `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=10&language=en&format=json${countryParam}`;

  const dashboardData: WeatherDashboardData = {
    current: currentSummary,
    forecast: dailyForecastList,
    rawForecastResponse: forecast,
    rawGeocodingResult: selectedLocation,
    metadata: {
      latencyMs,
      timestamp: new Date().toISOString(),
      geocodingUrl,
      forecastUrl,
      httpStatus: 200,
    },
  };

  return { dashboardData, allMatches, requiresSelection: false };
}
