import { useState, useCallback, useEffect } from "react";
import { Search, MapPin, Inbox, Compass } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { PlaceCard } from "@/components/PlaceCard";
import { ErrorState, EmptyState, LoadingGrid, ResultsHeader } from "@/components/States";
import { cityPulseSearch } from "@/lib/api";
import { PLACE_CATEGORIES, PLACE_CATEGORY_QUERIES, type PlaceResult, type UserPreferences } from "@/lib/types";
import { getPreferences } from "@/lib/storage";

interface PlacesPageProps {
  initialQuery?: string;
  initialCity?: string;
}

export function PlacesPage({ initialQuery = "", initialCity = "" }: PlacesPageProps) {
  const [prefs, setPrefs] = useState<UserPreferences>({ preferredCity: "", favoriteCategories: [], interests: "", preferredDateRange: "any" });
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceResult[] | null>(null);
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

  const performSearch = useCallback(async (searchQuery: string, searchCity: string) => {
    if (!searchQuery.trim() || !searchCity.trim()) return;

    setLoading(true);
    setError(null);
    setIsSetupError(false);
    setResults(null);

    try {
      const response = await cityPulseSearch({
        mode: "places",
        query: searchQuery,
        city: searchCity,
      });
      setResults(response.results as PlaceResult[]);
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
  }, []);

  const handleSearch = () => {
    const effectiveQuery = selectedCategory
      ? `${PLACE_CATEGORY_QUERIES[selectedCategory] || selectedCategory} ${query}`.trim()
      : query;
    performSearch(effectiveQuery || selectedCategory || "places", city);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    const baseQuery = newCategory
      ? PLACE_CATEGORY_QUERIES[newCategory] || newCategory
      : query;
    const searchCity = city || prefs.preferredCity || "Jaipur";
    if (searchCity) {
      performSearch(baseQuery, searchCity);
    }
  };

  const handleRetry = () => {
    const effectiveQuery = selectedCategory
      ? `${PLACE_CATEGORY_QUERIES[selectedCategory] || selectedCategory} ${query}`.trim()
      : query;
    performSearch(effectiveQuery || "places", city);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-navy-900">Nearby Places</h1>
        <p className="mt-2 text-navy-500">
          Discover cafes, restaurants, coworking spaces, venues, and attractions — powered by live Google Maps results.
        </p>
      </div>

      {/* Search inputs */}
      <div className="card p-6">
        <div className="flex flex-col gap-3 lg:flex-row">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            placeholder="Search places (e.g. cafes near event venues...)"
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
          <p className="mb-2 text-sm font-medium text-navy-600">Place categories</p>
          <div className="flex flex-wrap gap-2">
            {PLACE_CATEGORIES.map((cat) => (
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
      </div>

      {/* Map-style info banner */}
      {!hasSearched && !loading && (
        <div className="rounded-2xl bg-gradient-to-br from-navy-50 to-violet-50 p-6 ring-1 ring-navy-100">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-navy-900">
                Location-based discovery
              </h3>
              <p className="mt-1 text-sm text-navy-500">
                Search for places by category and city. Results include real names, addresses,
                ratings, reviews, and links to Google Maps — all from live Google Maps data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && <LoadingGrid count={6} variant="place" />}

      {!loading && error && (
        <ErrorState message={error} onRetry={handleRetry} isSetupError={isSetupError} />
      )}

      {!loading && !error && results && results.length > 0 && (
        <>
          <ResultsHeader
            count={results.length}
            query={searchedQuery}
            city={searchedCity}
            source="serpapi google maps"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((place, i) => (
              <div
                key={i}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <PlaceCard place={place} />
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && hasSearched && results && results.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No places found"
          description={`No place results were returned for "${searchedQuery}" in ${searchedCity}. Try a different category or city.`}
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
          icon={MapPin}
          title="Start exploring places"
          description="Enter a place type and city above to discover nearby locations from live Google Maps data."
        />
      )}
    </div>
  );
}
