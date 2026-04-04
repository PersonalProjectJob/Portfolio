-- Migration: Add Row Level Security (RLS) policies to core tables
-- Purpose: Defense-in-depth security to limit data access at database level
-- Date: 2026-04-04
-- FIX H-05: Prevent full database access if service role key is compromised

-- =====================================================
-- Users table
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- User chỉ đọc được profile của chính mình
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = user_id);

-- User có thể cập nhật profile của chính mình
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role vẫn có toàn quyền (để edge functions hoạt động)
CREATE POLICY "Service role full access to users"
  ON users FOR ALL
  USING (current_setting('role') = 'service_role');

-- =====================================================
-- Auth Sessions table
-- =====================================================
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- User chỉ đọc được session của chính mình
CREATE POLICY "Users can read own sessions"
  ON auth_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- User có thể thu hồi session của chính mình
CREATE POLICY "Users can revoke own sessions"
  ON auth_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- User có thể tạo session mới (khi đăng nhập)
CREATE POLICY "Users can create own sessions"
  ON auth_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role vẫn có toàn quyền
CREATE POLICY "Service role full access to sessions"
  ON auth_sessions FOR ALL
  USING (current_setting('role') = 'service_role');

-- =====================================================
-- Auth Logs table
-- =====================================================
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- User chỉ đọc được log đăng nhập của chính mình
CREATE POLICY "Users can read own auth logs"
  ON auth_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role vẫn có toàn quyền
CREATE POLICY "Service role full access to auth logs"
  ON auth_logs FOR ALL
  USING (current_setting('role') = 'service_role');

-- =====================================================
-- Audit Logs table
-- =====================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin/Owner có thể đọc audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.role IN ('admin', 'owner')
    )
  );

-- Service role vẫn có toàn quyền
CREATE POLICY "Service role full access to audit logs"
  ON audit_logs FOR ALL
  USING (current_setting('role') = 'service_role');

-- =====================================================
-- User Consents table
-- =====================================================
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- User chỉ đọc được consent của chính mình
CREATE POLICY "Users can read own consents"
  ON user_consents FOR SELECT
  USING (auth.uid() = user_id);

-- User có thể tạo consent của chính mình
CREATE POLICY "Users can create own consents"
  ON user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role vẫn có toàn quyền
CREATE POLICY "Service role full access to consents"
  ON user_consents FOR ALL
  USING (current_setting('role') = 'service_role');

-- =====================================================
-- CV Profiles table
-- =====================================================
ALTER TABLE cv_profiles ENABLE ROW LEVEL SECURITY;

-- User chỉ đọc được CV của chính mình
CREATE POLICY "Users can read own CVs"
  ON cv_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- User có thể quản lý CV của chính mình
CREATE POLICY "Users can manage own CVs"
  ON cv_profiles FOR ALL
  USING (auth.uid() = user_id);

-- Service role vẫn có toàn quyền
CREATE POLICY "Service role full access to CVs"
  ON cv_profiles FOR ALL
  USING (current_setting('role') = 'service_role');

-- =====================================================
-- Rate Limits table
-- =====================================================
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role only (users don't need direct access)
CREATE POLICY "Service role full access to rate limits"
  ON rate_limits FOR ALL
  USING (current_setting('role') = 'service_role');

-- =====================================================
-- Email Verifications table (already has RLS, verify)
-- =====================================================
-- This table should already have RLS from migration 001
-- Verify it's enabled
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Indexes for performance (if not already created)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_profiles_user_id ON cv_profiles(user_id);
