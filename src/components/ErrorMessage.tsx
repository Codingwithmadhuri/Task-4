import React from 'react';
import { AlertTriangle, RefreshCw, XCircle, WifiOff, FileQuestion } from 'lucide-react';
import { WeatherAppError } from '../services/weatherApi';

interface ErrorMessageProps {
  error: Error | WeatherAppError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  const isAppError = error instanceof WeatherAppError;
  const errorCode = isAppError ? error.code : 'UNKNOWN';

  const getErrorPresentation = () => {
    switch (errorCode) {
      case 'CITY_NOT_FOUND':
        return {
          icon: FileQuestion,
          title: 'Location Not Found',
          advice: 'Please double-check your city spelling or try a major neighboring city name.',
          color: 'text-amber-400',
          borderColor: 'border-amber-500/40',
          bgColor: 'bg-amber-500/10',
        };
      case 'NETWORK_ERROR':
        return {
          icon: WifiOff,
          title: 'Network Communication Error',
          advice: 'Unable to reach Open-Meteo REST endpoints. Please check your internet connectivity or firewall rules.',
          color: 'text-rose-400',
          borderColor: 'border-rose-500/40',
          bgColor: 'bg-rose-500/10',
        };
      case 'EMPTY_INPUT':
        return {
          icon: AlertTriangle,
          title: 'Empty Query',
          advice: 'Please enter a valid city name in the search bar.',
          color: 'text-sky-400',
          borderColor: 'border-sky-500/40',
          bgColor: 'bg-sky-500/10',
        };
      case 'HTTP_ERROR':
        return {
          icon: XCircle,
          title: `REST API Error ${isAppError && error.statusCode ? `(${error.statusCode})` : ''}`,
          advice: 'The public weather service returned an unexpected HTTP status code. Try again in a few moments.',
          color: 'text-rose-400',
          borderColor: 'border-rose-500/40',
          bgColor: 'bg-rose-500/10',
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Request Failed',
          advice: 'An error occurred while fetching or parsing meteorological data.',
          color: 'text-rose-400',
          borderColor: 'border-rose-500/40',
          bgColor: 'bg-rose-500/10',
        };
    }
  };

  const { icon: Icon, title, advice, color, borderColor, bgColor } = getErrorPresentation();

  return (
    <div
      role="alert"
      className={`rounded-2xl border ${borderColor} ${bgColor} p-5 md:p-6 shadow-lg transition-all`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 ${color} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold ${color}`}>
              {title}
            </h3>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded hover:bg-slate-800/50 transition-colors"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            )}
          </div>

          <p className="text-sm text-slate-200 font-medium">
            {error.message}
          </p>

          <p className="text-xs text-slate-400">
            {advice}
          </p>

          {onRetry && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                Retry Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
