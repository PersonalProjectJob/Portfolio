# 📬 Send Security Report to Telegram

## Quick Setup

### Option 1: Using .env file (Recommended)

1. Create `.env` file in project root:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_CHANGELOG_THREAD_ID=718
TELEGRAM_DEV_THREAD_ID=727
```

## Available Scripts

### 📦 Changelog (Thread 718)

```bash
node scripts/send-changelog.js \
  --title "Feature Update" \
  --category "feature" \
  --changes "Added new feature X\nImproved performance Y"
```

### 🛠️ Dev Working Report (Thread 727)

```bash
node scripts/send-dev-report.js "Bug fix complete" "Fixed login timeout"
```

Auto-includes modified files from git status.

### Option 2: Inline environment variables

```bash
TELEGRAM_BOT_TOKEN=your_token TELEGRAM_CHAT_ID=your_chat_id node scripts/send-security-report.js
```

## How to Get Telegram Credentials

### 1. Create Bot via BotFather
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to create bot
4. Copy the **Bot Token** (looks like: `123456:ABC-DEF...`)

### 2. Get Chat ID
1. Add your bot to a group/channel
2. Send a message to the group
3. Visit: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
4. Find `"chat":{"id":-1001234567890}` in the response
5. Copy the **chat ID** (include the `-` sign if present)

### 3. Get Message Thread ID (Optional - for topics)
1. If using a group with topics, open the specific topic
2. Send a message
3. Visit: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
4. Find `"message_thread_id":123` in the response
5. Copy the **thread ID**

## What Will Be Sent

The report includes:
- ✅ Summary of all 6 security fixes
- 📊 File statistics (lines, sizes)
- 🔴 Critical issues requiring immediate action
- 📋 Required environment variables
- ⚠️ Next steps checklist

## Example Output

```
🔒 Security Fix Summary
🗓 Date: 4/4/2026, 10:30:00 PM

📊 Files Modified: 7 files (+1 doc)
• index.tsx: 5,081 lines (main server)
• shared.ts: 720 lines (utilities)
...

✅ Fixes Completed:
🔴 CRITICAL: Removed hardcoded credentials
🟡 HIGH: CORS restricted, Parse quota enforced
🟢 MEDIUM: HMAC validation, Rate limits, IP sanitization

⚠️ Immediate Actions:
• Change owner password
• Rotate API keys
• Enable RLS
```
