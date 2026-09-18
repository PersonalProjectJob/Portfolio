-- ==============================================================================
-- Portfolio Admin CMS: Automated Daily UX Rollup & RLS Permissions
-- ==============================================================================

-- 1. Enable INSERT & UPDATE for anon on ux_daily_rollups (Fix for RLS Policy Gap)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ux_daily_rollups' AND policyname = 'Public can insert ux_daily_rollups'
  ) THEN
    CREATE POLICY "Public can insert ux_daily_rollups" ON ux_daily_rollups 
    FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'ux_daily_rollups' AND policyname = 'Public can update ux_daily_rollups'
  ) THEN
    CREATE POLICY "Public can update ux_daily_rollups" ON ux_daily_rollups 
    FOR UPDATE TO anon, authenticated USING (true);
  END IF;
END $$;

-- 2. Stored Procedure to calculate & upsert daily rollups from raw events and sessions
CREATE OR REPLACE FUNCTION calculate_and_upsert_ux_daily_rollups(target_date TEXT DEFAULT NULL)
RETURNS TABLE (
  page_slug TEXT,
  total_readers INT,
  avg_dwell_seconds INT,
  ux_grade TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_date TEXT;
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
BEGIN
  -- Default to current UTC/Local date YYYY-MM-DD
  v_date := COALESCE(target_date, to_char(now(), 'YYYY-MM-DD'));
  v_start := (v_date || ' 00:00:00')::TIMESTAMPTZ;
  v_end := (v_date || ' 23:59:59.999')::TIMESTAMPTZ;

  -- Upsert aggregated rollups for each project active on that day
  RETURN QUERY
  WITH project_events AS (
    SELECT 
      e.page_slug,
      COUNT(DISTINCT e.session_token) AS readers_count,
      COALESCE(AVG(e.dwell_time_ms), 0) AS mean_dwell_ms,
      COUNT(CASE WHEN e.event_type IN ('rage_click', 'dead_click') THEN 1 END) AS friction_count
    FROM ux_events e
    WHERE e.timestamp >= v_start AND e.timestamp <= v_end
    GROUP BY e.page_slug
  ),
  session_stats AS (
    SELECT
      s.page_slug,
      COUNT(CASE WHEN s.reader_type = 'skimmer' THEN 1 END) AS skimmers,
      COUNT(CASE WHEN s.reader_type = 'scanner' THEN 1 END) AS scanners,
      COUNT(CASE WHEN s.reader_type = 'deep_reader' THEN 1 END) AS deep_readers,
      COUNT(*) AS total_sess
    FROM ux_sessions s
    WHERE s.created_at >= v_start AND s.created_at <= v_end
    GROUP BY s.page_slug
  ),
  computed AS (
    SELECT
      pe.page_slug,
      COALESCE(
        CASE pe.page_slug
          WHEN 'agent-handoff' THEN 'Agent Handoff & Governance'
          WHEN 'vlinkpay' THEN 'VLinkPay Checkout Protocol'
          WHEN 'nailhub' THEN 'NailHub Merchant CRM'
          WHEN 'cryptomap' THEN 'CryptoMap360 Spatial Engine'
          WHEN 'nexora' THEN 'Nexora Design Language'
          WHEN 'character-stats' THEN 'Character Stats RPG'
          WHEN 'sync-task-badge' THEN 'Sync Task Badge'
          WHEN 'world-map' THEN 'World Map Navigation'
          WHEN 'agent-rules' THEN 'Agent Rules Governance'
          WHEN 'dispatch' THEN 'Dispatch Protocol Engine'
          ELSE pe.page_slug
        END,
        pe.page_slug
      ) AS project_name,
      GREATEST(pe.readers_count, 1)::INT AS readers,
      ROUND(pe.mean_dwell_ms / 1000.0)::INT AS avg_dwell,
      -- Completion rate calculation based on dwell
      LEAST(100, GREATEST(10, ROUND((pe.mean_dwell_ms / 60000.0) * 100)))::INT AS completion,
      CASE 
        WHEN pe.readers_count >= 10 AND pe.mean_dwell_ms >= 60000 THEN 'A+'
        WHEN pe.readers_count >= 5 AND pe.mean_dwell_ms >= 30000 THEN 'A'
        WHEN pe.readers_count >= 1 THEN 'B'
        ELSE 'C'
      END AS grade,
      pe.friction_count::INT AS friction_alerts,
      CASE WHEN COALESCE(ss.total_sess, 0) > 0 THEN ROUND((ss.skimmers::NUMERIC / ss.total_sess) * 100)::INT ELSE 40 END AS skimmer_p,
      CASE WHEN COALESCE(ss.total_sess, 0) > 0 THEN ROUND((ss.scanners::NUMERIC / ss.total_sess) * 100)::INT ELSE 35 END AS scanner_p,
      CASE WHEN COALESCE(ss.total_sess, 0) > 0 THEN ROUND((ss.deep_readers::NUMERIC / ss.total_sess) * 100)::INT ELSE 25 END AS deep_p
    FROM project_events pe
    LEFT JOIN session_stats ss ON pe.page_slug = ss.page_slug
  )
  INSERT INTO ux_daily_rollups (
    date_string,
    page_slug,
    project_name,
    total_readers,
    avg_dwell_seconds,
    completion_rate,
    ux_grade,
    friction_alerts_count,
    skimmer_pct,
    scanner_pct,
    deep_reader_pct,
    rollup_timestamp,
    created_at
  )
  SELECT
    v_date,
    c.page_slug,
    c.project_name,
    c.readers,
    c.avg_dwell,
    c.completion,
    c.grade,
    c.friction_alerts,
    c.skimmer_p,
    c.scanner_p,
    c.deep_p,
    now(),
    now()
  FROM computed c
  ON CONFLICT (date_string, page_slug) DO UPDATE SET
    total_readers = EXCLUDED.total_readers,
    avg_dwell_seconds = EXCLUDED.avg_dwell_seconds,
    completion_rate = EXCLUDED.completion_rate,
    ux_grade = EXCLUDED.ux_grade,
    friction_alerts_count = EXCLUDED.friction_alerts_count,
    skimmer_pct = EXCLUDED.skimmer_pct,
    scanner_pct = EXCLUDED.scanner_pct,
    deep_reader_pct = EXCLUDED.deep_reader_pct,
    rollup_timestamp = now()
  RETURNING
    ux_daily_rollups.page_slug,
    ux_daily_rollups.total_readers,
    ux_daily_rollups.avg_dwell_seconds,
    ux_daily_rollups.ux_grade;
END;
$$;

-- Grant execution to anon and authenticated
GRANT EXECUTE ON FUNCTION calculate_and_upsert_ux_daily_rollups(TEXT) TO anon, authenticated, service_role;
