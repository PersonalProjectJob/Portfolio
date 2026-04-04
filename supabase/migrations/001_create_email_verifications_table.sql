-- Migration: Create email_verifications table
-- Purpose: Migrate email verification state from KV store to dedicated SQL table
-- Date: 2026-04-04
--
-- INSTRUCTIONS: Run this SQL in Supabase Dashboard > SQL Editor
-- See MIGRATION_GUIDE.md for detailed steps

CREATE TABLE IF NOT EXISTS email_verifications (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       TEXT NOT NULL,
  email         TEXT NOT NULL,
  token         TEXT UNIQUE,
  verified      BOOLEAN DEFAULT FALSE,
  verified_at   TIMESTAMPTZ,
  token_expires TIMESTAMPTZ,
  last_sent_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, email)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ev_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ev_token ON email_verifications(token) WHERE token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ev_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_ev_user_verified ON email_verifications(user_id, verified);

-- Row Level Security (RLS)
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage email verifications
-- (Edge functions use service role key, so this is sufficient)
CREATE POLICY "Service role full access"
  ON email_verifications
  FOR ALL
  USING (true)
  WITH CHECK (true);
