# 🔒 Source Code Protection Guide - Job360

## Current Exposure Analysis

### What's Already Protected ✅
1. **Server-side code runs on Supabase Edge Functions** - not accessible to clients
2. **Environment variables stored in Supabase secrets** - not in source code
3. **AI API keys (DASHSCOPE, DEEPSEEK)** - server-side only
4. **Password hashing** - PBKDF2-SHA256 with 210,000 iterations
5. **Session tokens hashed** - SHA-256 before DB storage

### What's Exposed to Clients ⚠️
These are **by design** and cannot be fully hidden:

| Item | Location | Risk Level | Notes |
|------|----------|-----------|-------|
| Supabase anon key | `utils/supabase/info.tsx` | 🟢 LOW | Designed to be public, limited by RLS |
| reCAPTCHA site key | `src/utils/recaptcha/info.ts` | 🟢 LOW | Public by design |
| Frontend React code | Browser dev tools | 🟡 MEDIUM | Can be minimized |
| API endpoint URLs | Network tab | 🟢 LOW | Protected by auth + rate limits |
| CORS headers | Network tab | 🟢 LOW | Now restricted to your domains |

---

## Source Code Protection Strategy

### Level 1: Git & Repository Security 🔴 CRITICAL

#### 1.1 Create `.gitignore`
Ensure these are NEVER committed:
```gitignore
# Environment files
.env
.env.local
.env.production
.env.*.local

# Secrets
*.key
*.pem
secrets.json

# Build artifacts
dist/
node_modules/
*.log

# IDE
.vscode/settings.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

#### 1.2 Check Git History for Leaks
```bash
# Search for accidentally committed secrets
git log --all -p --grep="password\|secret\|key\|token"

