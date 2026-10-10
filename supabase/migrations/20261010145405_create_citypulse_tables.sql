/*
# Create CityPulse core tables (single-tenant, no auth)

1. New Tables
- `saved_events`: Stores bookmarked events discovered through SerpApi search.
  - `id` (text, primary key) — stable hash-based ID generated client-side
  - `title` (text, not null) — event title
  - `date` (text, nullable) — event date string from SerpApi
  - `time` (text, nullable) — event time string
  - `venue` (text, nullable) — venue name
  - `address` (text, nullable) — venue address
  - `description` (text, nullable) — event description snippet
  - `thumbnail` (text, nullable) — image URL
  - `link` (text, nullable) — primary event/source URL
  - `ticket_link` (text, nullable) — ticket purchase URL
  - `source` (text, nullable) — original source URL
  - `saved_at` (bigint, not null) — epoch milliseconds when bookmarked
  - `created_at` (timestamptz, default now) — row creation timestamp
- `search_history`: Records user search queries for rerun and history viewing.
  - `id` (text, primary key) — unique ID generated client-side
  - `query` (text, not null) — search query text
  - `city` (text, not null) — city searched in
  - `mode` (text, not null) — "events" or "places"
  - `timestamp` (bigint, not null) — epoch milliseconds when search ran
  - `created_at` (timestamptz, default now)
- `user_preferences`: Stores a single row of user preferences for personalization.
  - `id` (int, primary key, always 1) — singleton row
  - `preferred_city` (text, nullable) — default city
  - `favorite_categories` (jsonb, default '[]') — array of category names
  - `interests` (text, nullable) — free-text interests
  - `preferred_date_range` (text, default 'any') — date filter preference
  - `updated_at` (timestamptz, default now)

2. Security
- All three tables have RLS enabled.
- Policies allow anon + authenticated full CRUD because this is a no-auth,
  single-tenant app where all data is intentionally shared/public.
- `USING (true)` is documented as intentional for this public-data app.

3. Indexes
- `saved_events` on `saved_at` DESC (recent-first listing)
- `search_history` on `timestamp` DESC (recent-first listing)
*/

CREATE TABLE IF NOT EXISTS saved_events (
  id text PRIMARY KEY,
  title text NOT NULL,
  date text,
  time text,
  venue text,
  address text,
  description text,
  thumbnail text,
  link text,
  ticket_link text,
  source text,
  saved_at bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS search_history (
  id text PRIMARY KEY,
  query text NOT NULL,
  city text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('events', 'places')),
  timestamp bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  preferred_city text,
  favorite_categories jsonb DEFAULT '[]'::jsonb,
  interests text,
  preferred_date_range text DEFAULT 'any',
  updated_at timestamptz DEFAULT now()
);

-- Indexes for efficient recent-first queries
CREATE INDEX IF NOT EXISTS idx_saved_events_saved_at ON saved_events (saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON search_history (timestamp DESC);

-- Enable RLS on all tables
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- saved_events policies (no-auth app: anon + authenticated, intentionally public)
DROP POLICY IF EXISTS "anon_select_saved_events" ON saved_events;
CREATE POLICY "anon_select_saved_events" ON saved_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_saved_events" ON saved_events;
CREATE POLICY "anon_insert_saved_events" ON saved_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_saved_events" ON saved_events;
CREATE POLICY "anon_update_saved_events" ON saved_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_saved_events" ON saved_events;
CREATE POLICY "anon_delete_saved_events" ON saved_events FOR DELETE
  TO anon, authenticated USING (true);

-- search_history policies
DROP POLICY IF EXISTS "anon_select_search_history" ON search_history;
CREATE POLICY "anon_select_search_history" ON search_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_search_history" ON search_history;
CREATE POLICY "anon_insert_search_history" ON search_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_search_history" ON search_history;
CREATE POLICY "anon_update_search_history" ON search_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_search_history" ON search_history;
CREATE POLICY "anon_delete_search_history" ON search_history FOR DELETE
  TO anon, authenticated USING (true);

-- user_preferences policies
DROP POLICY IF EXISTS "anon_select_user_preferences" ON user_preferences;
CREATE POLICY "anon_select_user_preferences" ON user_preferences FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_user_preferences" ON user_preferences;
CREATE POLICY "anon_insert_user_preferences" ON user_preferences FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_user_preferences" ON user_preferences;
CREATE POLICY "anon_update_user_preferences" ON user_preferences FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_user_preferences" ON user_preferences;
CREATE POLICY "anon_delete_user_preferences" ON user_preferences FOR DELETE
  TO anon, authenticated USING (true);
