export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  country_id?: number;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  population?: number;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
  generationtime_ms?: number;
}

export interface CurrentWeatherUnits {
  time?: string;
  interval?: string;
  temperature_2m?: string;
  relative_humidity_2m?: string;
  apparent_temperature?: string;
  is_day?: string;
  precipitation?: string;
  weather_code?: string;
  wind_speed_10m?: string;
}

export interface CurrentWeatherData {
  time: string;
  interval?: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface DailyForecastUnits {
  time?: string;
  weather_code?: string;
  temperature_2m_max?: string;
  temperature_2m_min?: string;
}

export interface DailyForecastData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation?: string;
  elevation?: number;
  current_units: CurrentWeatherUnits;
  current: CurrentWeatherData;
  daily_units: DailyForecastUnits;
  daily: DailyForecastData;
}

export type WeatherCategory =
  | 'clear'
  | 'clouds'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export interface WeatherConditionInfo {
  code: number;
  label: string;
  description: string;
  category: WeatherCategory;
  iconName: string;
}

export interface CurrentWeatherState {
  city: string;
  country?: string;
  countryCode?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  precipitationUnit: string;
  weatherCode: number;
  isDay: boolean;
  condition: WeatherConditionInfo;
  observationTime: string;
  timezone: string;
  timezoneAbbr?: string;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  formattedDate: string;
  weatherCode: number;
  condition: WeatherConditionInfo;
  tempMax: number;
  tempMin: number;
}

export interface RequestMetadata {
  latencyMs: number;
  timestamp: string;
  geocodingUrl: string;
  forecastUrl: string;
  httpStatus: number;
}

export type RegionScope = 'india' | 'global';

export interface WeatherDashboardData {
  current: CurrentWeatherState;
  forecast: DailyForecastItem[];
  rawForecastResponse: OpenMeteoForecastResponse;
  rawGeocodingResult: GeocodingResult;
  metadata: RequestMetadata;
}
