# Migration Guide: Email Verification KV → SQL Table

## Overview
This migration moves email verification data from the KV store (`kv_store_4ab11b6d`) to a dedicated SQL table (`email_verifications`) for better performance, queryability, and data integrity.

## Prerequisites
- Access to Supabase Dashboard
- Service role key for your Supabase project

## Step-by-Step Instructions

### Step 1: Run the SQL Migration

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `hioludvfelhzhdldujs`
3. Go to **SQL Editor** (left sidebar)
4. Click **New query**
5. Copy and paste the contents of `supabase/migrations/001_create_email_verifications_table.sql`
6. Click **Run** (or press `Ctrl+Enter`)

This will create:
- Table `email_verifications` with columns: `id`, `user_id`, `email`, `token`, `verified`, `verified_at`, `token_expires`, `last_sent_at`, `created_at`, `updated_at`
- Indexes on `user_id`, `token`, `email`, and `(user_id, verified)` for fast queries
- Row Level Security (RLS) policy for service role access

### Step 2: Verify Table Creation

1. Go to **Table Editor** (left sidebar)
2. Confirm `email_verifications` table appears in the list
3. Click on it to verify the schema matches:
   - `id` (int8, primary key)
   - `user_id` (text, not null)
   - `email` (text, not null)
   - `token` (text, unique, nullable)
   - `verified` (bool, default false)
   - `verified_at` (timestamptz, nullable)
   - `token_expires` (timestamptz, nullable)
   - `last_sent_at` (timestamptz, nullable)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

### Step 3: Deploy Updated Edge Functions

The code has been updated to use the SQL table. Deploy the changes:

```bash
# If using Supabase CLI
supabase functions deploy

# Or deploy via your CI/CD pipeline
```

### Step 4 (Optional): Migrate Existing Data

If you have existing verification data in the KV store that you want to preserve:

1. Go back to **SQL Editor** in Supabase Dashboard
2. Run the following query to see what data exists in KV:

```sql
-- Check existing KV data
SELECT key, value 
FROM kv_store_4ab11b6d 
WHERE key LIKE 'email_verify_token:%' 
   OR key LIKE 'email_verified:%' 
   OR key LIKE 'email_verify_cooldown:%';
```

3. If data exists, run this migration script:

```sql
-- Migrate email_verify_token:* entries
INSERT INTO email_verifications (user_id, email, token, token_expires, verified, last_sent_at)
SELECT 
  value->>'userId' AS user_id,
  value->>'email' AS email,
  REPLACE(key, 'email_verify_token:', '') AS token,
  (value->>'expiresAt')::timestamptz AS token_expires,
  FALSE AS verified,
  NOW() AS last_sent_at
FROM kv_store_4ab11b6d
WHERE key LIKE 'email_verify_token:%'
ON CONFLICT (token) DO NOTHING;

-- Migrate email_verified:* entries (users who verified before migration)
INSERT INTO email_verifications (user_id, email, verified, verified_at, last_sent_at)
SELECT 
  REPLACE(key, 'email_verified:', '') AS user_id,
  COALESCE(
    (SELECT value->>'email' 
     FROM kv_store_4ab11b6d k2 
     WHERE k2.key LIKE 'email_verify_token:%' 
       AND k2.value->>'userId' = REPLACE(kv_store_4ab11b6d.key, 'email_verified:', '')
     LIMIT 1),
    'unknown@example.com'
  ) AS email,
  TRUE AS verified,
  NOW() AS verified_at,
  NOW() AS last_sent_at
FROM kv_store_4ab11b6d
WHERE key LIKE 'email_verified:%'
  AND value IN ('"1"', '"true"')
ON CONFLICT (user_id, email) DO NOTHING;
```

### Step 5: Test the Migration

1. **Test new registration:**
   - Register a new account
   - Check that verification email is sent
   - Verify the email via the link
   - Confirm login works

2. **Test existing users:**
   - If you migrated data, try logging in with a previously verified account
   - Check that `emailVerified: true` appears in the login response

3. **Test resend verification:**
   - Use the "Resend verification email" feature
   - Confirm cooldown works (wait < 60 seconds between requests)

4. **Test AI guard:**
   - Verify that verified users get higher AI quotas
   - Check tier assignment in AI responses

## Rollback Plan

If something goes wrong, you can rollback:

1. **Revert code changes:**
   ```bash
   git revert <commit-hash>
   ```

2. **Drop the new table (if needed):**
   ```sql
   DROP TABLE IF EXISTS email_verifications CASCADE;
   ```

3. **Old KV data remains intact** — the KV store is not modified by the new code, so rollback is safe.

## Files Changed

| File | Changes |
|------|---------|
| `supabase/migrations/001_create_email_verifications_table.sql` | **NEW** — SQL migration |
| `supabase/functions/server/email-verify.ts` | Replaced KV operations with Supabase SQL queries |
| `supabase/functions/server/ai-guard.ts` | Updated to use `isEmailVerified()` helper instead of direct KV access |

## KV Keys No Longer Used

These patterns are **deprecated** and will be ignored by the new code:
- `email_verify_token:{token}`
- `email_verified:{userId}`
- `email_verify_cooldown:{userId}`

You can safely clean these up from `kv_store_4ab11b6d` after confirming the migration is successful:

```sql
-- Optional cleanup (run after 1-2 weeks of successful migration)
DELETE FROM kv_store_4ab11b6d 
WHERE key LIKE 'email_verify_token:%' 
   OR key LIKE 'email_verified:%' 
   OR key LIKE 'email_verify_cooldown:%';
```

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard > Logs > Edge Functions
2. Check edge function logs for `[email-verify]` prefix
3. Verify table exists and has correct schema
4. Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly
