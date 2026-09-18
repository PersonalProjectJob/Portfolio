-- ==============================================================================
-- Portfolio Admin CMS: First-Party UX Telemetry & Post Views Schema Migration
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. POST VIEWS TABLE
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  landing_variant TEXT DEFAULT 'B',
  device_type TEXT NOT NULL,
  referrer TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. UX SESSIONS TABLE
CREATE TABLE IF NOT EXISTS ux_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  page_slug TEXT NOT NULL,
  device_type TEXT NOT NULL,
  viewport_width INT NOT NULL,
  viewport_height INT NOT NULL,
  entry_path TEXT NOT NULL,
  referrer TEXT,
  total_duration_ms INT NOT NULL DEFAULT 0,
  max_scroll_depth INT NOT NULL DEFAULT 0,
  reader_type TEXT NOT NULL DEFAULT 'skimmer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. UX EVENTS TABLE (Section Dwell & Friction Events)
CREATE TABLE IF NOT EXISTS ux_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  section_id TEXT NOT NULL,
  section_order INT NOT NULL DEFAULT 0,
  dwell_time_ms INT NOT NULL DEFAULT 0,
  interacted BOOLEAN DEFAULT false,
  event_type TEXT NOT NULL DEFAULT 'section_dwell',
  click_count INT DEFAULT 1,
  target_tag TEXT,
  target_selector TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. UX DAILY ROLLUPS (Executive Daily Summaries at 00:01)
CREATE TABLE IF NOT EXISTS ux_daily_rollups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_string TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  project_name TEXT NOT NULL,
  total_readers INT NOT NULL DEFAULT 0,
  avg_dwell_seconds INT NOT NULL DEFAULT 0,
  completion_rate INT NOT NULL DEFAULT 0,
  ux_grade TEXT NOT NULL DEFAULT 'B',
  friction_alerts_count INT NOT NULL DEFAULT 0,
  skimmer_pct INT NOT NULL DEFAULT 0,
  scanner_pct INT NOT NULL DEFAULT 0,
  deep_reader_pct INT NOT NULL DEFAULT 0,
  rollup_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date_string, page_slug)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_post_views_project ON post_views(project_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_ux_sessions_slug ON ux_sessions(page_slug, created_at);
CREATE INDEX IF NOT EXISTS idx_ux_events_session_section ON ux_events(session_token, section_id);
CREATE INDEX IF NOT EXISTS idx_ux_daily_rollups_date ON ux_daily_rollups(date_string, page_slug);

-- Enable Row Level Security (RLS)
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE ux_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ux_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ux_daily_rollups ENABLE ROW LEVEL SECURITY;

-- Anonymous readers: Insert telemetry and view rollups
CREATE POLICY "Public can insert post_views" ON post_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can insert ux_sessions" ON ux_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update own ux_sessions" ON ux_sessions FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public can insert ux_events" ON ux_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update own ux_events" ON ux_events FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Public can read post_views" ON post_views FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read ux_sessions" ON ux_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read ux_events" ON ux_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read ux_daily_rollups" ON ux_daily_rollups FOR SELECT TO anon, authenticated USING (true);

-- Authenticated Admin: Full CRUD access
CREATE POLICY "Admin full access post_views" ON post_views FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access ux_sessions" ON ux_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access ux_events" ON ux_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access ux_daily_rollups" ON ux_daily_rollups FOR ALL TO authenticated USING (true) WITH CHECK (true);
