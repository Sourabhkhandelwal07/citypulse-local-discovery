/*
 * CityPulse Search Edge Function
 *
 * Proxies SerpApi Google Search (events) and Google Maps (nearby places) requests.
 * The SERP_API_KEY secret is read server-side and never exposed to the frontend.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPPORTED_MODES = ["events", "places"] as const;
type SearchMode = (typeof SUPPORTED_MODES)[number];

interface SearchRequest {
  mode: SearchMode;
  query: string;
  city?: string;
  location?: string;
}

interface NormalizedEvent {
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

interface NormalizedPlace {
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildQuery(query: string, city?: string, location?: string): string {
  const parts: string[] = [];
  if (query) parts.push(query.trim());
  const loc = (location || city || "").trim();
  if (loc) parts.push(loc);
  return parts.join(" in ").trim();
}

function parseEventsResults(data: Record<string, unknown>): NormalizedEvent[] {
  const events = data.events_results as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(events)) return [];

  return events.map((evt): NormalizedEvent => {
    const dateObj = evt.date as Record<string, unknown> | undefined;
    const startDate = dateObj?.start_date as string | undefined;
    const when = evt.when as string | undefined;
    const timeStr = evt.time as string | undefined;

    const venueObj = evt.venue as Record<string, unknown> | undefined;
    const venueName = (venueObj?.name as string | undefined) ?? null;
    const venueAddress = (venueObj?.address as string | undefined) ?? null;

    const thumbnailObj = evt.thumbnail as string | Record<string, unknown> | undefined;
    const thumbnail =
      typeof thumbnailObj === "string"
        ? thumbnailObj
        : ((thumbnailObj as Record<string, unknown>)?.url as string | undefined) ?? null;

    const link = (evt.link as string | undefined) ?? null;
    const ticketInfo = evt.ticket_info as Array<Record<string, unknown>> | undefined;
    const ticketLink =
      Array.isArray(ticketInfo) && ticketInfo.length > 0
        ? (ticketInfo[0].link as string | undefined) ?? null
        : null;

    const desc = evt.description as string | undefined;

    return {
      title: (evt.title as string | undefined) ?? "Untitled event",
      date: startDate ?? when ?? null,
      time: timeStr ?? null,
      venue: venueName,
      address: venueAddress,
      description: desc ?? null,
      thumbnail: thumbnail ?? null,
      link: link ?? ticketLink,
      ticket_link: ticketLink,
      source: link ?? null,
    };
  });
}

function parsePlacesResults(data: Record<string, unknown>): NormalizedPlace[] {
  // Google Maps engine returns results under "place_results" (single) or "local_results" (array)
  const localResults = data.local_results as Array<Record<string, unknown>> | undefined;
  const placesResults = data.places_results as Array<Record<string, unknown>> | undefined;
  const placeResultSingle = data.place_results as Record<string, unknown> | undefined;

  let results: Array<Record<string, unknown>> = [];
  if (Array.isArray(localResults)) results = localResults;
  else if (Array.isArray(placesResults)) results = placesResults;
  else if (placeResultSingle) results = [placeResultSingle];

  return results.map((place): NormalizedPlace => {
    const gps = place.gps_coordinates as Record<string, unknown> | undefined;
    const type = place.type as string | undefined;
    const categoryStr = Array.isArray(type) ? type.join(", ") : (type ?? null);

    const rating = place.rating as number | undefined;
    const reviews = place.reviews as number | undefined;

    const photos = place.photos as Array<Record<string, unknown>> | undefined;
    const thumbnail =
      Array.isArray(photos) && photos.length > 0
        ? (photos[0].photo_url as string | undefined) ?? null
        : null;

    const website = place.website as string | undefined;
    const phone = place.phone as string | undefined;

    // Build a maps URL
    let mapsUrl: string | null = null;
    if (gps) {
      const lat = gps.latitude as number | undefined;
      const lng = gps.longitude as number | undefined;
      if (lat !== undefined && lng !== undefined) {
        mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      }
    }
    if (!mapsUrl) {
      const placeId = place.place_id as string | undefined;
      if (placeId) {
        mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
      }
    }
    if (!mapsUrl) {
      const name = (place.title as string | undefined) ?? "";
      const addr = (place.address as string | undefined) ?? "";
      if (name || addr) {
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${addr}`)}`;
      }
    }

    return {
      name: (place.title as string | undefined) ?? "Unknown place",
      address: (place.address as string | undefined) ?? null,
      rating: rating !== undefined ? rating : null,
      reviews: reviews !== undefined ? reviews : null,
      category: categoryStr,
      website: website ?? null,
      phone: phone ?? null,
      maps_url: mapsUrl,
      thumbnail: thumbnail ?? null,
    };
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed. Use POST." }, 405);
  }

  try {
    const body: SearchRequest = await req.json();

    // Validate mode
    const mode = body.mode as SearchMode;
    if (!SUPPORTED_MODES.includes(mode)) {
      return jsonResponse(
        { error: `Invalid search mode. Supported modes: ${SUPPORTED_MODES.join(", ")}` },
        400
      );
    }

    // Validate query
    const query = body.query?.trim();
    if (!query || query.length < 2) {
      return jsonResponse({ error: "A search query of at least 2 characters is required." }, 400);
    }

    // Validate city
    const city = body.city?.trim();
    if (!city || city.length < 2) {
      return jsonResponse({ error: "A city of at least 2 characters is required." }, 400);
    }

    // Read API key from environment (server-side secret)
    const apiKey = Deno.env.get("SERP_API_KEY");
    if (!apiKey) {
      return jsonResponse(
        {
          error:
            "SERP_API_KEY secret is not configured. Add it in the Supabase dashboard under Edge Functions secrets.",
          setup_required: true,
        },
        500
      );
    }

    const fullQuery = buildQuery(query, city, body.location?.trim());

    // Build SerpApi request URL
    const params = new URLSearchParams();
    params.set("api_key", apiKey);

    if (mode === "events") {
      params.set("engine", "google");
      params.set("q", fullQuery);
    } else {
      params.set("engine", "google_maps");
      params.set("type", "search");
      params.set("q", fullQuery);
    }

    const serpApiUrl = `https://serpapi.com/search.json?${params.toString()}`;

    let serpResponse: Response;
    try {
      serpResponse = await fetch(serpApiUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
    } catch {
      return jsonResponse(
        { error: "Network error while contacting SerpApi. Please try again." },
        502
      );
    }

    if (!serpResponse.ok) {
      const errorText = await serpResponse.text();
      let errorMessage = `SerpApi returned status ${serpResponse.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) errorMessage = errorJson.error;
      } catch {
        if (errorText) errorMessage = errorText;
      }

      if (serpResponse.status === 429) {
        return jsonResponse(
          { error: "SerpApi rate limit reached. Please wait a moment and try again." },
          429
        );
      }
      return jsonResponse({ error: `SerpApi error: ${errorMessage}` }, serpResponse.status);
    }

    const serpData: Record<string, unknown> = await serpResponse.json();

    if (mode === "events") {
      const events = parseEventsResults(serpData);
      // Also include organic results for fallback context
      const organic = serpData.organic_results as Array<Record<string, unknown>> | undefined;
      const organicEvents: NormalizedEvent[] = Array.isArray(organic)
        ? organic.slice(0, 10).map((item): NormalizedEvent => ({
            title: (item.title as string | undefined) ?? "Untitled result",
            date: null,
            time: null,
            venue: null,
            address: null,
            description: (item.snippet as string | undefined) ?? null,
            thumbnail: null,
            link: (item.link as string | undefined) ?? null,
            ticket_link: null,
            source: (item.link as string | undefined) ?? null,
          }))
        : [];

      return jsonResponse({
        mode: "events",
        query: query,
        city: city,
        results: events.length > 0 ? events : organicEvents,
        source: "serpapi_google_search",
      });
    } else {
      const places = parsePlacesResults(serpData);
      return jsonResponse({
        mode: "places",
        query: query,
        city: city,
        results: places,
        source: "serpapi_google_maps",
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    return jsonResponse({ error: `Server error: ${message}` }, 500);
  }
});
