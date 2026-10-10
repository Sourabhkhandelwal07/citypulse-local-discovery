export interface EventResult {
  title: string;
  date: string | null;
  time: string | null;
  venue: string | null;
  address: string | null;
  description: string | null;
  thumbnail: string | null;
  link: string | null;
  ticket_link: string | null;
  source: string | null;
}

export interface PlaceResult {
  name: string;
  address: string | null;
  rating: number | null;
  reviews: number | null;
  category: string | null;
  website: string | null;
  phone: string | null;
  maps_url: string | null;
  thumbnail: string | null;
}

export type SearchMode = "events" | "places";

export interface SearchResponse {
  mode: SearchMode;
  query: string;
  city: string;
  results: EventResult[] | PlaceResult[];
  source: string;
}

export interface ErrorResponse {
  error: string;
  setup_required?: boolean;
}

export interface SavedEvent extends EventResult {
  id: string;
  savedAt: number;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  city: string;
  mode: SearchMode;
  timestamp: number;
}

export interface UserPreferences {
  preferredCity: string;
  favoriteCategories: string[];
  interests: string;
  preferredDateRange: string;
}

export const EVENT_CATEGORIES = [
  "Technology & Hackathons",
  "Workshops",
  "College Events",
  "Music & Concerts",
  "Festivals",
  "Startups & Networking",
  "Arts & Culture",
  "Sports",
  "Other Events",
] as const;

export const PLACE_CATEGORIES = [
  "Cafes",
  "Restaurants",
  "Coworking Spaces",
  "Event Venues",
  "Tourist Attractions",
  "Libraries",
  "Study Spaces",
  "Other Local Places",
] as const;

export const CATEGORY_QUERIES: Record<string, string> = {
  "Technology & Hackathons": "tech events hackathons",
  Workshops: "workshops",
  "College Events": "college events",
  "Music & Concerts": "music concerts",
  Festivals: "festivals",
  "Startups & Networking": "startup meetups networking",
  "Arts & Culture": "arts culture exhibitions",
  Sports: "sports events",
  "Other Events": "events",
};

export const PLACE_CATEGORY_QUERIES: Record<string, string> = {
  Cafes: "cafes",
  Restaurants: "restaurants",
  "Coworking Spaces": "coworking spaces",
  "Event Venues": "event venues",
  "Tourist Attractions": "tourist attractions",
  Libraries: "libraries",
  "Study Spaces": "study spaces",
  "Other Local Places": "places",
};
