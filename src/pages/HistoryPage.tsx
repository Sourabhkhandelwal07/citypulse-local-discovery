import { useState, useEffect } from "react";
import { History, Trash2, RotateCcw, MapPin, Calendar } from "lucide-react";
import { EmptyState } from "@/components/States";
import { getSearchHistory, clearSearchHistory } from "@/lib/storage";
import type { SearchHistoryEntry } from "@/lib/types";

interface HistoryPageProps {
  onRerunSearch: (entry: SearchHistoryEntry) => void;
  refreshKey?: number;
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function HistoryPage({ onRerunSearch, refreshKey = 0 }: HistoryPageProps) {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  const loadHistory = async () => {
    const data = await getSearchHistory();
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();
  }, [refreshKey]);

  const handleClear = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const handleRerun = (entry: SearchHistoryEntry) => {
    onRerunSearch(entry);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-900">Search History</h1>
          <p className="mt-2 text-navy-500">
            Your recent searches — rerun any search or clear your history.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </button>
        )}
      </div>

      {/* Empty state */}
      {history.length === 0 && (
        <EmptyState
          icon={History}
          title="No search history yet"
          description="Your searches will appear here. You can rerun any previous search with a single click."
        />
      )}

      {/* History list */}
      {history.length > 0 && (
        <div className="space-y-3">
          {history.map((entry, i) => {
            const isEvent = entry.mode === "events";
            const Icon = isEvent ? Calendar : MapPin;
            return (
              <div
                key={entry.id}
                className="card flex items-center gap-4 p-4 animate-slide-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isEvent ? "bg-violet-50 text-violet-600" : "bg-accent-50 text-accent-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-navy-900 truncate">{entry.query}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        isEvent
                          ? "bg-violet-50 text-violet-600"
                          : "bg-accent-50 text-accent-600"
                      }`}
                    >
                      {isEvent ? "Events" : "Places"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-navy-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {entry.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <History className="h-3 w-3" />
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRerun(entry)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-navy-50 px-3 py-2 text-sm font-medium text-navy-600 transition-all hover:bg-violet-50 hover:text-violet-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Rerun</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
