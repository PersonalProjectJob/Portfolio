-- Migration: 20260903_tighten_admin_rls.sql
-- Tighten Row Level Security (RLS) to enforce true admin authorization.
-- Restricts CRUD access to authorized admin email or app_metadata role.

-- 1. Helper function to verify admin status
CREATE OR REPLACE FUNCTION is_portfolio_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() ->> 'email') = 'tnsthao94@gmail.com'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop over-permissive policies
DROP POLICY IF EXISTS "Admin full access site_settings" ON site_settings;
DROP POLICY IF EXISTS "Admin full access content_entries" ON content_entries;
DROP POLICY IF EXISTS "Admin full access content_versions" ON content_versions;
DROP POLICY IF EXISTS "Admin full access media_assets" ON media_assets;
DROP POLICY IF EXISTS "Admin full access tracking_links" ON tracking_links;
DROP POLICY IF EXISTS "Admin full access route_aliases" ON route_aliases;

-- 3. Create strictly authenticated Admin CRUD policies
CREATE POLICY "Admin full access site_settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (is_portfolio_admin())
  WITH CHECK (is_portfolio_admin());

CREATE POLICY "Admin full access content_entries"
  ON content_entries FOR ALL
  TO authenticated
  USING (is_portfolio_admin())
  WITH CHECK (is_portfolio_admin());

CREATE POLICY "Admin full access content_versions"
  ON content_versions FOR ALL
  TO authenticated
  USING (is_portfolio_admin())
  WITH CHECK (is_portfolio_admin());

CREATE POLICY "Admin full access media_assets"
  ON media_assets FOR ALL
  TO authenticated
  USING (is_portfolio_admin())
  WITH CHECK (is_portfolio_admin());

CREATE POLICY "Admin full access tracking_links"
  ON tracking_links FOR ALL
  TO authenticated
  USING (is_portfolio_admin())
  WITH CHECK (is_portfolio_admin());

CREATE POLICY "Admin full access route_aliases"
  ON route_aliases FOR ALL
  TO authenticated
  USING (is_portfolio_admin())
  WITH CHECK (is_portfolio_admin());

-- 4. Supabase Storage Bucket Security for 'portfolio-assets'
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view assets
CREATE POLICY "Public read portfolio assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'portfolio-assets');

-- Admin can upload/mutate assets
CREATE POLICY "Admin mutate portfolio assets"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'portfolio-assets' AND is_portfolio_admin())
  WITH CHECK (bucket_id = 'portfolio-assets' AND is_portfolio_admin());

-- 5. Safe telemetry click counter function
-- SECURITY DEFINER allows public redirects to increment click counters safely
CREATE OR REPLACE FUNCTION increment_tracking_click(p_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_new_clicks INTEGER;
BEGIN
  UPDATE tracking_links
  SET clicks_count = COALESCE(clicks_count, 0) + 1,
      updated_at = NOW()
  WHERE LOWER(slug) = LOWER(p_slug) AND is_active = true
  RETURNING clicks_count INTO v_new_clicks;

  RETURN COALESCE(v_new_clicks, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_tracking_click(TEXT) TO anon, authenticated;
