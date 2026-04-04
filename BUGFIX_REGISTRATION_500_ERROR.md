# 🔴 BUG FIX: Registration 500 Internal Server Error

## 📸 Issue
**Endpoint:** `POST /make-server-4ab11b6d/auth/register`  
**Status:** 500 Internal Server Error  
**Screenshot:** `img/Screenshot 2026-04-04 130542.png`

## 🔍 Root Cause Analysis

The registration endpoint is failing with a **500 Internal Server Error** because the **Supabase Edge Function is missing required environment variables (secrets)**.

### Code Flow:
1. User submits registration form via `src/app/components/chat/AuthModal.tsx`
2. Request hits: `https://xjtiokkxuqukatjdcqzd.supabase.co/functions/v1/make-server-4ab11b6d/auth/register`
3. Function calls `ensureOwnerAccountSeeded()` at line 237 of `supabase/functions/server/index.tsx`
4. `ensureOwnerAccountSeeded()` calls `getOwnerEmail()` and `getOwnerPassword()` at lines 1058-1059
5. These functions call `Deno.env.get("OWNER_EMAIL")` and `Deno.env.get("OWNER_PASSWORD")`
6. **If either is missing, an error is thrown**, causing a 500 response

### Missing Required Environment Variables:

| Variable | Purpose | Code Location | Impact |
|----------|---------|---------------|--------|
| `SUPABASE_URL` | Database connection | Line 956 | **CRITICAL** - Can't connect to database |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin DB access | Line 957 | **CRITICAL** - Can't perform admin operations |
| `OWNER_EMAIL` | Owner account seed | Line 165 | **CRITICAL** - Throws error if missing |
| `OWNER_PASSWORD` | Owner account seed | Line 175 | **CRITICAL** - Throws error if missing |
| `RECAPTCHA_SECRET_KEY` | Captcha verification | Line 447 in shared.ts | **HIGH** - Captcha will fail |

## ✅ Solution

### Option 1: Manual Setup via Supabase Dashboard

1. **Get your credentials:**
   - Go to https://supabase.com/dashboard/project/xjtiokkxuqukatjdcqzd/settings/api
   - Copy the **`service_role`** key (starts with `eyJ...`)
   
   - Go to https://www.google.com/recaptcha/admin
   - Create a reCAPTCHA v3 site or copy your existing Secret Key

2. **Add secrets in Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/xjtiokkxuqukatjdcqzd
   - Click **Edge Functions** → **Secrets**
   - Add each secret:
     ```
     SUPABASE_URL = https://xjtiokkxuqukatjdcqzd.supabase.co
     SUPABASE_SERVICE_ROLE_KEY = <your-service-role-key>
     OWNER_EMAIL = admin@yourdomain.com
     OWNER_PASSWORD = YourSecurePassword123!
     RECAPTCHA_SECRET_KEY = <your-recaptcha-secret>
     ```

### Option 2: Using Supabase CLI (Recommended)

**Windows:**
```cmd
cd C:\Users\AD\Downloads\Job360
scripts\setup-secrets.bat
```

**Linux/Mac:**
```bash
cd C:\Users\AD\Downloads\Job360
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

**Or manually:**
```bash
supabase secrets set \
  SUPABASE_URL="https://xjtiokkxuqukatjdcqzd.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="<your-key>" \
  OWNER_EMAIL="admin@example.com" \
  OWNER_PASSWORD="SecurePass123!" \
  RECAPTCHA_SECRET_KEY="<your-recaptcha-secret>" \
  --project-ref xjtiokkxuqukatjdcqzd
```

### Option 3: Deploy Function (If Needed)

```bash
supabase functions deploy server --project-ref xjtiokkxuqukatjdcqzd
```

## 🧪 Verification

After setting up the secrets, test the endpoint:

```bash
curl -X POST https://xjtiokkxuqukatjdcqzd.supabase.co/functions/v1/make-server-4ab11b6d/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://tnsthao94.online" \
  -d '{
    "name": "Test User",
    "email": "test@gmail.com",
    "password": "TestPass123",
    "captchaToken": "test-token"
  }'
```

**Expected responses:**
- ✅ **200 OK** with `{"success":true,"code":"REGISTRATION_PENDING_VERIFICATION"}` → Fixed!
- ⚠️ **403 Forbidden** with captcha error → Secrets working, but need valid captcha
- ❌ **500 Internal Server Error** → Secrets still missing or invalid

Check function logs:
```bash
supabase functions logs server --project-ref xjtiokkxuqukatjdcqzd
```

## 📋 Complete Secret Reference

### Required (Will cause 500 error if missing):
```env
SUPABASE_URL=https://xjtiokkxuqukatjdcqzd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-key-here
OWNER_EMAIL=admin@yourdomain.com
OWNER_PASSWORD=SecurePassword123!
RECAPTCHA_SECRET_KEY=6Lc...your-secret-here
```

### Optional (Features won't work but no 500 error):
```env
# Email verification
RESEND_API_KEY=re_your-key

# AI features
DASHSCOPE_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...

# File uploads
CLOUDINARY_URL=cloudinary://...

# Customization
OWNER_DISPLAY_NAME=Job360 Admin
ALLOWED_ORIGINS=https://tnsthao94.online,https://www.tnsthao94.online
ALLOWED_EMAIL_DOMAINS=gmail.com,yahoo.com,outlook.com

# Telegram notifications (already configured)
TELEGRAM_BOT_TOKEN=8747361965:AAE35Sy9u7YSgKgxHUjx8_j_AYxvW7REJdo
TELEGRAM_CHAT_ID=-1003764877044
TELEGRAM_CHANGELOG_THREAD_ID=718
TELEGRAM_DEV_THREAD_ID=727
```

## 🔐 Security Best Practices

1. **Never commit secrets to version control**
2. **Use strong passwords** (minimum 12 characters, mixed case, numbers, symbols)
3. **Rotate keys regularly** (especially service_role key)
4. **Limit allowed origins** to your actual domains
5. **Use email verification** to prevent spam accounts

## 📚 Related Files

- **Endpoint handler:** `supabase/functions/server/index.tsx` (lines 237-443)
- **Owner seeding:** `supabase/functions/server/index.tsx` (lines 1053-1138)
- **Frontend auth:** `src/app/components/chat/AuthModal.tsx`
- **Secrets reference:** `ENV_SETUP_GUIDE.md`
- **Fix guide:** `FIX_REGISTRATION_500_ERROR.md`
- **Setup scripts:** `scripts/setup-secrets.bat` and `scripts/setup-secrets.sh`

## 🚀 Quick Fix Summary

```bash
# 1. Get your service_role key from Supabase Dashboard
# 2. Get your reCAPTCHA secret from Google reCAPTCHA Console
# 3. Run the setup script
scripts\setup-secrets.bat

# 4. Deploy if needed
supabase functions deploy server --project-ref xjtiokkxuqukatjdcqzd

# 5. Test registration
# The 500 error should be resolved!
```

---

**Status:** 🔧 Fix Ready  
**Severity:** High (blocks all user registrations)  
**Estimated Fix Time:** 5-10 minutes
