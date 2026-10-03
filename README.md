# ⚡ WeatherPulse — Real-Time Weather Dashboard

> A high-performance, responsive meteorological dashboard built with asynchronous JavaScript, TypeScript, React, and Tailwind CSS, fetching live atmospheric observations and 7-day multi-day forecasts via the Open-Meteo REST APIs.

---

## 🔗 Live Demo

- **Live Application URL:** https://task4-weatherpulse.netlify.app/

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Live Demo Link](#-live-demo)
4. [Screenshots & UI Preview](#-screenshots--ui-preview)
5. [API Architecture & Endpoints](#-api-architecture--endpoints)
6. [Tech Stack](#-tech-stack)
7. [Getting Started & Installation](#-getting-started--installation)
8. [File Structure](#-file-structure)
9. [Asynchronous Data Flow & Error Handling](#-asynchronous-data-flow--error-handling)
10. [Testing & Verification Checklist](#-testing--verification-checklist)
11. [Data Attribution & License](#-data-attribution--license)

---

## 🌤️ Project Overview

**WeatherPulse** is an asynchronous weather application designed to deliver real-time atmospheric readings and multi-day meteorological forecasts with high reliability, precision geocoding, and zero mocked data.

The project demonstrates:
- Asynchronous data fetching using the modern browser `fetch()` API and `async/await` syntax.
- Multi-step REST API chaining (Geocoding API ➔ Forecast API).
- Dynamic WMO weather code translation into meteorological descriptions and iconography.
- Race-condition mitigation using `AbortController` and sequential request tokens.
- Robust multi-tier error resilience (`try/catch/finally`) that preserves on-screen data during edge cases.
- Dedicated **India Meteorological Mode** alongside full worldwide **Global Mode**.

---

## ✨ Key Features

### 🔍 1. Intelligent City Search & Disambiguation
- **Instant Search:** Instant city query with Enter-key submission and dedicated action button.
- **Input Sanitization:** Rejects empty or whitespace-only inputs, trimming and encoding query strings safely via `encodeURIComponent`.
- **Disambiguation Selection:** When a query matches multiple locations across different states or regions (e.g., *Delhi* in NCT vs. *Delhi* in Madhya Pradesh), the system prompts the user to select the exact intended city and state before updating the forecast.
- **Direct Quick-Access Hubs:** Dedicated one-click chips for **Pune, Mumbai, New Delhi, Bengaluru, Chennai, and Hyderabad**, plus an expandable drawer for extended hubs (Kolkata, Ahmedabad, Jaipur, Lucknow, Kochi, etc.).

### 🇮🇳 2. Dedicated India & Global Modes
- **India Mode:** Strictly filters geocoding results to locations where `country_code === "IN"`. Foreign homonyms are completely rejected.
- **Global Mode:** Full worldwide support across all countries and continents.
- **Localized Formatting:** Displays standard date formatting (`14 Oct 2026`) and local 24-hour observation time based on the returned timezone (`IST / Asia/Kolkata`).

### 📊 3. Live Atmospheric Observations Card
- **Unified Location Display:** Groups city name, administrative region/state (`admin1`), country with ISO badge (`IN`), and exact WGS84 coordinates (`18.52°N, 73.86°E`) together.
- **Real-Time Meteorology:**
  - Ambient Temperature (°C or °F)
  - "Feels Like" Apparent Temperature
  - Relative Humidity (%)
  - 10-Meter Wind Speed (km/h)
  - Precipitation Volume (mm)
  - Observation Timestamp & Daytime/Nighttime indicator
  - Official WMO Weather Code badge
- **Live Refresh & Timestamp:** Prominent **Last Updated** timestamp (`Updated: 12:45:10 IST`) accompanied by a manual **Refresh** button with active spinning feedback.

### 📅 4. 7-Day Multi-Day Meteorological Forecast
- Daily high and low temperature predictions with proportional range visualization bars.
- Weather condition badges and iconography mapped from WMO weather codes.
- Chronological daily forecast with localized weekday naming.

### 🔄 5. Unit Conversion (°C / °F)
- Real-time Celsius / Fahrenheit toggle that seamlessly recalculates all on-screen metrics including current temp, apparent temp, and 7-day daily maximums/minimums.

### 🛡️ 6. Resilient Error Handling & Loading Feedback
- Skeletons and button spinners prevent layout shifts (CLS) during in-flight network requests.
- Failed searches display a non-intrusive, dismissible error card with a retry option while keeping the previous valid weather dashboard intact on screen.

---

## 📸 Screenshots & UI Preview

```text
+-------------------------------------------------------------------------------+
|  ⚡ WeatherPulse                                [ 🇮🇳 India | 🌐 Global ]  [°C|°F]  |
+-------------------------------------------------------------------------------+
|  [ 🔍 Search an Indian city (e.g., Pune, Mumbai, New Delhi)...        ] [Search] |
|  Quick Access: [Pune] [Mumbai] [New Delhi] [Bengaluru] [Chennai] [Hyderabad]   |
+-------------------------------------------------------------------------------+
|  CURRENT OBSERVATIONS · 18.52°N, 73.85°E · 🇮🇳 India Station   Updated: 12:45   |
|                                                                 [🔄 Refresh]  |
|  Pune  Maharashtra                                                            |
|  📍 Maharashtra, India (IN) · 18.52°N, 73.86°E                               |
|                                                                               |
|  31.6°C                      [☀️ Clear Sky Icon]                              |
|  Clear Sky                   Daytime Observation                              |
|  Feels like 34.5°C           12:45 IST · Asia/Kolkata                         |
|  H: 33.2°C / L: 19.8°C                                                        |
+-------------------------------------------------------------------------------+
|  [ Humidity: 38% ]  [ Wind: 5.0 km/h ]  [ Precipitation: 0.0 mm ]  [ Daylight ]|
+-------------------------------------------------------------------------------+
|  7-DAY FORECAST                                                               |
|  [ Today: 33°/20° ] [ Tomorrow: 34°/21° ] [ Thu: 33°/20° ] [ Fri: 32°/19° ]...|
+-------------------------------------------------------------------------------+
```

*(You can add your actual screenshot images here: `![Dashboard Screenshot](./docs/screenshot.png)`)*

---

## 🌐 API Architecture & Endpoints

WeatherPulse connects directly to **Open-Meteo REST APIs** (no API key required):

### 1. Geocoding API Endpoint
```http
GET https://geocoding-api.open-meteo.com/v1/search?name={CITY}&count=10&language=en&format=json[&countryCode=IN]
```
- **Purpose:** Resolves textual city queries into precise geographic coordinates (`latitude`, `longitude`), administrative divisions (`admin1`), country, and timezone.
- **Scoping:** When in India Mode, `countryCode=IN` is appended and validated.

### 2. Weather Forecast API Endpoint
```http
GET https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto
```
- **Purpose:** Fetches current meteorological variables and 7-day daily forecasts in a single payload.

---

## 🛠️ Tech Stack

- **Framework:** React 19 / TypeScript
- **Styling:** Tailwind CSS (Modern modular utility-first styling)
- **Icons:** Lucide React
- **Build Tool:** Vite
- **HTTP Client:** Native browser `fetch()` API with `AbortController`
- **Fallback Version:** Standalone zero-dependency vanilla HTML5 / CSS3 / ES6+ JavaScript implementation (`/weatherpulse`)

---

## 🚀 Getting Started & Installation

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn or pnpm

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/weatherpulse.git
   cd weatherpulse
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Run type-checking and linter:**
   ```bash
   npm run lint
   ```

---

## 📂 File Structure

```text
├── index.html                   # Production HTML5 Entry Point
├── metadata.json                # Project configuration metadata
├── package.json                 # Project dependencies & build scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration
│
├── src/                         # React + TypeScript Implementation
│   ├── main.tsx                 # React application root
│   ├── App.tsx                  # Main dashboard coordinator & state manager
│   ├── index.css                # Global stylesheet with Tailwind CSS
│   ├── types/
│   │   └── weather.ts           # TypeScript interfaces for API responses & state
│   ├── services/
│   │   └── weatherApi.ts        # Open-Meteo REST API client & error handling
│   ├── utils/
│   │   └── weatherCodes.ts      # WMO condition mapper & unit converters
│   └── components/
│       ├── Header.tsx           # Navigation bar, unit toggle & scope selector
│       ├── SearchBar.tsx        # Search input, quick chips & disambiguation
│       ├── CurrentWeatherCard.tsx # Hero weather card with refresh & coordinates
│       ├── WeatherMetricsGrid.tsx# Atmospheric parameter cards (Humidity, Wind, etc.)
│       ├── ForecastSection.tsx  # 7-day forecast cards with thermal bars
│       ├── WeatherIcon.tsx      # SVG weather condition iconography
│       ├── LoadingSkeleton.tsx  # Layout-stable loading shimmer cards
│       ├── ErrorMessage.tsx     # Non-blocking actionable error alert
│       ├── ApiInspectorModal.tsx# Technical REST API payload inspector
│       └── Footer.tsx           # Attribution & technical specifications
│
└── weatherpulse/                # Standalone Vanilla HTML/CSS/JS Implementation
    ├── index.html               # Plain HTML5 dashboard
    ├── style.css                # Pure responsive CSS3 styling
    └── script.js                # Vanilla ES6+ asynchronous REST API integration
```

---

## ⚙️ Asynchronous Data Flow & Error Handling

```text
[ User Action: Search City or Quick-Access Button ]
                     │
                     ▼
       [ Input Validation Check ]
         ├─ Empty/Spaces ──> Display Inline Warning
         └─ Valid String
                     │
                     ▼
     [ Cancel Prior Request via AbortController ]
                     │
                     ▼
  [ Step 1: Open-Meteo Geocoding REST Request ]
         ├─ HTTP Failure ──> Throw HTTP_ERROR
         ├─ 0 Results ─────> Throw CITY_NOT_FOUND
         └─ Results Found
                     │
                     ▼
        [ Disambiguation Evaluation ]
         ├─ Multiple candidate matches ──> Display City/State Selector
         └─ Exact unambiguous match
                     │
                     ▼
   [ Step 2: Open-Meteo Forecast REST Request ]
         ├─ HTTP Failure ──> Throw HTTP_ERROR
         └─ Success ───────> Parse Current & Daily Metrics
                     │
                     ▼
         [ WMO Code Interpretation ]
                     │
                     ▼
[ Update UI Dashboard & Timestamp ] ──> [ finally: Reset Loading Spinners ]
```

---

## 🧪 Testing & Verification Checklist

- [x] **Strict Country Scoping:** Verified India mode strictly filters results to `country_code === "IN"`.
- [x] **No Silent Guessing:** When multiple cities match a query (e.g., *Delhi* across multiple states), the disambiguation UI prompts for the exact city and state.
- [x] **Verified Locations:** Tested live queries for **Pune** (18.52°N, 73.86°E), **Mumbai** (19.07°N, 72.88°E), and **New Delhi** (28.62°N, 77.21°E).
- [x] **Manual Refresh:** Verified the refresh button re-fetches latest readings from Open-Meteo and updates the timestamp without reloading.
- [x] **Unit Toggle:** Switching between °C and °F updates every on-screen temperature consistently.
- [x] **Network Resilience:** Simulated offline and network timeouts display actionable retry alerts while keeping the previous valid weather dashboard visible.
- [x] **Responsive Viewports:** Tested and confirmed across mobile (375px), tablet (768px), and desktop (1280px+).

---

## 📜 Data Attribution & License

- **Meteorological Data:** Powered by [Open-Meteo](https://open-meteo.com/) under the Creative Commons Attribution 4.0 International (CC BY 4.0) license.
- **License:** Open Source under the Apache 2.0 License.
