import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Zap,
  Globe,
  ShieldCheck,
  Bookmark,
  Clock,
  Compass,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { PageId } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { EVENT_CATEGORIES, PLACE_CATEGORIES, type UserPreferences } from "@/lib/types";
import { getPreferences } from "@/lib/storage";

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
  onQuickSearch: (query: string, city: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Technology & Hackathons": Zap,
  Workshops: Sparkles,
  "College Events": Calendar,
  "Music & Concerts": MusicIcon,
  Festivals: Globe,
  "Startups & Networking": Compass,
  "Arts & Culture": Globe,
  Sports: Zap,
  "Other Events": Calendar,
};

function MusicIcon({ className }: { className?: string }) {
  return <Calendar className={className} />;
}

const POPULAR_CITIES = ["Jaipur", "Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Pune"];

export function LandingPage({ onNavigate, onQuickSearch }: LandingPageProps) {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [prefs, setPrefs] = useState<UserPreferences>({ preferredCity: "", favoriteCategories: [], interests: "", preferredDateRange: "any" });

  useEffect(() => {
    let active = true;
    getPreferences().then((p) => {
      if (active) setPrefs(p);
    });
    return () => { active = false; };
  }, []);

  const handleExploreEvents = () => {
    if (query.trim() && city.trim()) {
      onQuickSearch(query, city);
    } else {
      onNavigate("events");
    }
  };

  const handleDiscoverPlaces = () => {
    onNavigate("places");
  };

  const handleCityClick = (cityName: string) => {
    setCity(cityName);
    if (query.trim()) {
      onQuickSearch(query, cityName);
    } else {
      onNavigate("events");
    }
  };

  const handleCategoryClick = (category: string) => {
    onQuickSearch(category, city || prefs.preferredCity || "Jaipur");
  };

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-navy-50" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-navy-200/30 blur-3xl" />

        <div className="relative px-6 pt-16 pb-20 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
              <Sparkles className="h-4 w-4" />
              Powered by SerpApi — Live Google Search & Maps
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-navy-900 sm:text-5xl lg:text-6xl">
              Your City. Your Next Experience.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-600">
              Discover events, workshops, hackathons, concerts, and nearby places worth exploring.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSubmit={handleExploreEvents}
                placeholder="Search events, hackathons, concerts..."
                className="flex-1"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleExploreEvents();
                }}
                placeholder="City (e.g. Jaipur)"
                className="input-field sm:w-48"
              />
              <button onClick={handleExploreEvents} className="btn-primary sm:w-auto">
                <Search className="h-5 w-5" />
                Search
              </button>
            </div>

            {/* Popular cities */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-navy-400">Popular:</span>
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCityClick(c)}
                  className="chip chip-inactive text-xs"
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <button onClick={handleExploreEvents} className="btn-primary flex-1">
              <Calendar className="h-5 w-5" />
              Explore Events
            </button>
            <button onClick={handleDiscoverPlaces} className="btn-secondary flex-1">
              <MapPin className="h-5 w-5" />
              Discover Nearby Places
            </button>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-2xl font-bold text-navy-900">
            Popular Categories
          </h2>
          <p className="mt-2 text-center text-navy-500">
            Find exactly what you're looking for — from hackathons to music festivals.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {EVENT_CATEGORIES.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat] || Calendar;
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleCategoryClick(cat)}
                  className="card group flex items-center gap-4 p-5 text-left hover:-translate-y-1 hover:shadow-glow"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-colors duration-200 group-hover:bg-violet-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-navy-900">{cat}</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-navy-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-violet-600" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-2xl font-bold text-navy-900">
            How CityPulse Works
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Search",
                desc: "Enter what you're looking for and your city. CityPulse sends a live query through SerpApi.",
              },
              {
                icon: Sparkles,
                title: "Discover",
                desc: "Get real event listings from Google Search or nearby places from Google Maps — no fake data.",
              },
              {
                icon: Bookmark,
                title: "Save & Explore",
                desc: "Bookmark events for later, find nearby places, and revisit your search history anytime.",
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-glow">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-navy-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-navy-500">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SerpApi section */}
      <section className="px-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 p-8 text-white shadow-card lg:p-12">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-500 shadow-glow">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold">Powered by SerpApi</h2>
              <p className="mt-3 text-navy-200">
                CityPulse uses SerpApi's Google Search API to find real events — hackathons,
                concerts, workshops, and more — and Google Maps API to discover nearby cafes,
                venues, and attractions. All results are live, real, and sourced from Google.
              </p>
              <div className="mt-5 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-navy-200">
                  <ShieldCheck className="h-4 w-4 text-violet-400" />
                  Secure backend — API key never exposed
                </div>
                <div className="flex items-center gap-2 text-sm text-navy-200">
                  <Clock className="h-4 w-4 text-violet-400" />
                  Real-time results
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby places preview */}
      <section className="px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy-900">
                Discover Nearby Places
              </h2>
              <p className="mt-2 text-navy-500">
                Find cafes, restaurants, coworking spaces, and attractions near you.
              </p>
            </div>
            <button
              onClick={() => onNavigate("places")}
              className="btn-ghost hidden sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PLACE_CATEGORIES.slice(0, 4).map((cat, i) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => onNavigate("places")}
                className="card group flex flex-col items-center gap-3 p-6 hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-colors duration-200 group-hover:bg-violet-600 group-hover:text-white">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-navy-700">{cat}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-violet-600 to-violet-800 p-10 text-center text-white shadow-glow lg:p-16">
          <h2 className="font-display text-3xl font-bold">
            Ready to explore your city?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-violet-100">
            Start discovering events and places around you — no sign-up required.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => onNavigate("events")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-violet-700 shadow-soft transition-all hover:bg-violet-50 active:scale-95"
            >
              <Calendar className="h-5 w-5" />
              Explore Events
            </button>
            <button
              onClick={() => onNavigate("ask")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white ring-1 ring-white/30 transition-all hover:bg-violet-400 active:scale-95"
            >
              <Sparkles className="h-5 w-5" />
              Ask CityPulse
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
