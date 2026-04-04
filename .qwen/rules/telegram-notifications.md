# Telegram Notification Rules

## Thread Routing

| Thread ID | Purpose | Script |
|-----------|---------|--------|
| `718` | Changelog (features, releases, breaking changes) | `send-changelog.js` |
| `727` | Dev Working (bug fixes, coding, checklist, todo, processing) | `send-dev-report.js` |

## When to Send Changelog to Telegram (Thread 718)

**ALWAYS** send a changelog notification when ANY of these occur:

### 🚀 Trigger Conditions

1. **Major Feature Added**
   - New user-facing functionality
   - New API endpoints
   - New integrations (AI providers, payment, etc.)

2. **Security Changes**
   - Authentication/authorization updates
   - CORS/rate limiting/security middleware changes
   - Vulnerability fixes
   - Environment variable changes
   - Any hardcoded secrets removed

3. **Breaking Changes**
   - API contract changes
   - Database schema migrations
   - Removed/deprecated features
   - Configuration changes

4. **Deployment/Release**
   - Version bump in package.json
   - Production deployment
   - Major refactoring completed

5. **User Requests**
   - When user explicitly asks: "send changelog", "notify telegram", "update telegram"
   - When user asks to generate a changelog summary

### 📋 How to Send

Use the changelog script with appropriate parameters:

```bash
node scripts/send-changelog.js \
  --title "Brief Summary" \
  --category "feature|fix|security|deployment|breaking" \
  --changes "Change 1\nChange 2\nChange 3"
```

**Category Options:**
- `feature` ✨ - New functionality
- `fix` 🐛 - Bug fixes
- `security` 🔒 - Security improvements
- `deployment` 🚀 - Releases/deployments
- `breaking` ⚠️ - Breaking changes
- `performance` ⚡ - Performance improvements
- `refactor` ♻️ - Code restructuring

### 📝 Format Guidelines

**Keep changes concise:**
- Max 10 items per notification
- Start with action verbs (Added, Fixed, Removed, Updated)
- Include file names when relevant
- Highlight security items first

**Example:**
```bash
node scripts/send-changelog.js \
  --title "🔒 Security Fixes Applied" \
  --category "security" \
  --changes "Removed hardcoded credentials\nRestricted CORS to tnsthao94.online\nAdded request signature validation\nImplemented IP header sanitization"
```

### ⚠️ Important Notes

1. **Never commit .env** - The .env file contains Telegram credentials
2. **Thread fallback** - Script automatically retries without thread ID if topic not found
3. **HTML format** - Messages use HTML parse mode, not Markdown
4. **Timezone** - All timestamps in Asia/Ho_Chi_Minh (Vietnam)

### 🔧 Testing

Before sending, verify the message looks good:
```bash
# Dry run - just print the message
node scripts/send-changelog.js --title "Test" --changes "Test message"
```

## When NOT to Send

- Minor typos/whitespace changes
- Development tooling updates (linters, formatters)
- Comment-only changes
- Temporary debugging code
- Test file updates (unless they reveal security issues)

---

## Dev Working Reports (Thread 727)

Send dev working reports for active development tasks. Auto-includes modified files.

### 🚀 Trigger Conditions

1. **Bug Fix Completed**
2. **Feature Implementation Progress**
3. **Checklist/Todo Items**
4. **Processing/Task Status Updates**

### 📋 How to Send

```bash
node scripts/send-dev-report.js "Brief title" "Summary of changes"

# Or with explicit flags:
node scripts/send-dev-report.js \
  --title "Fix login bug" \
  --changes "Fixed session timeout\nAdded error handling"
```

### 📝 Auto-Reported Information

The script automatically includes:
- **📋 Todo Progress** (from `TODO.md`) — completed/pending with percentage
- **Modified files** (from `git status`)
- **Added files** (new files)
- **Deleted files** (removed files)
- **Diff stats** (lines changed per file)

### 📝 TODO.md Format

```markdown
# Todo List

- [x] Completed task 1
- [x] Completed task 2
- [ ] Pending task 3
- [ ] Pending task 4

*Last updated: 04/04/2026 14:30*
```

### 📝 Example Output

```
🛠️ Dev Working Report
📅 Date: 04/04/2026 14:30
📌 Title: FeatureCards redesign done

📋 Progress: 2/5 (40%)
   Updated: 04/04/2026 14:30

✅ Completed:
  ✓ Redesign FeatureCards with 3D carousel
  ✓ Fix theme consistency (light theme)

⏳ Pending:
  • Add glass-morphism card effects
  • Implement scroll-driven animations
  • Test on mobile devices

✅ Changes:
Implemented 3D carousel with glass-morphism cards
```
