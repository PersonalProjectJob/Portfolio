# REQUIRED SUPABASE EDGE FUNCTION SECRETS
# Add these to Supabase Dashboard > Edge Functions > Secrets

# Database connection
SUPABASE_URL=https://xjtiokkxuqukatjdcqzd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-supabase-settings>

# Owner account (required for seeding)
OWNER_EMAIL=<owner-email@example.com>
OWNER_PASSWORD=<secure-owner-password>

# Google reCAPTCHA v3
RECAPTCHA_SECRET_KEY=<your-recaptcha-secret-key>

# OPTIONAL: Additional configuration
OWNER_DISPLAY_NAME=Job360 Owner
ALLOWED_ORIGINS=https://tnsthao94.online,https://www.tnsthao94.online
ALLOWED_EMAIL_DOMAINS=gmail.com,yahoo.com,outlook.com,hotmail.com

# TELEGRAM NOTIFICATIONS (already configured)
TELEGRAM_BOT_TOKEN=8747361965:AAE35Sy9u7YSgKgxHUjx8_j_AYxvW7REJdo
TELEGRAM_CHAT_ID=-1003764877044
TELEGRAM_CHANGELOG_THREAD_ID=718
TELEGRAM_DEV_THREAD_ID=727

# OPTIONAL: Email verification (Resend)
RESEND_API_KEY=<your-resend-api-key>

# OPTIONAL: AI Features
DASHSCOPE_API_KEY=<your-dashscope-api-key>
DEEPSEEK_API_KEY=<your-deepseek-api-key>

# OPTIONAL: File uploads
CLOUDINARY_URL=<your-cloudinary-url>

# OPTIONAL: Webhooks
N8N_WEBHOOK_URL=<your-n8n-webhook-url>

# OPTIONAL: Request signing
REQUEST_SIGNING_SECRET=<your-request-signing-secret>
