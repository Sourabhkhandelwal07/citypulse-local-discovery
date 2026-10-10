# CityPulse — Discover What's Happening Around You

**Tagline:** Find events. Explore places. Experience your city.

CityPulse is a local events and discovery platform that helps students, young professionals, visitors, and local residents find events and nearby places in their city through one simple interface. It combines live event discovery and nearby-place discovery powered by SerpApi.

## Project Overview

CityPulse lets users discover hackathons, college events, workshops, concerts, festivals, meetups, technology conferences, exhibitions, and other activities. Users can also discover nearby cafes, event venues, attractions, and relevant places using location-based search.

### Problem Statement

Finding local events and nearby places typically requires visiting multiple websites, apps, and social media pages. CityPulse solves this by providing a single interface for both event discovery and nearby-place discovery, powered by real Google Search and Google Maps data through SerpApi.

### Intended Users

- Students looking for hackathons, workshops, and college events
- Young professionals seeking networking and startup meetups
- Visitors exploring a new city's attractions and venues
- Local residents wanting to discover events happening around them

## Main Features

- **Event Discovery** — Search for events by category, city, and date range with real Google Search results
- **Nearby Places** — Find cafes, restaurants, coworking spaces, venues, and attractions via Google Maps
- **Ask CityPulse** — Natural-language search with transparent rule-based intent detection that routes queries to event or place search
- **Saved Events** — Bookmark events to localStorage; they persist across page refreshes
- **Search History** — View, rerun, and clear previous searches
- **Personalized Preferences** — Save preferred city, favorite categories, interests, and date range
- **Dashboard** — Concise overview with real counts from localStorage data
- **Responsive Design** — Works on desktop, tablet, and mobile

## Architecture

```
CityPulse/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx        # Navigation sidebar (desktop + mobile drawer)
│   │   ├── EventCard.tsx      # Event result card with save/bookmark
│   │   ├── PlaceCard.tsx      # Place result card with Maps link
│   │   ├── SearchBar.tsx      # Reusable search input
│   │   └── States.tsx         # Error, empty, loading states + results header
│   ├── pages/
│   │   ├── LandingPage.tsx    # Homepage with hero, categories, how-it-works
│   │   ├── EventsPage.tsx     # Event discovery with filters
│   │   ├── PlacesPage.tsx     # Nearby places discovery
│   │   ├── AskPage.tsx        # Natural-language search with intent detection
│   │   ├── SavedPage.tsx      # Saved events from localStorage
│   │   ├── HistoryPage.tsx    # Search history from localStorage
│   │   ├── DashboardPage.tsx  # Discovery dashboard
│   │   └── PreferencesPage.tsx # User preferences
│   ├── lib/
│   │   ├── types.ts           # TypeScript types and constants
│   │   ├── supabaseClient.ts  # Supabase client setup
│   │   ├── storage.ts         # localStorage utilities (saved events, history, prefs)
│   │   └── api.ts             # Edge function API caller
│   ├── App.tsx                # Main app with page routing
│   ├── main.tsx               # React entry point
│   └── index.css              # Tailwind + custom styles
├── supabase/
│   ├── config.toml            # Edge function configuration
│   └── functions/
│       └── citypulse-search/
│           └── index.ts       # SerpApi proxy edge function
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS with custom CityPulse design system
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Backend:** Bolt Cloud / Supabase Edge Functions (Deno runtime)
- **API:** SerpApi Google Search + Google Maps APIs

## SerpApi Integration

### Event Search Workflow (Google Search)

The edge function calls SerpApi's Google Search endpoint:

```
GET https://serpapi.com/search.json?engine=google&q=<query>+in+<city>&api_key=<secret>
```

It parses the `events_results` array returned by Google Search, extracting:
- Event title, date, time
- Venue name and address
- Description
- Thumbnail
- Event/source URL
- Ticket information when available

If `events_results` is empty, organic search results are used as fallback context.

### Nearby Places Workflow (Google Maps)

The edge function calls SerpApi's Google Maps endpoint:

```
GET https://serpapi.com/search.json?engine=google_maps&type=search&q=<query>+in+<city>&api_key=<secret>
```

It parses `local_results` or `places_results`, extracting:
- Place name, address
- Rating and review count
- Category
- Website and phone
- Google Maps URL (constructed from GPS coordinates or place_id)

### Secure Backend Configuration

The `SERP_API_KEY` secret is stored server-side in Supabase Edge Functions secrets and is never exposed to the frontend. The edge function reads it via `Deno.env.get("SERP_API_KEY")` and includes it only in the server-to-SerpApi request.

The frontend calls the edge function at:
```
POST {SUPABASE_URL}/functions/v1/citypulse-search
Body: { "mode": "events" | "places", "query": "...", "city": "..." }
```

The edge function:
- Validates mode, query, and city
- Constructs SerpApi requests safely
- Returns normalized JSON
- Handles missing API keys, upstream errors, empty results, and network failures
- Implements CORS headers on all responses
- Never returns the private API key to the frontend

## Required Environment Variables

### Frontend (in `.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (pre-populated) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (pre-populated) |

### Backend (Supabase Edge Function Secrets)

| Secret | Description |
|--------|-------------|
| `SERP_API_KEY` | Your SerpApi API key (set in Supabase dashboard under Edge Functions secrets) |

**Note:** Never put `SERP_API_KEY` in a `VITE_` variable — it would be exposed to the browser.

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd citypulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure `.env` contains your Supabase URL and anon key (pre-populated in Bolt projects).

4. Set the `SERP_API_KEY` secret in Supabase:
   - Go to your Supabase dashboard → Edge Functions → Secrets
   - Add a secret named `SERP_API_KEY` with your SerpApi API key value
   - Get a SerpApi key at [https://serpapi.com](https://serpapi.com)

5. Deploy the edge function (handled automatically in Bolt; manually via Supabase MCP tools or dashboard).

## Run and Build Commands

```bash
# Development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Production build
npm run build

# Preview production build
npm run preview
```

## Deployment Steps

This project is deployed on Bolt Cloud:

1. The edge function `citypulse-search` is deployed via Supabase MCP tools.
2. The frontend builds to static assets served by Bolt.
3. Ensure `SERP_API_KEY` is configured in the Supabase project's Edge Function secrets.

## Screenshots

(Screenshots will be added after deployment — the app features a clean light interface with deep navy typography, vibrant violet accents, rounded event cards, and smooth micro-interactions.)

## AI Tools Disclosure

This project was built using Bolt (bolt.new), an AI-powered web development platform. The application code, edge function, and documentation were generated through iterative AI assistance. The SerpApi integration provides real, live data — no AI-generated content is presented as search results.

## License

This project is built for the Open Innovation track and is hackathon-ready.
