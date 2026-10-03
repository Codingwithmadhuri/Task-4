/**
 * WeatherPulse — Real-Time Weather Dashboard
 * Task 4: Asynchronous JavaScript & RESTful APIs
 * With Dedicated India Weather Support (countryCode=IN)
 *
 * Core JavaScript Logic: Fetch API, async/await, try/catch/finally,
 * DOM manipulation, WMO weather code parsing, and race-condition safety.
 */

// ==========================================
// 1. WMO Weather Interpretation Code Table
// ==========================================
const WMO_MAP = {
  0: { label: 'Clear Sky', icon: '☀️', iconNight: '🌙', desc: 'Cloudless conditions with optimal visibility' },
  1: { label: 'Mainly Clear', icon: '🌤️', iconNight: '🌤️', desc: 'Mostly clear skies with sparse clouds' },
  2: { label: 'Partly Cloudy', icon: '⛅', iconNight: '☁️', desc: 'Scattered clouds with intermittent sunshine' },
  3: { label: 'Overcast', icon: '☁️', iconNight: '☁️', desc: 'Thick continuous cloud cover' },
  45: { label: 'Foggy', icon: '🌫️', iconNight: '🌫️', desc: 'Dense fog reducing ground visibility' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️', iconNight: '🌫️', desc: 'Freezing fog forming crystalline ice deposits' },
  51: { label: 'Light Drizzle', icon: '🌦️', iconNight: '🌦️', desc: 'Fine, gentle water droplets' },
  53: { label: 'Moderate Drizzle', icon: '🌦️', iconNight: '🌦️', desc: 'Steady fine mist with continuous wetness' },
  55: { label: 'Dense Drizzle', icon: '🌧️', iconNight: '🌧️', desc: 'Heavy precipitation mist' },
  56: { label: 'Light Freezing Drizzle', icon: '🌧️', iconNight: '🌧️', desc: 'Fine mist freezing upon ground contact' },
  57: { label: 'Dense Freezing Drizzle', icon: '🌧️', iconNight: '🌧️', desc: 'Intense freezing drizzle forming glaze ice' },
  61: { label: 'Slight Rain', icon: '🌧️', iconNight: '🌧️', desc: 'Light scattered rainfall' },
  63: { label: 'Moderate Rain', icon: '🌧️', iconNight: '🌧️', desc: 'Steady continuous rainfall' },
  65: { label: 'Heavy Rain', icon: '🌧️', iconNight: '🌧️', desc: 'Intense downpour with rapid surface runoff' },
  66: { label: 'Light Freezing Rain', icon: '🌧️', iconNight: '🌧️', desc: 'Rain turning to ice on frozen surfaces' },
  67: { label: 'Heavy Freezing Rain', icon: '🌧️', iconNight: '🌧️', desc: 'Hazardous freezing downpour' },
  71: { label: 'Slight Snowfall', icon: '🌨️', iconNight: '🌨️', desc: 'Light flurries with low accumulation' },
  73: { label: 'Moderate Snowfall', icon: '🌨️', iconNight: '🌨️', desc: 'Steady snow falling with moderate ground cover' },
  75: { label: 'Heavy Snowfall', icon: '❄️', iconNight: '❄️', desc: 'Intense snowfall with accumulation' },
  77: { label: 'Snow Grains', icon: '❄️', iconNight: '❄️', desc: 'Small opaque white grains of ice' },
  80: { label: 'Slight Rain Showers', icon: '🌦️', iconNight: '🌦️', desc: 'Brief, passing rain showers' },
  81: { label: 'Moderate Rain Showers', icon: '🌧️', iconNight: '🌧️', desc: 'Passing showers of moderate intensity' },
  82: { label: 'Violent Rain Showers', icon: '⛈️', iconNight: '⛈️', desc: 'Sudden, torrentially heavy cloudbursts' },
  85: { label: 'Slight Snow Showers', icon: '🌨️', iconNight: '🌨️', desc: 'Brief intermittent snow flurries' },
  86: { label: 'Heavy Snow Showers', icon: '❄️', iconNight: '❄️', desc: 'Sudden, dense squalls of falling snow' },
  95: { label: 'Thunderstorm', icon: '⛈️', iconNight: '⛈️', desc: 'Thunder and lightning accompanied by rain' },
  96: { label: 'Thunderstorm with Slight Hail', icon: '⛈️', iconNight: '⛈️', desc: 'Electrical storm with small ice pellets' },
  99: { label: 'Thunderstorm with Heavy Hail', icon: '⛈️', iconNight: '⛈️', desc: 'Severe electrical storm with destructive hail' },
};

/**
 * Reusable helper to map Open-Meteo weather code into conditions and icons.
 */
function getWeatherCondition(code, isDay = true) {
  const match = WMO_MAP[code];
  if (!match) {
    return {
      label: 'Unknown Condition',
      icon: isDay ? '☀️' : '🌙',
      desc: `WMO weather code: ${code}`,
    };
  }
  return {
    label: match.label,
    icon: isDay ? match.icon : match.iconNight,
    desc: match.desc,
  };
}

// ==========================================
// 2. Application State & Request Controller
// ==========================================
let currentUnit = 'C';
let currentScope = 'india'; // 'india' or 'global'
let currentWeatherData = null;
let lastSearchedCity = 'Pune';
let currentRequestSequence = 0;
let activeAbortController = null;

const INDIAN_CITIES = ['Pune', 'Mumbai', 'New Delhi', 'Bengaluru', 'Chennai', 'Hyderabad'];
const GLOBAL_CITIES = ['London', 'Tokyo', 'New York', 'Paris', 'Sydney', 'Cairo'];

// ==========================================
// 3. DOM Elements
// ==========================================
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const clearBtn = document.getElementById('clear-btn');
const searchBtn = document.getElementById('search-btn');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const inputValidation = document.getElementById('input-validation');
const loadingContainer = document.getElementById('loading-container');
const errorContainer = document.getElementById('error-container');
const errorTitle = document.getElementById('error-title');
const errorMessage = document.getElementById('error-message');
const errorAdvice = document.getElementById('error-advice');
const retryBtn = document.getElementById('retry-btn');
const dismissErrorBtn = document.getElementById('dismiss-error-btn');
const weatherDashboard = document.getElementById('weather-dashboard');
const btnCelsius = document.getElementById('btn-celsius');
const btnFahrenheit = document.getElementById('btn-fahrenheit');
const btnScopeIndia = document.getElementById('btn-scope-india');
const btnScopeGlobal = document.getElementById('btn-scope-global');
const scopeStatus = document.getElementById('scope-status');
const quickCitiesContainer = document.getElementById('quick-cities');

// ==========================================
// 4. Asynchronous Fetch Operations
// ==========================================

/**
 * Geocodes city name using Open-Meteo REST API.
 * Supports countryCode=IN filtering when in India mode.
 */
async function geocodeCity(city, signal) {
  const sanitized = city.trim();
  if (!sanitized) {
    throw new Error('EMPTY_INPUT');
  }

  const encoded = encodeURIComponent(sanitized);
  const countryParam = currentScope === 'india' ? '&countryCode=IN' : '';
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=10&language=en&format=json${countryParam}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`HTTP_GEO_${response.status}`);
  }

  const data = await response.json();
  let results = data && Array.isArray(data.results) ? data.results : [];

  if (currentScope === 'india') {
    results = results.filter((r) => r.country_code?.toUpperCase() === 'IN');
  }

  if (results.length === 0) {
    throw new Error(`CITY_NOT_FOUND:${sanitized}`);
  }

  return results;
}

