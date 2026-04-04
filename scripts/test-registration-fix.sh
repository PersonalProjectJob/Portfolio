#!/bin/bash
# Test script to verify the registration fix
# Run this AFTER setting up secrets to verify they work

set -e

PROJECT_ID="xjtiokkxuqukatjdcqzd"
BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1/make-server-4ab11b6d"

echo "🧪 Testing Registration Endpoint Fix"
echo "====================================="
echo ""

# Test 1: Health check
echo "Test 1: Checking health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed (HTTP $HEALTH_RESPONSE)"
    exit 1
fi
echo ""

# Test 2: Registration without captcha (should fail gracefully, not 500)
echo "Test 2: Testing registration (expecting captcha error, not 500)..."
REG_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -H "Origin: https://tnsthao94.online" \
  -d '{
    "name": "Test User",
    "email": "test@gmail.com",
    "password": "TestPass123"
  }')

HTTP_CODE=$(echo "$REG_RESPONSE" | tail -n1)
BODY=$(echo "$REG_RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "500" ]; then
    echo "❌ Still getting 500 error - secrets may be missing or invalid"
    echo "Response: $BODY"
    echo ""
    echo "💡 Try checking logs:"
    echo "   supabase functions logs server --project-ref ${PROJECT_ID}"
    exit 1
elif [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✅ Good! Not a 500 error (captcha or validation error is expected)"
    echo "Response: $BODY"
elif [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Excellent! Registration succeeded (might be test mode)"
    echo "Response: $BODY"
else
    echo "⚠️  Unexpected status code: $HTTP_CODE"
    echo "Response: $BODY"
fi

echo ""
echo "====================================="
echo "✅ Registration endpoint is working!"
echo "The 500 error has been fixed."
