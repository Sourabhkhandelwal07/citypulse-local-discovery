import { AlertCircle, RefreshCw, Settings } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  isSetupError?: boolean;
}

export function ErrorState({ message, onRetry, isSetupError }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-navy-100 animate-scale-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">
        {isSetupError ? "Setup Required" : "Something went wrong"}
      </h3>
      <p className="mt-2 max-w-md text-sm text-navy-500">{message}</p>
      <div className="mt-5 flex gap-3">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
        {isSetupError && (
          <a
            href="https://supabase.com/dashboard/project/_/settings/functions"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <Settings className="h-4 w-4" />
            Configure Secret
          </a>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-navy-100 animate-scale-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
        {Icon ? <Icon className="h-8 w-8 text-violet-400" /> : null}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-navy-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface LoadingGridProps {
  count?: number;
  variant?: "event" | "place";
}

export function LoadingGrid({ count = 6, variant = "event" }: LoadingGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card overflow-hidden"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className={`skeleton ${variant === "event" ? "h-44" : "h-32"}`} />
          <div className="p-5 space-y-3">
            <div className="skeleton h-5 w-3/4 rounded-lg" />
            <div className="skeleton h-4 w-1/2 rounded-lg" />
            <div className="skeleton h-4 w-2/3 rounded-lg" />
            <div className="flex gap-2 pt-2">
              <div className="skeleton h-9 flex-1 rounded-lg" />
              <div className="skeleton h-9 w-12 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ResultsHeaderProps {
  count: number;
  query: string;
  city: string;
  source?: string;
}

export function ResultsHeader({ count, query, city, source }: ResultsHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-slide-down">
      <div>
        <h2 className="font-display text-xl font-bold text-navy-900">
          {count > 0 ? `${count} result${count !== 1 ? "s" : ""} found` : "No results"}
        </h2>
        <p className="text-sm text-navy-500">
          {query} in {city}
          {source && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">
              {source.replace(/_/g, " ")}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
