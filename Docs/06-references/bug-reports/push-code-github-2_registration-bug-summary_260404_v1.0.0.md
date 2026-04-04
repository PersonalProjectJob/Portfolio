# 🔴 REGISTRATION BUG FIX - SUMMARY

## 🐛 Bug Description
**Issue:** Registration endpoint returns **500 Internal Server Error**  
**Endpoint:** `POST https://xjtiokkxuqukatjdcqzd.supabase.co/functions/v1/make-server-4ab11b6d/auth/register`  
**Impact:** Users cannot register new accounts

## 🎯 Root Cause
The Supabase Edge Function is **missing required environment variables (secrets)**. The code explicitly throws errors when `OWNER_EMAIL` or `OWNER_PASSWORD` are not set, and database operations fail without `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## 📝 What Needs to Be Done

### 1️⃣ Obtain Required Credentials

**Supabase Service Role Key:**
- Visit: https://supabase.com/dashboard/project/xjtiokkxuqukatjdcqzd/settings/api
- Look for "Project API keys" section
- Copy the **`service_role`** key (NOT the anon key)
- This key starts with `eyJ...`

**Google reCAPTCHA Secret Key:**
- Visit: https://www.google.com/recaptcha/admin
- Create a new reCAPTCHA v3 site (or use existing)
- Domain: `tnsthao94.online`
- Copy the **Secret Key** (looks like: `6LcXXXXX...`)

### 2️⃣ Add Secrets to Supabase

**Method A: Using Supabase Dashboard (Easiest)**
1. Go to: https://supabase.com/dashboard/project/xjtiokkxuqukatjdcqzd
2. Click **Edge Functions** in the left sidebar
3. Click **Secrets** tab
4. Click **+ New secret** for each variable:

| Secret Name | Value |
|-------------|-------|
| `SUPABASE_URL` | `https://xjtiokkxuqukatjdcqzd.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | (your service_role key from step 1) |
| `OWNER_EMAIL` | `admin@yourdomain.com` (your admin email) |
| `OWNER_PASSWORD` | `SecurePassword123!` (min 8 chars) |
| `RECAPTCHA_SECRET_KEY` | (your reCAPTCHA secret from step 1) |

**Method B: Using Supabase CLI**
```bash
# Install Supabase CLI if not already installed
# https://supabase.com/docs/guides/cli/getting-started

# Add secrets
supabase secrets set \
  SUPABASE_URL="https://xjtiokkxuqukatjdcqzd.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..." \
  OWNER_EMAIL="admin@yourdomain.com" \
  OWNER_PASSWORD="SecurePassword123!" \
  RECAPTCHA_SECRET_KEY="6Lc..." \
  --project-ref xjtiokkxuqukatjdcqzd
```

**Method C: Using Setup Script**
```bash
# Windows
cd C:\Users\AD\Downloads\Job360
scripts\setup-secrets.bat

# Linux/Mac
cd C:\Users\AD\Downloads\Job360
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

### 3️⃣ Deploy the Edge Function (if needed)
```bash
supabase functions deploy server --project-ref xjtiokkxuqukatjdcqzd
```

### 4️⃣ Test the Fix

**Quick Test:**
1. Open your application
2. Navigate to registration page
3. Try registering a new account
4. Should receive verification email (if RESEND_API_KEY configured)
5. Should NOT see 500 error

**API Test:**
```bash
curl -X POST "https://xjtiokkxuqukatjdcqzd.supabase.co/functions/v1/make-server-4ab11b6d/auth/register" \
  -H "Content-Type: application/json" \
  -H "Origin: https://tnsthao94.online" \
  -d '{
    "name": "Test User",
    "email": "test@gmail.com",
    "password": "TestPass123",
    "captchaToken": "your-token-here"
  }'
```

## ✅ Success Indicators

After fixing, you should see:
- ✅ HTTP 200 response with `{"success":true,"code":"REGISTRATION_PENDING_VERIFICATION"}`
- ✅ No 500 errors in browser console
- ✅ Telegram notification sent (if configured)
- ✅ Verification email sent (if RESEND_API_KEY configured)

## 🔍 Troubleshooting

**Still getting 500 error?**
```bash
# Check function logs
supabase functions logs server --project-ref xjtiokkxuqukatjdcqzd

# Verify secrets are set
supabase secrets list --project-ref xjtiokkxuqukatjdcqzd
```

**Common Issues:**
1. **Typo in secret names** - Must be exact (case-sensitive)
2. **Using anon key instead of service_role** - Use the correct key
3. **Weak password** - Must be at least 8 characters
4. **Invalid email format** - Use a properly formatted email
5. **Function not deployed** - Run deploy command after setting secrets

## 📋 Checklist

Before testing:
- [ ] Obtained `service_role` key from Supabase Dashboard
- [ ] Obtained `RECAPTCHA_SECRET_KEY` from Google
- [ ] Added all 5 required secrets to Supabase
- [ ] Deployed edge function (if not already deployed)
- [ ] Verified secrets are listed: `supabase secrets list`
- [ ] Tested registration endpoint

## 📚 Documentation Files Created

1. **BUGFIX_REGISTRATION_500_ERROR.md** - Complete technical analysis
2. **FIX_REGISTRATION_500_ERROR.md** - Step-by-step fix guide
3. **ENV_SETUP_GUIDE.md** - Environment variable reference
4. **scripts/setup-secrets.bat** - Windows setup script
5. **scripts/setup-secrets.sh** - Linux/Mac setup script
6. **REGISTRATION_BUG_FIX_SUMMARY.md** - This file (quick reference)

## 🚀 Next Steps After Fix

Once registration is working, consider setting up these optional features:

**Email Verification:**
```bash
supabase secrets set RESEND_API_KEY="re_your-key" --project-ref xjtiokkxuqukatjdcqzd
```

**AI Features:**
```bash
supabase secrets set DASHSCOPE_API_KEY="sk-..." --project-ref xjtiokkxuqukatjdcqzd
supabase secrets set DEEPSEEK_API_KEY="sk-..." --project-ref xjtiokkxuqukatjdcqzd
```

**File Uploads:**
```bash
supabase secrets set CLOUDINARY_URL="cloudinary://..." --project-ref xjtiokkxuqukatjdcqzd
```

---

**Estimated Fix Time:** 5-10 minutes  
**Difficulty:** Easy  
**Status:** Ready to implement ✅
