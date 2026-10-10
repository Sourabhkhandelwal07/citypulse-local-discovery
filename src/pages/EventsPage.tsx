import { useState, useCallback, useEffect } from "react";
import { Search, Calendar, MapPin, CalendarDays, CalendarRange, CalendarClock, Inbox } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { EventCard } from "@/components/EventCard";
import { ErrorState, EmptyState, LoadingGrid, ResultsHeader } from "@/components/States";
import { cityPulseSearch } from "@/lib/api";
import { EVENT_CATEGORIES, CATEGORY_QUERIES, type EventResult, type UserPreferences } from "@/lib/types";
import { getPreferences } from "@/lib/storage";

const DATE_SHORTCUTS = [
  { label: "Anytime", value: "", icon: Calendar },
  { label: "This Weekend", value: "this weekend", icon: CalendarDays },
  { label: "This Month", value: "this month", icon: CalendarRange },
  { label: "Next Month", value: "next month", icon: CalendarClock },
];

interface EventsPageProps {
  initialQuery?: string;
  initialCity?: string;
  onSavedChange?: () => void;
}

export function EventsPage({ initialQuery = "", initialCity = "", onSavedChange }: EventsPageProps) {
  const [prefs, setPrefs] = useState<UserPreferences>({ preferredCity: "", favoriteCategories: [], interests: "", preferredDateRange: "any" });
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateShortcut, setDateShortcut] = useState("");
  const [results, setResults] = useState<EventResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSetupError, setIsSetupError] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [searchedCity, setSearchedCity] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let active = true;
    getPreferences().then((p) => {
      if (active) {
        setPrefs(p);
        if (!initialCity && p.preferredCity) setCity(p.preferredCity);
      }
    });
    return () => { active = false; };
  }, [initialCity]);

  const performSearch = useCallback(
    async (searchQuery: string, searchCity: string) => {
      if (!searchQuery.trim() || !searchCity.trim()) return;

      setLoading(true);
      setError(null);
      setIsSetupError(false);
      setResults(null);

      try {
        const fullQuery = dateShortcut
          ? `${searchQuery} ${dateShortcut}`
          : searchQuery;
        const response = await cityPulseSearch({
          mode: "events",
          query: fullQuery,
          city: searchCity,
        });
        setResults(response.results as EventResult[]);
        setSearchedQuery(searchQuery);
        setSearchedCity(searchCity);
        setHasSearched(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Search failed.";
        setError(msg);
        setIsSetupError(msg.includes("SERP_API_KEY"));
      } finally {
        setLoading(false);
      }
    },
    [dateShortcut]
  );

  const handleSearch = () => {
    const effectiveQuery = selectedCategory
      ? `${CATEGORY_QUERIES[selectedCategory] || selectedCategory} ${query}`.trim()
      : query;
    performSearch(effectiveQuery || selectedCategory || "events", city);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    const baseQuery = newCategory
      ? CATEGORY_QUERIES[newCategory] || newCategory
      : query;
    const searchCity = city || prefs.preferredCity || "Jaipur";
    if (searchCity) {
      performSearch(baseQuery, searchCity);
    }
  };

  const handleRetry = () => {
    const effectiveQuery = selectedCategory
      ? `${CATEGORY_QUERIES[selectedCategory] || selectedCategory} ${query}`.trim()
      : query;
    performSearch(effectiveQuery || "events", city);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-navy-900">Event Discovery</h1>
        <p className="mt-2 text-navy-500">
          Find hackathons, concerts, workshops, festivals, and more — powered by live Google Search results.
        </p>
      </div>

      {/* Search inputs */}
      <div className="card p-6">
        <div className="flex flex-col gap-3 lg:flex-row">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            placeholder="Search events (e.g. hackathons, music concerts...)"
            className="flex-1"
          />
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="City (e.g. Jaipur)"
              className="input-field pl-12 lg:w-52"
            />
          </div>
          <button onClick={handleSearch} disabled={loading} className="btn-primary lg:w-auto">
            <Search className="h-5 w-5" />
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Category filters */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-navy-600">Categories</p>
          <div className="flex flex-wrap gap-2">
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`chip ${selectedCategory === cat ? "chip-active" : "chip-inactive"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Date shortcuts */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-navy-600">Date</p>
          <div className="flex flex-wrap gap-2">
            {DATE_SHORTCUTS.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <button
                  key={shortcut.value}
                  onClick={() => setDateShortcut(shortcut.value)}
                  className={`chip ${dateShortcut === shortcut.value ? "chip-active" : "chip-inactive"}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {shortcut.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && <LoadingGrid count={6} variant="event" />}

      {!loading && error && (
        <ErrorState message={error} onRetry={handleRetry} isSetupError={isSetupError} />
      )}

      {!loading && !error && results && results.length > 0 && (
        <>
          <ResultsHeader
            count={results.length}
            query={searchedQuery}
            city={searchedCity}
            source="serpapi google search"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((event, i) => (
              <div
                key={i}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <EventCard event={event} onSavedChange={onSavedChange} />
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && hasSearched && results && results.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No events found"
          description={`No live event results were returned for "${searchedQuery}" in ${searchedCity}. Try a different search term, category, or city.`}
          action={
            <button onClick={handleRetry} className="btn-primary">
              <Search className="h-4 w-4" />
              Try Again
            </button>
          }
        />
      )}

      {!loading && !error && !hasSearched && (
        <EmptyState
          icon={Calendar}
          title="Start your search"
          description="Enter a search query and city above to discover live events near you."
        />
      )}
    </div>
  );
}
