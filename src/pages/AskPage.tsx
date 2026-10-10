import { useState, useCallback } from "react";
import { Sparkles, Search, ArrowRight, Calendar, MapPin, Inbox } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { EventCard } from "@/components/EventCard";
import { PlaceCard } from "@/components/PlaceCard";
import { ErrorState, EmptyState, LoadingGrid, ResultsHeader } from "@/components/States";
import { cityPulseSearch } from "@/lib/api";
import type { EventResult, PlaceResult, SearchMode } from "@/lib/types";

interface DetectedIntent {
  mode: SearchMode;
  city: string;
  query: string;
  category: string;
}

const EVENT_KEYWORDS = [
  "event", "events", "hackathon", "hackathons", "workshop", "workshops",
  "concert", "concerts", "festival", "festivals", "meetup", "meetups",
  "conference", "conference", "college event", "college fest", "startup event",
  "networking event", "music", "gig", "show", "exhibition", "expo",
  "seminar", "webinar", "talk", "panel", "competition", "contest",
  "tech event", "coding", "sports event", "match", "tournament",
];

const PLACE_KEYWORDS = [
  "cafe", "cafes", "restaurant", "restaurants", "coworking", "coworking space",
  "coworking spaces", "venue", "venues", "event venue", "event venues",
  "tourist", "attraction", "attractions", "tourist attraction", "tourist attractions",
  "library", "libraries", "study space", "study spot", "bar", "pub", "pubs",
  "hotel", "hotels", "mall", "malls", "park", "parks", "gym", "gyms",
  "coffee shop", "coffee", "place", "places", "near", "nearby", "around",
];

const EXAMPLE_QUERIES = [
  "Find tech events in Jaipur this weekend",
  "Show hackathons in Delhi",
  "Find cafes near event venues in Jaipur",
  "Discover startup meetups in Bengaluru",
  "Find coworking spaces near me",
  "Music concerts in Mumbai",
];

// Extract city from query
const KNOWN_CITIES = [
  "Jaipur", "Delhi", "Mumbai", "Bengaluru", "Bangalore", "Hyderabad",
  "Pune", "Chennai", "Kolkata", "Ahmedabad", "Surat", "Jaipur",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal", "Patna",
  "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
];

function detectCity(query: string): string {
  const lowerQuery = query.toLowerCase();
  for (const city of KNOWN_CITIES) {
    if (lowerQuery.includes(city.toLowerCase())) {
      return city;
    }
  }
  return "";
}

function detectMode(query: string): SearchMode {
  const lowerQuery = query.toLowerCase();
  const hasEventKeyword = EVENT_KEYWORDS.some((kw) => lowerQuery.includes(kw));
  const hasPlaceKeyword = PLACE_KEYWORDS.some((kw) => lowerQuery.includes(kw));

  // If both match, prefer events (per spec: events first, places separately)
  if (hasEventKeyword) return "events";
  if (hasPlaceKeyword) return "places";
  // Default to events
  return "events";
}

function detectCategory(query: string, mode: SearchMode): string {
  const lowerQuery = query.toLowerCase();
  if (mode === "events") {
    if (lowerQuery.includes("hackathon")) return "Technology & Hackathons";
    if (lowerQuery.includes("workshop")) return "Workshops";
    if (lowerQuery.includes("concert") || lowerQuery.includes("music") || lowerQuery.includes("gig")) return "Music & Concerts";
    if (lowerQuery.includes("festival")) return "Festivals";
    if (lowerQuery.includes("startup") || lowerQuery.includes("meetup") || lowerQuery.includes("networking")) return "Startups & Networking";
    if (lowerQuery.includes("college")) return "College Events";
    if (lowerQuery.includes("art") || lowerQuery.includes("culture") || lowerQuery.includes("exhibition")) return "Arts & Culture";
    if (lowerQuery.includes("sport")) return "Sports";
    return "Other Events";
  } else {
    if (lowerQuery.includes("cafe") || lowerQuery.includes("coffee")) return "Cafes";
    if (lowerQuery.includes("restaurant")) return "Restaurants";
    if (lowerQuery.includes("coworking")) return "Coworking Spaces";
    if (lowerQuery.includes("venue")) return "Event Venues";
    if (lowerQuery.includes("tourist") || lowerQuery.includes("attraction")) return "Tourist Attractions";
    if (lowerQuery.includes("library")) return "Libraries";
    if (lowerQuery.includes("study")) return "Study Spaces";
    return "Other Local Places";
  }
}

function extractSearchQuery(query: string, mode: SearchMode, city: string): string {
  let cleaned = query;
  // Remove "find", "show", "discover", "search for" prefixes
  cleaned = cleaned.replace(/^(find|show|discover|search for|get me|look for|i want to find|tell me about)\s+/i, "");
  // Remove city
  if (city) {
    cleaned = cleaned.replace(new RegExp(`\\b${city}\\b`, "gi"), "");
  }
  // Remove "in", "near", "near me", "around", "this weekend", "this month"
  cleaned = cleaned.replace(/\b(in|near|near me|around|this weekend|this month|next month|today|tomorrow)\b/gi, "");
  // Clean up
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    // Fallback: use the whole query minus city
    cleaned = query.replace(new RegExp(`\\b${city}\\b`, "gi"), "").trim() || (mode === "events" ? "events" : "places");
  }
  return cleaned;
}

