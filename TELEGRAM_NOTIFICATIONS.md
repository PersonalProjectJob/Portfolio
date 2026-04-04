# 📬 Telegram Notifications - Job360

## Scripts Available

### 1. Send Changelog (Primary Use)
```bash
node scripts/send-changelog.js --title "Title" --category "TYPE" --changes "Line1\nLine2"
```

**Categories:** `feature` | `fix` | `security` | `deployment` | `breaking` | `performance` | `refactor`

### 2. Send Security Report (One-time Setup)
```bash
node scripts/send-security-report.js
```

## AI Assistant Rules

### Qwen Code
- **Rule File:** `.qwen/rules/telegram-notifications.md`
- **Location:** Project root
- **Auto-trigger:** On major changes, security fixes, deployments

### Cursor
- **Rule File:** `.cursor/rules/telegram-changelog.mdc`
- **Location:** Project root
- **Auto-trigger:** Same conditions as Qwen

## When Notifications Are Sent

### ✅ AUTO-TRIGGER
1. Security vulnerabilities fixed
2. Breaking changes
3. Major feature completed
4. Production deployment
5. Environment variables changed
6. User explicitly requests it

### ❌ SKIP
- Minor typos/whitespace
- Dev tooling updates
- Comment-only changes
- Test file updates

## Examples

### Security Fix
```bash
node scripts/send-changelog.js \
  --title "🔒 Security Patch" \
  --category "security" \
  --changes "Fixed CORS wildcard\nAdded request validation"
```

### New Feature
```bash
node scripts/send-changelog.js \
  --title "✨ AI Chat" \
  --category "feature" \
  --changes "Added streaming endpoint\nImplemented token budget"
```

### Deployment
```bash
node scripts/send-changelog.js \
  --title "🚀 v2.0.0" \
  --category "deployment" \
  --changes "Released to production\nMigrated database"
```

## Configuration

**File:** `.env` (project root)
```env
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
TELEGRAM_CHANGELOG_THREAD_ID=your_changelog_thread
TELEGRAM_DEV_THREAD_ID=your_dev_thread
```

**Current Setup:**
- Chat ID: `-1003764877044`
- Changelog Thread ID: `718`
- Dev Thread ID: `727` (checklist, todo, processing, bug fix, coding)
- Status: ✅ Working

## Testing

```bash
# Test message
node scripts/send-changelog.js --title "Test" --changes "Test message"

# Full security report
node scripts/send-security-report.js
```
