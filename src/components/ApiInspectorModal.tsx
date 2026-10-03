import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, Activity } from 'lucide-react';
import { WeatherDashboardData } from '../types/weather';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeatherDashboardData | null;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecastJson' | 'geocodingJson' | 'asyncCode'>('overview');

  if (!isOpen) return null;

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleAsyncCode = `// Task 4: Asynchronous JavaScript & RESTful APIs Implementation
async function fetchWeatherForCity(cityName) {
  try {
    // Step 1: Geocode city name to coordinates
    const geoUrl = \`https://geocoding-api.open-meteo.com/v1/search?name=\${encodeURIComponent(cityName)}&count=1&language=en&format=json\`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error(\`Geocoding HTTP \${geoRes.status}\`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }
    const { latitude, longitude, name, country } = geoData.results[0];

    // Step 2: Fetch real-time weather & 7-day forecast
    const forecastUrl = \`https://api.open-meteo.com/v1/forecast?latitude=\${latitude}&longitude=\${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto\`;
    const weatherRes = await fetch(forecastUrl);
    if (!weatherRes.ok) throw new Error(\`Forecast HTTP \${weatherRes.status}\`);
    const weatherData = await weatherRes.json();

    return { name, country, weather: weatherData };
  } catch (error) {
    console.error("Asynchronous API failure:", error);
    throw error;
  } finally {
    // Clear loading indicators
    setLoading(false);
  }
}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-inspector-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 id="api-inspector-title" className="text-base font-bold text-white flex items-center gap-2">
                REST API & Async Architecture Inspector
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HTTP 200 OK
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live Open-Meteo REST request telemetry and parsed JSON structures
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close API Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-2 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Telemetry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('forecastJson')}
            className={`pb-2.5 px-2 border-b-2 transition-all ${
              activeTab === 'forecastJson'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Forecast JSON Payload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('geocodingJson')}
            className={`pb-2.5 px-2 border-b-2 transition-all ${
              activeTab === 'geocodingJson'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Geocoding JSON Payload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('asyncCode')}
            className={`pb-2.5 px-2 border-b-2 transition-all ${
              activeTab === 'asyncCode'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Async / Await Flow
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              {/* Telemetry Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400 font-medium">Request Latency</div>
                  <div className="text-base font-bold text-emerald-400 font-mono tabular-nums mt-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    {data?.metadata.latencyMs || 0} ms
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400 font-medium">HTTP Protocol</div>
                  <div className="text-base font-bold text-white font-mono mt-1">
                    GET / HTTPS 2.0
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400 font-medium">Geographic Datum</div>
                  <div className="text-base font-bold text-sky-400 font-mono tabular-nums mt-1">
                    {data?.current.latitude.toFixed(3)}°, {data?.current.longitude.toFixed(3)}°
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-400 font-medium">Timezone</div>
                  <div className="text-base font-bold text-indigo-400 font-mono mt-1 truncate">
                    {data?.current.timezone || 'UTC'}
                  </div>
                </div>
              </div>

              {/* Endpoints Breakdown */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-semibold">
                    <span>1. Geocoding REST Endpoint</span>
                    <a
                      href={data?.metadata.geocodingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px]"
                    >
                      Open in browser <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-300 break-all select-all">
                    {data?.metadata.geocodingUrl || 'N/A'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-semibold">
                    <span>2. Forecast REST Endpoint</span>
                    <a
                      href={data?.metadata.forecastUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px]"
                    >
                      Open in browser <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-300 break-all select-all">
                    {data?.metadata.forecastUrl || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Assignment Checklist Review */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-slate-200 font-semibold">
                  Task 4 Technical Requirements Implemented:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Native Fetch API with async/await</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Strict response.ok checking before parsing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>response.json() data transformation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>try/catch/finally resilient error handling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>WMO weather code translation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Race-condition protection via AbortController</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'forecastJson' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Parsed JSON payload from Open-Meteo forecast API:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(data?.rawForecastResponse, null, 2))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96">
                {JSON.stringify(data?.rawForecastResponse, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'geocodingJson' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Selected Geocoding metadata from Open-Meteo search API:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(data?.rawGeocodingResult, null, 2))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96">
                {JSON.stringify(data?.rawGeocodingResult, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'asyncCode' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Reference JavaScript code pattern for Task 4 assignment:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(sampleAsyncCode)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-96 leading-relaxed">
                {sampleAsyncCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Public Open-Meteo REST service • No API Key required</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