export function AskPage() {
  const [input, setInput] = useState("");
  const [city, setCity] = useState("");
  const [detectedIntent, setDetectedIntent] = useState<DetectedIntent | null>(null);
  const [results, setResults] = useState<EventResult[] | PlaceResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSetupError, setIsSetupError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (intent: DetectedIntent) => {
    setLoading(true);
    setError(null);
    setIsSetupError(false);
    setResults(null);

    try {
      const response = await cityPulseSearch({
        mode: intent.mode,
        query: intent.query,
        city: intent.city,
      });
      setResults(response.results);
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
    if (!input.trim()) return;

    let detectedCity = detectCity(input);
    if (!detectedCity && city.trim()) {
      detectedCity = city.trim();
    }
    if (!detectedCity) {
      setError("Please specify a city in your query or enter one in the city field.");
      return;
    }

    const mode = detectMode(input);
    const category = detectCategory(input, mode);
    const searchQuery = extractSearchQuery(input, mode, detectedCity);

    const intent: DetectedIntent = {
      mode,
      city: detectedCity,
      query: searchQuery,
      category,
    };

    setDetectedIntent(intent);
    performSearch(intent);
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    const detectedCity = detectCity(example);
    if (detectedCity) setCity(detectedCity);
    const mode = detectMode(example);
    const category = detectCategory(example, mode);
    const searchQuery = extractSearchQuery(example, mode, detectedCity || city);

    const intent: DetectedIntent = {
      mode,
      city: detectedCity || city,
      query: searchQuery,
      category,
    };

    setDetectedIntent(intent);
    performSearch(intent);
  };

  const handleRetry = () => {
    if (detectedIntent) performSearch(detectedIntent);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-glow">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl font-bold text-navy-900">
          What are you looking for?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-navy-500">
          Ask in natural language. CityPulse detects whether you're searching for events or nearby places and routes your query accordingly.
        </p>
      </div>

      {/* Search inputs */}
      <div className="card mx-auto max-w-3xl p-6">
        <SearchBar
          value={input}
          onChange={setInput}
          onSubmit={handleSearch}
          placeholder="e.g. Find tech events in Jaipur this weekend"
          autoFocus
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Or enter city manually (optional if mentioned in query)"
              className="input-field pl-12"
            />
          </div>
          <button onClick={handleSearch} disabled={loading} className="btn-primary sm:w-auto">
            <Search className="h-5 w-5" />
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Example queries */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-navy-600">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                className="chip chip-inactive text-xs"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detected intent display */}
      {detectedIntent && (
        <div className="mx-auto max-w-3xl rounded-2xl bg-violet-50 p-5 ring-1 ring-violet-100 animate-slide-down">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-navy-600">Query:</span>
              <span className="text-sm text-navy-900">"{input}"</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-navy-700 ring-1 ring-navy-200">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              Detected: {detectedIntent.mode === "events" ? "Events" : "Nearby Places"}
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-navy-700 ring-1 ring-navy-200">
              <Calendar className="h-3.5 w-3.5 text-violet-600" />
              Category: {detectedIntent.category}
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-navy-700 ring-1 ring-navy-200">
              <MapPin className="h-3.5 w-3.5 text-violet-600" />
              City: {detectedIntent.city}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="mx-auto max-w-5xl">
          <LoadingGrid count={6} variant={detectedIntent?.mode === "places" ? "place" : "event"} />
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto max-w-3xl">
          <ErrorState message={error} onRetry={handleRetry} isSetupError={isSetupError} />
        </div>
      )}

      {!loading && !error && results && results.length > 0 && detectedIntent && (
        <div className="mx-auto max-w-5xl">
          <ResultsHeader
            count={results.length}
            query={detectedIntent.query}
            city={detectedIntent.city}
            source={detectedIntent.mode === "events" ? "serpapi google search" : "serpapi google maps"}
          />
          {detectedIntent.mode === "events" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(results as EventResult[]).map((event, i) => (
                <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(results as PlaceResult[]).map((place, i) => (
                <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <PlaceCard place={place} />
                </div>
              ))}
            </div>
          )}
          {/* Hint for combined queries */}
          {detectedIntent.mode === "events" && (
            <div className="mt-8 rounded-xl bg-navy-50 p-5 text-center">
              <p className="text-sm text-navy-600">
                Looking for nearby places instead?{" "}
                <button
                  onClick={() => {
                    const placeIntent: DetectedIntent = {
                      ...detectedIntent,
                      mode: "places",
                      query: `places near ${detectedIntent.city}`,
                      category: "Other Local Places",
                    };
                    setDetectedIntent(placeIntent);
                    performSearch(placeIntent);
                  }}
                  className="font-medium text-violet-600 hover:underline"
                >
                  Search nearby places in {detectedIntent.city}
                  <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                </button>
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && !error && hasSearched && results && results.length === 0 && (
        <div className="mx-auto max-w-3xl">
          <EmptyState
            icon={Inbox}
            title="No results found"
            description="Your query didn't return any live results. Try rephrasing or using a different city."
            action={
              <button onClick={handleRetry} className="btn-primary">
                <Search className="h-4 w-4" />
                Try Again
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
