import { EDGE_FUNCTION_URL } from "./supabaseClient";
import { addSearchHistory } from "./storage";
import type { ErrorResponse, SearchMode, SearchResponse } from "./types";

interface SearchParams {
  mode: SearchMode;
  query: string;
  city: string;
  location?: string;
}

export async function cityPulseSearch(params: SearchParams): Promise<SearchResponse> {
  const { mode, query, city, location } = params;

  if (!query.trim()) {
    throw new Error("Please enter a search query.");
  }
  if (!city.trim()) {
    throw new Error("Please enter a city.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Attach anon key for auth if available
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (anonKey) {
    headers["Authorization"] = `Bearer ${anonKey}`;
  }

  let response: Response;
  try {
    response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ mode, query, city, location }),
    });
  } catch {
    throw new Error("Network error — could not reach the search service. Please check your connection and try again.");
  }

  const data: SearchResponse | ErrorResponse = await response.json().catch(() => ({
    error: "Invalid response from search service.",
  }));

  if (!response.ok) {
    const errorData = data as ErrorResponse;
    if (errorData.setup_required) {
      throw new Error(
        "The search service is not yet configured. The SERP_API_KEY secret needs to be added to the backend. See the README for setup instructions."
      );
    }
    throw new Error(errorData.error || `Search failed (status ${response.status}).`);
  }

  const result = data as SearchResponse;

  // Record in search history (fire-and-forget, no await needed)
  void addSearchHistory({
    id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    query,
    city,
    mode,
    timestamp: Date.now(),
  });

  return result;
}