# If found, use BFG Repo-Cleaner to remove:
# https://rtyley.github.io/bfg-repo-cleaner/
```

#### 1.3 Repository Access Control
- **Private repository** on GitHub/GitLab
- **Branch protection** on `main`
- **Require PR reviews** before merge
- **Disable force push** to main branches
- **Enable 2FA** for all collaborators

---

### Level 2: Build-Time Protection 🟡 HIGH

#### 2.1 Environment Variables - Never Expose to Client

**❌ WRONG - leaks to client:**
```typescript
// This gets bundled and visible in browser!
const apiKey = process.env.DASHSCOPE_API_KEY;
```

**✅ CORRECT - server-only:**
```typescript
// Supabase Edge Functions - runs server-side only
const apiKey = Deno.env.get("DASHSCOPE_API_KEY");
```

#### 2.2 Vite Configuration - Exclude Sensitive Data

Update `vite.config.ts`:
```typescript
export default defineConfig({
  // Only expose specific env vars to client (with VITE_ prefix)
  define: {
    // NEVER put real secrets here
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

#### 2.3 Source Maps - Control Visibility

**Production** (`vite.config.ts`):
```typescript
export default defineConfig({
  build: {
    // Disable source maps in production - hides original source
    sourcemap: false,
    
    // Minify code
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log
        drop_debugger: true,
      },
    },
  },
});
```

**Development** (keep source maps for debugging):
```typescript
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: mode === 'development',
  },
}));
```

---

### Level 3: Runtime Protection 🟡 HIGH

#### 3.1 Code Obfuscation (Optional)

For additional protection, use JavaScript obfuscation:

```bash
npm install --save-dev javascript-obfuscator
```

**Note**: Obfuscation is defense-in-depth, not a silver bullet. Determined attackers can still reverse-engineer.

#### 3.2 Prevent Directory Listing

Ensure your hosting (Vercel, Netlify, etc.) **disables directory listing**:

**Vercel** (`vercel.json`):
```json
{
  "trailingSlash": false,
  "cleanUrls": true
}
```

**Netlify** (`netlify.toml`):
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
```

#### 3.3 Subresource Integrity (SRI)

For CDN-loaded scripts, use SRI hashes:
```html
<script 
  src="https://cdn.example.com/lib.js" 
  integrity="sha384-abc123..." 
  crossorigin="anonymous">
</script>
```

---

### Level 4: API Security 🟡 HIGH (Already Implemented ✅)

Your current protections:

| Protection | Status | Notes |
|-----------|--------|-------|
| Rate limiting | ✅ | Per-user, per-IP, per-endpoint |
| Request signing (HMAC) | ✅ | Optional, enable with `REQUEST_SIGNING_SECRET` |
| CORS restriction | ✅ | Now limited to tnsthao94.online |
| AI guard quotas | ✅ | Tier-based access control |
| Input sanitization | ✅ | SQL injection + XSS prevention |
| Session security | ✅ | 30-day TTL, hashed tokens |

---

### Level 5: Database Security 🟠 VERY IMPORTANT

#### 5.1 Row Level Security (RLS) - MUST ENABLE

In Supabase Dashboard → Database → Policies:

**For `users` table:**
```sql
-- Disable all public access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (server-side only)
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Users can read their own data
CREATE POLICY "Users read own data" ON users
  FOR SELECT USING (auth.uid() = user_id);
```

**For `auth_sessions` table:**
```sql
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role
CREATE POLICY "Service role only" ON auth_sessions
  FOR ALL USING (auth.role() = 'service_role');
```

**For `rate_limits` table:**
```sql
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role
CREATE POLICY "Service role only" ON rate_limits
  FOR ALL USING (auth.role() = 'service_role');
```

#### 5.2 Restrict Supabase Anon Key Permissions

The anon key should **ONLY** have access to:
- Public tables with RLS policies
- Auth endpoints (login, register, etc.)

**It should NOT have access to:**
- `users` table (service role only)
- `auth_sessions` table
- `rate_limits` table
- `kv_store_4ab11b6d` table

---

### Level 6: Deployment Security 🟢 MEDIUM

#### 6.1 Supabase Edge Functions Secrets

Set these in Supabase Dashboard → Edge Functions → Manage Secrets:

```bash
# Critical (was hardcoded - FIX NOW)
OWNER_EMAIL=job360tt@mailinator.com
OWNER_PASSWORD=<CHANGE-THIS-TO-NEW-STRONG-PASSWORD>

# CORS (restricts allowed origins)
ALLOWED_ORIGINS=https://tnsthao94.online,https://www.tnsthao94.online

# Request signing (optional but recommended)
REQUEST_SIGNING_SECRET=<generate-with: openssl rand -base64 32>

# Existing secrets (verify these are set)
SUPABASE_URL=<your-url>
SUPABASE_SERVICE_ROLE_KEY=<your-key>
DASHSCOPE_API_KEY=<your-key>
DEEPSEEK_API_KEY=<your-key>
RECAPTCHA_SECRET_KEY=<your-key>
RESEND_API_KEY=<your-key>
```

#### 6.2 Change Owner Password Immediately

Since the old password was in source code:
1. Set new `OWNER_PASSWORD` secret in Supabase
2. Update database manually:
```sql
-- Generate new hash server-side or use edge function
UPDATE users 
SET password_hash = '<new-hash>' 
WHERE email = 'job360tt@mailinator.com';
```

#### 6.3 Rotate ALL Exposed Secrets

Since owner credentials were in source code, assume compromise:
- ✅ `OWNER_PASSWORD` - change now
- ✅ `RECAPTCHA_SECRET_KEY` - regenerate in Google reCAPTCHA console
- ✅ `RESEND_API_KEY` - regenerate in Resend dashboard
- ✅ `DASHSCOPE_API_KEY` - regenerate in Alibaba Cloud
- ✅ `DEEPSEEK_API_KEY` - regenerate in DeepSeek platform
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - regenerate if repo was public

---

## Monitoring & Detection

### 1. Log Suspicious Activity

Add to your security middleware (already logging):
```typescript
// Already implemented in index.tsx
console.log(`[🔒 Security] ${method} ${path} from ${ip}`);
```

### 2. Set Up Alerts

**Supabase**: Monitor unusual database access patterns
**Vercel/Netlify**: Monitor build triggers
**GitHub**: Monitor clone/access patterns

### 3. Regular Security Audits

```bash
# Monthly: Check for secrets in code
grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" src/

# Quarterly: Review Supabase RLS policies
# Quarterly: Rotate API keys
# Quarterly: Review CORS origins
```

---

## Quick Checklist

### Immediate Actions (Do Now) 🔴
- [ ] Set `OWNER_PASSWORD` as Supabase secret
- [ ] Change owner password (was exposed in source)
- [ ] Enable RLS on all sensitive tables
- [ ] Verify `.gitignore` excludes `.env` files
- [ ] Make repository private (if not already)

### This Week 🟡
- [ ] Rotate all API keys (reCAPTCHA, Resend, AI providers)
- [ ] Set `ALLOWED_ORIGINS` secret
- [ ] Set `REQUEST_SIGNING_SECRET` (optional)
- [ ] Disable production source maps
- [ ] Review all Supabase database policies

### This Month 🟢
- [ ] Set up monitoring/alerting
- [ ] Document all secrets in secure vault (1Password, etc.)
- [ ] Review and test CORS configuration
- [ ] Test request signing with a client
- [ ] Conduct penetration testing

---

## What Cannot Be Fully Protected

Be aware these are **inherently client-side** and cannot be hidden:

1. **Frontend JavaScript** - browsers must execute it
2. **CSS styles** - visible in dev tools
3. **Public API endpoints** - discoverable via network tab
4. **Supabase anon key** - by design (limited by RLS)
5. **reCAPTCHA site key** - public by design

**Mitigation**: Focus on **server-side security** (which you've done well) rather than trying to hide client code completely.

---

## Architecture Summary

```
┌─────────────────────────────────────┐
│   Client Browser (UNTRUSTED)        │
│   - React app (visible)             │
│   - Supabase anon key (visible)     │
│   - reCAPTCHA key (visible)         │
│   ↓ Protected by RLS + CORS         │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│   Supabase Edge Functions (TRUSTED) │
│   - AI Guard ✅                     │
│   - Rate limiting ✅                │
│   - Request signing ✅              │
│   - Password hashing ✅             │
│   - All secrets here ✅             │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│   PostgreSQL Database (TRUSTED)     │
│   - RLS policies (must enable)      │
│   - Service role only access        │
│   - Encrypted at rest             │
└─────────────────────────────────────┘
```

**Key Principle**: Never trust the client. All critical logic and secrets stay server-side.
