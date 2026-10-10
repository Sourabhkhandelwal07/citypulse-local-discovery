import { useState, useEffect } from "react";
import { Settings, Save, Check, MapPin, Sparkles, Calendar } from "lucide-react";
import { getPreferences, savePreferences } from "@/lib/storage";
import type { UserPreferences } from "@/lib/types";
import { EVENT_CATEGORIES } from "@/lib/types";

const DATE_RANGES = [
  { value: "any", label: "Anytime" },
  { value: "this weekend", label: "This Weekend" },
  { value: "this month", label: "This Month" },
  { value: "next month", label: "Next Month" },
];

export function PreferencesPage() {
  const [prefs, setPrefs] = useState<UserPreferences>({ preferredCity: "", favoriteCategories: [], interests: "", preferredDateRange: "any" });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPreferences().then((p) => {
      if (active) {
        setPrefs(p);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const handleCityChange = (value: string) => {
    setPrefs({ ...prefs, preferredCity: value });
    setSaved(false);
  };

  const handleInterestsChange = (value: string) => {
    setPrefs({ ...prefs, interests: value });
    setSaved(false);
  };

  const handleDateRangeChange = (value: string) => {
    setPrefs({ ...prefs, preferredDateRange: value });
    setSaved(false);
  };

  const toggleCategory = (category: string) => {
    const categories = prefs.favoriteCategories.includes(category)
      ? prefs.favoriteCategories.filter((c: string) => c !== category)
      : [...prefs.favoriteCategories, category];
    setPrefs({ ...prefs, favoriteCategories: categories });
    setSaved(false);
  };

  const handleSave = async () => {
    await savePreferences(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-900">Preferences</h1>
          <p className="mt-2 text-navy-500">Loading your preferences...</p>
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-navy-900">Preferences</h1>
        <p className="mt-2 text-navy-500">
          Customize your discovery experience. Your preferences are saved to the cloud and used to personalize your searches.
        </p>
      </div>

      {/* Preferred city */}
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-navy-900">Preferred City</h2>
            <p className="text-sm text-navy-500">Pre-fill your city in search forms.</p>
          </div>
        </div>
        <input
          type="text"
          value={prefs.preferredCity}
          onChange={(e) => handleCityChange(e.target.value)}
          placeholder="e.g. Jaipur"
          className="input-field mt-4 max-w-xs"
        />
      </div>

      {/* Favorite categories */}
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-navy-900">Favorite Categories</h2>
            <p className="text-sm text-navy-500">Select categories to highlight in your discovery.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`chip ${prefs.favoriteCategories.includes(cat) ? "chip-active" : "chip-inactive"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-navy-900">Interests</h2>
            <p className="text-sm text-navy-500">Describe your interests for personalized search suggestions.</p>
          </div>
        </div>
        <textarea
          value={prefs.interests}
          onChange={(e) => handleInterestsChange(e.target.value)}
          placeholder="e.g. I enjoy coding, AI, startup events, and live music..."
          rows={3}
          className="input-field mt-4 resize-none"
        />
      </div>

      {/* Preferred date range */}
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-navy-900">Preferred Date Range</h2>
            <p className="text-sm text-navy-500">Default date filter for event searches.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => handleDateRangeChange(range.value)}
              className={`chip ${prefs.preferredDateRange === range.value ? "chip-active" : "chip-inactive"}`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Personalized suggestions preview */}
      {(prefs.preferredCity || prefs.favoriteCategories.length > 0) && (
        <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-navy-50 p-6 ring-1 ring-violet-100">
          <h3 className="font-display text-base font-semibold text-navy-900">
            Personalized Search Suggestions
          </h3>
          <p className="mt-1 text-sm text-navy-500">
            Based on your preferences, try these searches:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {prefs.favoriteCategories.length > 0 ? (
              prefs.favoriteCategories.slice(0, 5).map((cat: string) => (
                <span key={cat} className="chip chip-active">
                  {cat} {prefs.preferredCity && `in ${prefs.preferredCity}`}
                </span>
              ))
            ) : (
              <span className="chip chip-inactive">
                Events {prefs.preferredCity && `in ${prefs.preferredCity}`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="btn-primary">
          {saved ? (
            <>
              <Check className="h-5 w-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