/**
 * Fetches real-time weather and 7-day forecast using Open-Meteo REST API
 */
async function fetchForecast(lat, lon, signal) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`HTTP_FORECAST_${response.status}`);
  }

  const data = await response.json();
  if (!data.current || typeof data.current.temperature_2m === 'undefined') {
    throw new Error('MISSING_DATA');
  }

  return data;
}

/**
 * Main coordinator function using async/await and try/catch/finally
 */
async function loadCityWeather(cityName, locationOverride, isDirectQuickCity = false) {
  const trimmed = cityName.trim();
  if (!trimmed) {
    showInputError('Please enter a valid city name.');
    return;
  }

  clearInputError();
  hideError();

  // Cancel prior in-flight request to prevent race conditions
  if (activeAbortController) {
    activeAbortController.abort();
  }

  const controller = new AbortController();
  activeAbortController = controller;
  const requestId = ++currentRequestSequence;

  setLoadingState(true);

  try {
    let location = locationOverride;

    if (!location) {
      const candidates = await geocodeCity(trimmed, controller.signal);

      if (isDirectQuickCity) {
        // Quick access: exact name match
        location = candidates.find(
          (c) => c.name.toLowerCase() === trimmed.toLowerCase()
        ) || candidates[0];
      } else {
        const exactMatches = candidates.filter(
          (c) => c.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (exactMatches.length === 1) {
          location = exactMatches[0];
        } else {
          // Disambiguation
          location = candidates[0];
        }
      }
    }

    // Step 2: Forecast
    const forecast = await fetchForecast(location.latitude, location.longitude, controller.signal);

    // Verify this is still the newest requested search
    if (requestId === currentRequestSequence) {
      currentWeatherData = { location, forecast };
      lastSearchedCity = trimmed;
      renderWeatherDashboard(currentWeatherData);
    }
  } catch (err) {
    // If request was aborted by a subsequent search, ignore
    if (err.name === 'AbortError') return;

    if (requestId === currentRequestSequence) {
      console.error('[WeatherPulse] Asynchronous API error:', err);
      handleAppError(err);
      // Notice: We preserve existing weatherDashboard display so failed queries don't wipe data
    }
  } finally {
    if (requestId === currentRequestSequence) {
      setLoadingState(false);
    }
  }
}

// ==========================================
// 5. DOM Rendering and Formatting Helpers
// ==========================================

function formatTemp(celsius) {
  if (currentUnit === 'F') {
    const f = (celsius * 9) / 5 + 32;
    return `${Math.round(f * 10) / 10}°F`;
  }
  return `${Math.round(celsius * 10) / 10}°C`;
}

function formatTime24(isoTime, timezone, timezoneAbbr) {
  try {
    const parts = isoTime.split('T');
    if (parts.length === 2) {
      const time24 = parts[1];
      const [year, month, day] = parts[0].split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mName = months[parseInt(month, 10) - 1] || month;
      const dateStr = `${parseInt(day, 10)} ${mName} ${year}`;
      const tzBadge = timezone === 'Asia/Kolkata' ? 'IST' : (timezoneAbbr || timezone.split('/').pop() || timezone);
      return `${time24} ${tzBadge} · ${dateStr}`;
    }
  } catch (e) {
    // fallback
  }
  return `${isoTime.replace('T', ' ')} (${timezoneAbbr || timezone})`;
}

function renderWeatherDashboard(data) {
  const { location, forecast } = data;
  const current = forecast.current;
  const isDay = current.is_day === 1;
  const condition = getWeatherCondition(current.weather_code, isDay);
  const isIndia = location.country?.toLowerCase() === 'india' || location.country_code?.toUpperCase() === 'IN';

  // Update Header & Location
  document.getElementById('coord-display').textContent = `${location.latitude.toFixed(2)}°N, ${location.longitude.toFixed(2)}°E ${isIndia ? '· 🇮🇳 INDIA' : ''}`;
  const now = new Date();
  const timeSecStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const tzSuffix = forecast.timezone === 'Asia/Kolkata' ? 'IST' : (forecast.timezone_abbreviation || '');
  const lastUpEl = document.getElementById('last-updated-display');
  if (lastUpEl) {
    lastUpEl.textContent = `Updated: ${timeSecStr} ${tzSuffix}`.trim();
  }
  document.getElementById('city-name').textContent = location.name;
  document.getElementById('country-name').textContent = [location.admin1, location.country].filter(Boolean).join(', ');

  // Visuals
  document.getElementById('weather-icon').textContent = condition.icon;
  document.getElementById('day-night-indicator').textContent = isDay ? 'Daytime Observation' : 'Nighttime Observation';
  document.getElementById('local-time').textContent = formatTime24(current.time, forecast.timezone, forecast.timezone_abbreviation);

  // Current Temperature Block
  document.getElementById('current-temp').textContent = formatTemp(current.temperature_2m);
  document.getElementById('condition-label').textContent = condition.label;
  document.getElementById('feels-like-temp').textContent = formatTemp(current.apparent_temperature ?? current.temperature_2m);

  // Footer Description
  document.getElementById('condition-description').textContent = `"${condition.desc}"`;
  document.getElementById('wmo-code-badge').textContent = `WMO Code ${current.weather_code}`;

  // Metrics Grid
  document.getElementById('metric-feels-like').textContent = formatTemp(current.apparent_temperature ?? current.temperature_2m);
  document.getElementById('metric-humidity').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('metric-humidity-note').textContent = current.relative_humidity_2m > 65 ? 'High humidity' : 'Comfortable moisture';
  document.getElementById('metric-wind').textContent = `${current.wind_speed_10m} km/h`;
  document.getElementById('metric-wind-note').textContent = current.wind_speed_10m > 30 ? 'Strong breeze' : 'Light to moderate breeze';
  document.getElementById('metric-precip').textContent = `${current.precipitation} ${forecast.current_units?.precipitation || 'mm'}`;
  document.getElementById('metric-coords').textContent = `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`;
  document.getElementById('metric-timezone').textContent = forecast.timezone === 'Asia/Kolkata' ? 'IST' : (forecast.timezone_abbreviation || 'UTC');
  document.getElementById('metric-timezone-sub').textContent = forecast.timezone;

  // Render 7-Day Forecast Grid
  renderForecastGrid(forecast.daily);

  weatherDashboard.style.display = 'block';
}

function renderForecastGrid(daily) {
  const container = document.getElementById('forecast-grid');
  container.innerHTML = '';

  if (!daily || !Array.isArray(daily.time)) return;

  daily.time.forEach((dateStr, idx) => {
    const code = daily.weather_code[idx];
    const maxT = daily.temperature_2m_max[idx];
    const minT = daily.temperature_2m_min[idx];
    const condition = getWeatherCondition(code, true);

    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const dayNum = parseInt(parts[2], 10);
    const dateObj = new Date(year, monthIdx, dayNum);

    const dayLabel = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Indian Date format: DD MMM YYYY
    const formattedDate = `${dayNum} ${months[monthIdx]} ${year}`;

    const card = document.createElement('div');
    card.className = `forecast-card ${idx === 0 ? 'today' : ''}`;
    card.innerHTML = `
      <span class="forecast-day">${dayLabel}</span>
      <span class="forecast-date">${formattedDate}</span>
      <span class="forecast-icon">${condition.icon}</span>
      <span class="forecast-cond">${condition.label}</span>
      <div class="forecast-temps">
        <span class="temp-min">${formatTemp(minT)}</span>
        <span class="temp-max">${formatTemp(maxT)}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// 6. UI State & Error Handlers
// ==========================================

function setLoadingState(isLoading) {
  if (isLoading) {
    loadingContainer.style.display = 'flex';
    searchBtn.disabled = true;
    cityInput.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
  } else {
    loadingContainer.style.display = 'none';
    searchBtn.disabled = false;
    cityInput.disabled = false;
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
  }
}

function showInputError(msg) {
  inputValidation.textContent = msg;
  inputValidation.style.display = 'block';
}

function clearInputError() {
  inputValidation.textContent = '';
  inputValidation.style.display = 'none';
}

function handleAppError(err) {
  const msg = err.message || '';

  if (msg.startsWith('CITY_NOT_FOUND')) {
    const cityName = msg.split(':')[1] || '';
    const scopeMsg = currentScope === 'india' ? ' in India' : '';
    const adviceMsg = currentScope === 'india'
      ? 'Please verify the city spelling or switch to Global mode in the header.'
      : 'Please check your spelling or search for a nearby major city.';
    showError(
      'Location Not Found',
      `No weather station found for "${cityName}"${scopeMsg}.`,
      adviceMsg
    );
  } else if (msg.startsWith('HTTP_')) {
    showError(
      'Weather Service Error',
      `Open-Meteo REST service returned an HTTP status error (${msg}).`,
      'Please try again in a few moments.'
    );
  } else if (msg === 'MISSING_DATA') {
    showError(
      'Incomplete Data',
      'The API returned an incomplete response with missing metrics.',
      'Try searching another city or retry shortly.'
    );
  } else {
    showError(
      'Network Connection Failure',
      'Unable to connect to the Open-Meteo public REST API.',
      'Please verify your internet connection and DNS settings.'
    );
  }
}

function showError(title, message, advice) {
  errorTitle.textContent = title;
  errorMessage.textContent = message;
  errorAdvice.textContent = advice;
  errorContainer.style.display = 'block';
}

function hideError() {
  errorContainer.style.display = 'none';
}

function renderQuickCities() {
  const cities = currentScope === 'india' ? INDIAN_CITIES : GLOBAL_CITIES;
  quickCitiesContainer.innerHTML = `<span class="quick-label">${currentScope === 'india' ? 'Quick Access (India):' : 'Suggested:'}</span>`;
  cities.forEach((city) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.setAttribute('data-city', city);
    btn.textContent = city;
    btn.addEventListener('click', () => {
      cityInput.value = city;
      clearBtn.style.display = 'block';
      loadCityWeather(city);
    });
    quickCitiesContainer.appendChild(btn);
  });
}

function updateScopeUI() {
  if (currentScope === 'india') {
    btnScopeIndia.classList.add('active');
    btnScopeIndia.setAttribute('aria-pressed', 'true');
    btnScopeGlobal.classList.remove('active');
    btnScopeGlobal.setAttribute('aria-pressed', 'false');
    scopeStatus.textContent = '🇮🇳 India Meteorological Mode · Filtered to countryCode=IN';
    cityInput.placeholder = 'Search an Indian city (e.g., Pune, Mumbai, Delhi, Bengaluru)...';
  } else {
    btnScopeGlobal.classList.add('active');
    btnScopeGlobal.setAttribute('aria-pressed', 'true');
    btnScopeIndia.classList.remove('active');
    btnScopeIndia.setAttribute('aria-pressed', 'false');
    scopeStatus.textContent = '🌐 Global Meteorological Mode · Worldwide coverage';
    cityInput.placeholder = 'Search any city worldwide (e.g., Tokyo, London, Paris)...';
  }
  renderQuickCities();
}

// ==========================================
// 7. Event Listeners & Initialization
// ==========================================

// Form submission
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loadCityWeather(cityInput.value);
});

// Clear input button
cityInput.addEventListener('input', () => {
  clearBtn.style.display = cityInput.value ? 'block' : 'none';
  clearInputError();
});

clearBtn.addEventListener('click', () => {
  cityInput.value = '';
  clearBtn.style.display = 'none';
  clearInputError();
  cityInput.focus();
});

// Scope toggles
btnScopeIndia.addEventListener('click', () => {
  if (currentScope !== 'india') {
    currentScope = 'india';
    updateScopeUI();
    if (currentWeatherData && currentWeatherData.location.country?.toLowerCase() !== 'india') {
      loadCityWeather('Pune');
    }
  }
});

btnScopeGlobal.addEventListener('click', () => {
  if (currentScope !== 'global') {
    currentScope = 'global';
    updateScopeUI();
  }
});

// Error action buttons & Refresh
retryBtn.addEventListener('click', () => {
  loadCityWeather(lastSearchedCity);
});

const manualRefreshBtn = document.getElementById('manual-refresh-btn');
if (manualRefreshBtn) {
  manualRefreshBtn.addEventListener('click', () => {
    loadCityWeather(lastSearchedCity);
  });
}

dismissErrorBtn.addEventListener('click', () => {
  hideError();
});

// Unit toggle
btnCelsius.addEventListener('click', () => {
  if (currentUnit !== 'C') {
    currentUnit = 'C';
    btnCelsius.classList.add('active');
    btnCelsius.setAttribute('aria-pressed', 'true');
    btnFahrenheit.classList.remove('active');
    btnFahrenheit.setAttribute('aria-pressed', 'false');
    if (currentWeatherData) renderWeatherDashboard(currentWeatherData);
  }
});

btnFahrenheit.addEventListener('click', () => {
  if (currentUnit !== 'F') {
    currentUnit = 'F';
    btnFahrenheit.classList.add('active');
    btnFahrenheit.setAttribute('aria-pressed', 'true');
    btnCelsius.classList.remove('active');
    btnCelsius.setAttribute('aria-pressed', 'false');
    if (currentWeatherData) renderWeatherDashboard(currentWeatherData);
  }
});

// Initial boot: Pune, India
updateScopeUI();
loadCityWeather('Pune');
