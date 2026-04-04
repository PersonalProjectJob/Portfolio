# Job360 QA Testing - Quick Reference

## 🎯 What This Is

Senior QA Automation Testing standards for **pre-commit stage testing**. Ensures all features/code are validated in staging BEFORE committing to production.

**Experience Level**: 10+ years of automation testing expertise

---

## ⚡ Quick Start (Run Before EVERY Commit)

```bash
# Easiest way (Windows) - Telegram report ALWAYS sent
test-pre-commit.bat

# Or PowerShell - Telegram report ALWAYS sent
.\test-pre-commit.ps1

# Or directly - Telegram report ALWAYS sent
node test-pre-commit.js
```

**Exit Codes:**
- `0` = ✅ Safe to commit (Telegram report sent)
- `1` = ❌ DO NOT commit (tests failed, Telegram report sent)
- `2` = ⚠️ Configuration error

---

## 📦 What's Included

### Rules & Skills

| File | Purpose |
|------|---------|
| `.qwen/rules/senior-qa-automation.mdc` | Testing standards & best practices |
| `.qwen/skills/senior-qa-automation/SKILL.md` | Senior QA Engineer persona & test patterns |
| `Docs/senior-qa-automation-guide.md` | Complete documentation |

### Test Scripts

| Script | What It Tests |
|--------|---------------|
| `test-pre-commit.js` | **Main runner** - executes all test suites |
| `test-phase1-critical-security.js` | 5 CRITICAL security vulnerabilities |
| `test-critical-fixes.js` | Validates security patches |

### Helper Scripts

| Script | Purpose |
|--------|---------|
| `test-pre-commit.bat` | Windows batch runner |
| `test-pre-commit.ps1` | PowerShell runner |

---

## 🧪 Test Suites (All Run Automatically)

1. **Code Linting** - ESLint validation
2. **Type Checking** - TypeScript compilation
3. **Unit Tests** - All existing unit tests
4. **Security Tests** ⚠️ CRITICAL - OWASP Top 10 coverage
5. **Critical Fixes** - Security patch validation
6. **Build** - Production build success

---

## 🔧 Common Commands

```bash
# Standard pre-commit check (Telegram ALWAYS sent)
node test-pre-commit.js

# See all details (Telegram ALWAYS sent)
node test-pre-commit.js --verbose

# Disable Telegram (if needed)
node test-pre-commit.js --no-telegram

# JSON output (for CI/CD)
node test-pre-commit.js --json

# Skip build (faster)
node test-pre-commit.js --skip-build

# Run only security tests
node test-phase1-critical-security.js

# Run specific security test
node test-phase1-critical-security.js --test C-01
```

**📌 Note:** Telegram reports are **ALWAYS sent by default** to Thread 735 (Pre-Commit Test Reports).

---

## 📊 Understanding Results

### Pass Criteria
✅ All tests must pass before commit

### Blocking Conditions
❌ Any security test failure  
❌ Any critical test failure  
❌ Build failure  
❌ Coverage below thresholds

### Warning Conditions
⚠️ Non-critical failures (document & track)  
⚠️ Skipped integration tests  
⚠️ Coverage warnings

---

## 📚 Full Documentation

See `Docs/senior-qa-automation-guide.md` for:
- Complete testing standards
- Test writing templates
- Security testing examples
- Defect management
- Best practices
- FAQ

---

## 🎓 Using the QA Skill in Qwen Code

When you need help with testing, invoke the skill:

```
/senior-qa-automation
```

Then ask questions like:
- "How do I test this API endpoint?"
- "Write security tests for file upload"
- "Create edge case tests for user registration"
- "What should I test before committing this feature?"

---

## 📞 Telegram Setup (Optional)

Add to `.env`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

Then run:
```bash
node test-pre-commit.js --telegram
```

---

## ✅ Pre-Commit Checklist

- [ ] Run `test-pre-commit.js`
- [ ] All tests pass (exit code 0)
- [ ] Review any warnings
- [ ] JSON report generated
- [ ] Team notified (if using Telegram)
- [ ] Safe to commit! 🚀

---

## 🔗 Related Files

- **Main Rule**: `.qwen/rules/senior-qa-automation.mdc`
- **Main Skill**: `.qwen/skills/senior-qa-automation/SKILL.md`
- **QA Doc Skill**: `.qwen/skills/qa-doc/SKILL.md`
- **Guide**: `Docs/senior-qa-automation-guide.md`

---

**Remember**: Test thoroughly, commit confidently! 💪
