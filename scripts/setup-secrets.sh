#!/bin/bash
# Helper script to set up Supabase Edge Function secrets
# Usage: ./setup-secrets.sh

set -e

echo "🔐 Supabase Edge Function Secrets Setup"
echo "========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install it: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Configuration
PROJECT_REF="xjtiokkxuqukatjdcqzd"
SUPABASE_URL="https://xjtiokkxuqukatjdcqzd.supabase.co"

echo "📝 Configuration:"
echo "   Project: $PROJECT_REF"
echo "   URL: $SUPABASE_URL"
echo ""

# Prompt for required secrets
read -p "🔑 Enter SUPABASE_SERVICE_ROLE_KEY: " SERVICE_ROLE_KEY
if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Service role key is required!"
    exit 1
fi

read -p "📧 Enter OWNER_EMAIL: " OWNER_EMAIL
if [ -z "$OWNER_EMAIL" ]; then
    echo "❌ Owner email is required!"
    exit 1
fi

read -s -p "🔒 Enter OWNER_PASSWORD (min 8 chars): " OWNER_PASSWORD
echo ""
if [ ${#OWNER_PASSWORD} -lt 8 ]; then
    echo "❌ Password must be at least 8 characters!"
    exit 1
fi

read -p "🤖 Enter RECAPTCHA_SECRET_KEY: " RECAPTCHA_SECRET
if [ -z "$RECAPTCHA_SECRET" ]; then
    echo "⚠️  reCAPTCHA secret is empty - registration will fail captcha verification"
    read -p "   Continue anyway? (y/N): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        exit 1
    fi
fi

echo ""
echo "🚀 Setting up secrets..."
echo ""

# Set secrets
supabase secrets set \
    SUPABASE_URL="$SUPABASE_URL" \
    SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
    OWNER_EMAIL="$OWNER_EMAIL" \
    OWNER_PASSWORD="$OWNER_PASSWORD" \
    --project-ref "$PROJECT_REF"

if [ -n "$RECAPTCHA_SECRET" ]; then
    supabase secrets set RECAPTCHA_SECRET_KEY="$RECAPTCHA_SECRET" --project-ref "$PROJECT_REF"
fi

# Set optional secrets with defaults
supabase secrets set \
    OWNER_DISPLAY_NAME="Job360 Admin" \
    ALLOWED_ORIGINS="https://tnsthao94.online,https://www.tnsthao94.online" \
    --project-ref "$PROJECT_REF"

echo ""
echo "✅ Secrets configured successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Deploy the function (if not already deployed):"
echo "      supabase functions deploy server --project-ref $PROJECT_REF"
echo ""
echo "   2. Test registration"
echo ""
echo "   3. Check logs if needed:"
echo "      supabase functions logs server --project-ref $PROJECT_REF"
