import { supabase } from "./supabaseClient";
import type { SavedEvent, SearchHistoryEntry, UserPreferences } from "./types";

// ---- Saved Events ----

export async function getSavedEvents(): Promise<SavedEvent[]> {
  const { data, error } = await supabase
    .from("saved_events")
    .select("*")
    .order("saved_at", { ascending: false });

  if (error) return [];
  return (data || []).map(rowToSavedEvent);
}

export async function saveEvent(event: SavedEvent): Promise<void> {
  const { error } = await supabase.from("saved_events").insert({
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    venue: event.venue,
    address: event.address,
    description: event.description,
    thumbnail: event.thumbnail,
    link: event.link,
    ticket_link: event.ticket_link,
    source: event.source,
    saved_at: event.savedAt,
  });
  if (error) return;
}

export async function removeSavedEvent(id: string): Promise<void> {
  const { error } = await supabase.from("saved_events").delete().eq("id", id);
  if (error) return;
}

export async function isEventSaved(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("saved_events")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (error) return false;
  return data !== null;
}

function rowToSavedEvent(row: Record<string, unknown>): SavedEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    date: (row.date as string) ?? null,
    time: (row.time as string) ?? null,
    venue: (row.venue as string) ?? null,
    address: (row.address as string) ?? null,
    description: (row.description as string) ?? null,
    thumbnail: (row.thumbnail as string) ?? null,
    link: (row.link as string) ?? null,
    ticket_link: (row.ticket_link as string) ?? null,
    source: (row.source as string) ?? null,
    savedAt: row.saved_at as number,
  };
}

export function generateEventId(event: {
  title: string;
  date: string | null;
  venue: string | null;
  link: string | null;
}): string {
  const parts = [event.title, event.date ?? "", event.venue ?? "", event.link ?? ""];
  const str = parts.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `evt_${Math.abs(hash).toString(36)}`;
}

// ---- Search History ----

export async function getSearchHistory(): Promise<SearchHistoryEntry[]> {
  const { data, error } = await supabase
    .from("search_history")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data || []).map(rowToHistoryEntry);
}

export async function addSearchHistory(entry: SearchHistoryEntry): Promise<void> {
  // Avoid exact consecutive duplicates
  const recent = await getSearchHistory();
  if (
    recent.length > 0 &&
    recent[0].query === entry.query &&
    recent[0].city === entry.city &&
    recent[0].mode === entry.mode
  ) {
    return;
  }

  const { error } = await supabase.from("search_history").insert({
    id: entry.id,
    query: entry.query,
    city: entry.city,
    mode: entry.mode,
    timestamp: entry.timestamp,
  });
  if (error) return;
}

export async function clearSearchHistory(): Promise<void> {
  const { error } = await supabase.from("search_history").delete().neq("id", "");
  if (error) return;
}

function rowToHistoryEntry(row: Record<string, unknown>): SearchHistoryEntry {
  return {
    id: row.id as string,
    query: row.query as string,
    city: row.city as string,
    mode: row.mode as SearchHistoryEntry["mode"],
    timestamp: row.timestamp as number,
  };
}

// ---- User Preferences ----

const DEFAULT_PREFERENCES: UserPreferences = {
  preferredCity: "",
  favoriteCategories: [],
  interests: "",
  preferredDateRange: "any",
};

export async function getPreferences(): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return DEFAULT_PREFERENCES;
  return {
    preferredCity: (data.preferred_city as string) ?? "",
    favoriteCategories: Array.isArray(data.favorite_categories)
      ? (data.favorite_categories as string[])
      : [],
    interests: (data.interests as string) ?? "",
    preferredDateRange: (data.preferred_date_range as string) ?? "any",
  };
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  const { error } = await supabase
    .from("user_preferences")
    .upsert({
      id: 1,
      preferred_city: prefs.preferredCity,
      favorite_categories: prefs.favoriteCategories,
      interests: prefs.interests,
      preferred_date_range: prefs.preferredDateRange,
      updated_at: new Date().toISOString(),
    });

  if (error) return;
}
