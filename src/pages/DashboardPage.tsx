import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Bookmark,
  History,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Compass,
  Clock,
} from "lucide-react";
import type { PageId } from "@/components/Sidebar";
import { getSavedEvents, getSearchHistory, getPreferences } from "@/lib/storage";
import type { SearchHistoryEntry, SavedEvent, UserPreferences } from "@/lib/types";

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onRerunSearch: (entry: SearchHistoryEntry) => void;
  refreshKey?: number;
}

export function DashboardPage({ onNavigate, onRerunSearch, refreshKey = 0 }: DashboardPageProps) {
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>({ preferredCity: "", favoriteCategories: [], interests: "", preferredDateRange: "any" });

  useEffect(() => {
    let active = true;
    (async () => {
      const [events, hist, preferences] = await Promise.all([
        getSavedEvents(),
        getSearchHistory(),
        getPreferences(),
      ]);
      if (active) {
        setSavedEvents(events);
        setHistory(hist);
        setPrefs(preferences);
      }
    })();
    return () => { active = false; };
  }, [refreshKey]);

  const recentSearches = history.slice(0, 5);
  const recentEvents = savedEvents.slice(0, 3);

  const stats = [
    {
      label: "Saved Events",
      value: savedEvents.length,
      icon: Bookmark,
      color: "violet",
      action: () => onNavigate("saved"),
    },
    {
      label: "Searches",
      value: history.length,
      icon: History,
      color: "accent",
      action: () => onNavigate("history"),
    },
    {
      label: "Favorite Categories",
      value: prefs.favoriteCategories.length,
      icon: Sparkles,
      color: "navy",
      action: () => onNavigate("preferences"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-navy-900">Dashboard</h1>
        <p className="mt-2 text-navy-500">
          Your discovery overview — all counts come from your actual data.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses: Record<string, string> = {
            violet: "bg-violet-50 text-violet-600",
            accent: "bg-accent-50 text-accent-600",
            navy: "bg-navy-100 text-navy-600",
          };
          return (
            <button
              key={stat.label}
              onClick={stat.action}
              className="card flex items-center gap-4 p-5 text-left hover:-translate-y-1 hover:shadow-glow"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[stat.color]}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-navy-900">{stat.value}</div>
                <div className="text-sm text-navy-500">{stat.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Search Events", icon: Calendar, page: "events" as PageId, color: "violet" },
          { label: "Find Places", icon: MapPin, page: "places" as PageId, color: "accent" },
          { label: "Ask CityPulse", icon: Sparkles, page: "ask" as PageId, color: "navy" },
          { label: "Set Preferences", icon: Compass, page: "preferences" as PageId, color: "violet" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => onNavigate(action.page)}
              className="card group flex flex-col items-center gap-3 p-6 hover:-translate-y-1 hover:shadow-glow"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${action.color}-50 text-${action.color}-600 transition-colors group-hover:bg-${action.color}-600 group-hover:text-white`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-navy-700">{action.label}</span>
              <ArrowRight className="h-4 w-4 text-navy-300 transition-transform group-hover:translate-x-1" />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent searches */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy-900">Recent Searches</h2>
            <button
              onClick={() => onNavigate("history")}
              className="text-sm font-medium text-violet-600 hover:underline"
            >
              View all
            </button>
          </div>
          {recentSearches.length > 0 ? (
            <div className="mt-4 space-y-2">
              {recentSearches.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onRerunSearch(entry)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:bg-violet-50"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      entry.mode === "events" ? "bg-violet-50 text-violet-600" : "bg-accent-50 text-accent-600"
                    }`}
                  >
                    {entry.mode === "events" ? <Calendar className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">{entry.query}</p>
                    <p className="text-xs text-navy-400">{entry.city}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-navy-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-navy-50 p-6 text-center">
              <Clock className="mx-auto h-8 w-8 text-navy-300" />
              <p className="mt-2 text-sm text-navy-500">No searches yet. Start exploring!</p>
            </div>
          )}
        </div>

        {/* Recently discovered */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy-900">Recently Saved</h2>
            <button
              onClick={() => onNavigate("saved")}
              className="text-sm font-medium text-violet-600 hover:underline"
            >
              View all
            </button>
          </div>
          {recentEvents.length > 0 ? (
            <div className="mt-4 space-y-2">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-xl p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">{event.title}</p>
                    <p className="text-xs text-navy-400 truncate">
                      {event.date || event.venue || "No date"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-navy-50 p-6 text-center">
              <Bookmark className="mx-auto h-8 w-8 text-navy-300" />
              <p className="mt-2 text-sm text-navy-500">No saved events yet. Bookmark events to see them here!</p>
            </div>
          )}
        </div>
      </div>

      {/* Favorite categories */}
      {prefs.favoriteCategories.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-navy-900">Your Favorite Categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {prefs.favoriteCategories.map((cat) => (
              <span key={cat} className="chip chip-active">
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
