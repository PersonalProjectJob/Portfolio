/**
 * Security Fix Summary - Send to Telegram
 * 
 * Usage:
 * node scripts/send-security-report.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .forEach(line => {
      const [key, ...valueParts] = line.split('=');
      process.env[key.trim()] = valueParts.join('=').trim();
    });
}

async function sendTelegramSecurityReport() {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const telegramThreadId = process.env.TELEGRAM_DEV_THREAD_ID;

  if (!telegramBotToken || !telegramChatId) {
    console.error("❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    process.exit(1);
  }

  const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const message = `<b>🔒 Security Fix Summary</b>
📅 <b>Date:</b> ${now}

📊 <b>Files Modified:</b> 7 files (+1 doc)
• index.tsx: 5,081 lines (main server)
• shared.ts: 720 lines (utilities)
• ai-guard.ts: 357 lines (AI protection)
• request-signature.ts: 201 lines (NEW - HMAC)
• cors.ts (shared): 176 lines
• cors.ts (server): 133 lines
• parseQuota.ts: 144 lines (UI-only note)
• SECURITY_SOURCE_CODE_PROTECTION.md: 396 lines

<b>✅ Fixes Completed:</b>

🔴 <b>CRITICAL:</b>
1. Removed hardcoded owner credentials
   → Moved to env variables (OWNER_EMAIL, OWNER_PASSWORD)
   ⚠️ ACTION: Change owner password immediately!

🟡 <b>HIGH:</b>
2. CORS wildcard → Origin allowlist
   → Only: https://tnsthao94.online
   → Only: https://www.tnsthao94.online
   → Supports wildcard subdomains (*.example.com)

3. Server-side parse quota confirmed
   → Already enforced (20-year window = lifetime)
   → Added documentation to frontend code

🟢 <b>MEDIUM:</b>
4. Request signature validation (HMAC-SHA256)
   → Optional, enable with REQUEST_SIGNING_SECRET
   → Prevents replay attacks (5-min window)
   → Integrated into AI guard

5. Health endpoint rate limiting
   → 10 req/min per IP for /health
   → 10 req/min per IP for /health-ai

6. IP header sanitization
   → Validates IPv4/IPv6 format
   → Logs spoofing attempts
   → Prevents header injection

📋 <b>Required Supabase Secrets:</b>
• OWNER_EMAIL=job360tt@mailinator.com
• OWNER_PASSWORD=&lt;CHANGE-THIS-NOW&gt;
• ALLOWED_ORIGINS=https://tnsthao94.online,https://www.tnsthao94.online
• REQUEST_SIGNING_SECRET=&lt;openssl rand -base64 32&gt;
• OWNER_DISPLAY_NAME=Job360 Owner

⚠️ <b>Immediate Actions:</b>
• Change owner password (was exposed in code)
• Rotate all API keys (reCAPTCHA, Resend, AI providers)
• Enable RLS on all sensitive tables
• Make repository private (if not already)

📖 <b>Full Guide:</b> SECURITY_SOURCE_CODE_PROTECTION.md

🎯 <b>Security Level:</b> MODERATE → GOOD
🔐 <b>AI Proxy Risk:</b> Reduced significantly`;

  // Try with thread ID first, fall back to without
  let messageThreadId = telegramThreadId ? parseInt(telegramThreadId) : undefined;
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          message_thread_id: messageThreadId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await response.json();
    
    // If thread not found, try without thread
    if (!result.ok && result.description?.includes("thread")) {
      console.warn("⚠️ Thread ID not found, retrying without thread...");
      const retryResponse = await fetch(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
            parse_mode: "HTML",
          }),
        }
      );
      
      const retryResult = await retryResponse.json();
      if (retryResult.ok) {
        console.log("✅ Security report sent to Telegram successfully! (without thread)");
      } else {
        console.error("❌ Failed to send:", retryResult);
      }
    } else if (result.ok) {
      console.log("✅ Security report sent to Telegram successfully!");
    } else {
      console.error("❌ Failed to send:", result);
    }
  } catch (error) {
    console.error("❌ Error sending to Telegram:", error.message);
  }
}

sendTelegramSecurityReport();
