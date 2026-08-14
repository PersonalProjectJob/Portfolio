-- ==============================================================================
-- Portfolio Admin CMS & UTM Engine - Initial Schema Migration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SITE SETTINGS (Singleton configuration table)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  skills JSONB NOT NULL DEFAULT '{}'::jsonb,
  experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  process JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo_defaults JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CONTENT ENTRIES (Case studies, standalone pages)
CREATE TABLE IF NOT EXISTS content_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  route TEXT NOT NULL,
  title JSONB NOT NULL DEFAULT '{"en":"","vi":""}'::jsonb,
  summary JSONB NOT NULL DEFAULT '{"en":"","vi":""}'::jsonb,
  category TEXT NOT NULL DEFAULT 'Product Design',
  role TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  render_mode TEXT NOT NULL CHECK (render_mode IN ('legacy', 'builder', 'markdown', 'pdf_deck')) DEFAULT 'builder',
  legacy_key TEXT,
  template_key TEXT DEFAULT 'standard',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  graph_config JSONB DEFAULT '{}'::jsonb,
  seo JSONB DEFAULT '{}'::jsonb,
  draft_document JSONB DEFAULT '{"schemaVersion":1,"blocks":[]}'::jsonb,
  published_document JSONB DEFAULT '{"schemaVersion":1,"blocks":[]}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CONTENT VERSIONS (Historical snapshots for rollback)
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES content_entries(id) ON DELETE CASCADE,
  version INT NOT NULL,
  snapshot JSONB NOT NULL,
  publish_note TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- 4. MEDIA ASSETS (Media Library records)
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  width INT,
  height INT,
  alt_text JSONB NOT NULL DEFAULT '{"en":"","vi":""}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TRACKING LINKS (UTM Distribution Engine)
CREATE TABLE IF NOT EXISTS tracking_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  destination_path TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT,
  utm_content TEXT,
  clicks_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. ROUTE ALIASES (301/302 redirects for slug changes)
CREATE TABLE IF NOT EXISTS route_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  old_path TEXT UNIQUE NOT NULL,
  target_path TEXT NOT NULL,
  status INT NOT NULL DEFAULT 301,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_content_entries_slug ON content_entries(slug);
CREATE INDEX IF NOT EXISTS idx_content_entries_status ON content_entries(status);
CREATE INDEX IF NOT EXISTS idx_tracking_links_slug ON tracking_links(slug);
CREATE INDEX IF NOT EXISTS idx_content_versions_entry ON content_versions(entry_id);

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_site_settings_updated
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER trg_content_entries_updated
BEFORE UPDATE ON content_entries
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER trg_tracking_links_updated
BEFORE UPDATE ON tracking_links
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_aliases ENABLE ROW LEVEL SECURITY;

-- Anonymous users (Public Web): Read-only access to published content & settings
CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read published content entries"
  ON content_entries FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Public can read media assets"
  ON media_assets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read active tracking links"
  ON tracking_links FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Public can read route aliases"
  ON route_aliases FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated Admin: Full CRUD access
CREATE POLICY "Admin full access site_settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access content_entries"
  ON content_entries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access content_versions"
  ON content_versions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access media_assets"
  ON media_assets FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access tracking_links"
  ON tracking_links FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access route_aliases"
  ON route_aliases FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
