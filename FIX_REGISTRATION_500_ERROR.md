# 🔧 How to Fix the 500 Error on Registration

## Problem
Your registration endpoint is returning a **500 Internal Server Error** because required environment variables (secrets) are missing from your Supabase Edge Function.

## Quick Fix Steps

### Step 1: Get Your Supabase Service Role Key
1. Go to https://supabase.com/dashboard/project/xjtiokkxuqukatjdcqzd/settings/api
2. Copy the **`service_role`** key (secret, not the anon key)

### Step 2: Get or Create Google reCAPTCHA Keys
1. Go to https://www.google.com/recaptcha/admin
2. Create a new reCAPTCHA v3 site (or use existing)
3. Copy the **Secret Key** (not the Site Key)

### Step 3: Add Secrets to Supabase Edge Function

**Option A: Using Supabase CLI**
```bash
# Navigate to your project
cd C:\Users\AD\Downloads\Job360

# Add required secrets
supabase secrets set SUPABASE_URL=https://xjtiokkxuqukatjdcqzd.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<paste-your-service-role-key>
supabase secrets set OWNER_EMAIL=admin@example.com
supabase secrets set OWNER_PASSWORD=YourSecurePassword123!
supabase secrets set RECAPTCHA_SECRET_KEY=<paste-your-recaptcha-secret-key>

# Optional but recommended
supabase secrets set OWNER_DISPLAY_NAME="Job360 Admin"
supabase secrets set ALLOWED_ORIGINS="https://tnsthao94.online,https://www.tnsthao94.online"
```

**Option B: Using Supabase Dashboard**
1. Go to https://supabase.com/dashboard/project/xjtiokkxuqukatjdcqzd
2. Navigate to **Edge Functions** > **Secrets**
3. Click **Add Secret** for each variable:
   - `SUPABASE_URL` = `https://xjtiokkxuqukatjdcqzd.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (your service role key from Step 1)
   - `OWNER_EMAIL` = (your admin email)
   - `OWNER_PASSWORD` = (secure password, min 8 characters)
   - `RECAPTCHA_SECRET_KEY` = (your reCAPTCHA secret from Step 2)

### Step 4: Deploy the Edge Function (if not already deployed)
```bash
supabase functions deploy server --project-ref xjtiokkxuqukatjdcqzd
```

### Step 5: Test Registration
1. Clear your browser cache
2. Try registering again
3. The 500 error should be resolved

## 🔍 How to Verify It's Fixed

After adding the secrets, test the endpoint:
```bash
curl -X POST https://xjtiokkxuqukatjdcqzd.supabase.co/functions/v1/make-server-4ab11b6d/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "captchaToken": "your-recaptcha-token"
  }'
```

You should now get a proper error message (like captcha required) instead of a 500 error.

## 📋 Required vs Optional Secrets

### ✅ REQUIRED (Will cause 500 error if missing):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OWNER_EMAIL`
- `OWNER_PASSWORD`
- `RECAPTCHA_SECRET_KEY`

### ⚙️ OPTIONAL (Features won't work but no 500 error):
- `TELEGRAM_BOT_TOKEN` (notifications)
- `RESEND_API_KEY` (email verification)
- `DASHSCOPE_API_KEY` (AI features)
- `DEEPSEEK_API_KEY` (AI features)
- `CLOUDINARY_URL` (file uploads)
- `ALLOWED_ORIGINS` (defaults to localhost)
- `OWNER_DISPLAY_NAME` (defaults to "Job360 Owner")

##  Security Notes
- Never commit real secrets to version control
- Use strong passwords for OWNER_PASSWORD
- Keep your service_role key secret - it has full database access
- Rotate reCAPTCHA keys periodically

## Need Help?
If you still get errors after adding secrets, check the function logs:
```bash
supabase functions logs server --project-ref xjtiokkxuqukatjdcqzd
```
