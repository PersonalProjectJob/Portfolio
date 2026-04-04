# Job360 Senior QA Automation Testing Guide

## Overview

This guide establishes **Senior QA Automation Testing standards** for the Job360 project, embodying 10+ years of automation testing expertise. It provides comprehensive frameworks for testing all features/code in staging environment **BEFORE committing** to production.

## 📋 What's Included

### 1. Rules & Skills

- **Rule**: `.qwen/rules/senior-qa-automation.mdc`
  - Comprehensive testing standards and best practices
  - Pre-commit workflow requirements
  - Quality gate enforcement criteria
  - Test coverage thresholds

- **Skill**: `.qwen/skills/senior-qa-automation/SKILL.md`
  - Senior QA Engineer persona (10+ years experience)
  - Test design patterns and examples
  - Report generation templates
  - Telegram integration guide

### 2. Test Scripts

- **Main Pre-Commit Runner**: `test-pre-commit.js`
  - Orchestrates all test suites
  - Generates JSON reports
  - Sends Telegram notifications
  - Enforces quality gates

- **Security Tests**: `test-phase1-critical-security.js`
  - 5 CRITICAL security vulnerabilities
  - OWASP Top 10 coverage
  - Automated validation

- **Critical Fixes**: `test-critical-fixes.js`
  - Validates security patches
  - Regression testing

### 3. Execution Scripts

- **Windows Batch**: `test-pre-commit.bat`
- **PowerShell**: `test-pre-commit.ps1`

Choose whichever you prefer for your workflow.

---

## 🚀 Quick Start

### Before ANY Commit

Run this command to validate your code:

```bash
# Windows (Batch)
test-pre-commit.bat

# Windows (PowerShell)
.\test-pre-commit.ps1

# Direct Node.js
node test-pre-commit.js
```

### With Options

```bash
# Verbose output (see all details)
node test-pre-commit.js --verbose

# Send Telegram notification
node test-pre-commit.js --telegram

# JSON output only (for CI/CD)
node test-pre-commit.js --json

# Skip build validation (faster)
node test-pre-commit.js --skip-build

# Combine options
node test-pre-commit.js --verbose --telegram --skip-build
```

---

## 🧪 What Gets Tested

The pre-commit test runner executes **6 test suites**:

### 1. Code Linting
- ESLint validation
- Code style consistency
- No syntax errors

**Why**: Ensures code quality and consistency across the team.

### 2. Type Checking
- TypeScript compilation
- Type safety validation
- No type errors

**Why**: Catches type-related bugs before they reach production.

### 3. Unit Tests
- All existing unit tests
- Component logic
- Utility functions

**Why**: Validates individual units of code work as expected.

### 4. Security Tests ⚠️ CRITICAL
- Unauthenticated file deletion (CVSS 9.8)
- SQL injection via ILIKE wildcards (CVSS 8.6)
- Error details leakage (CVSS 7.5)
- Password hash exposure (CVSS 8.1)
- reCAPTCHA test key fallback (CVSS 9.1)

**Why**: Prevents critical security vulnerabilities from reaching production.

### 5. Critical Fixes Validation
- Verifies all security patches are working
- Regression testing for known issues

**Why**: Ensures fixes haven't been accidentally broken.

### 6. Build Validation
- Production build succeeds
- No compilation errors
- Bundle generation

**Why**: If it doesn't build, it can't run in production.

---

## 📊 Understanding Results

### Exit Codes

- **0**: ✅ All tests passed - Safe to commit
- **1**: ❌ Tests failed - DO NOT commit
- **2**: Configuration error (check setup)

### Console Output

```
================================================================================
📊 PRE-COMMIT TEST REPORT
================================================================================

Total Tests:  50
✅ Passed:   48
❌ Failed:   2
⚠️  Warnings: 0
⏭️  Skipped:  0

Pass Rate:    96.0%
Duration:     15.23s
Quality Gate: FAIL

❌ 2 TEST(S) FAILED - DO NOT COMMIT!

Failed tests:
  - SEC-01: Security vulnerabilities found - BLOCK commit
  - UNIT-05: Unit test failing
```

### JSON Report

Generated as: `pre-commit-report-YYYY-MM-DD-HH-MM-SS.json`

```json
{
  "phase": "Pre-Commit Validation",
  "timestamp": "2026-04-04T10:00:00Z",
  "total": 50,
  "passed": 48,
  "failed": 2,
  "skipped": 0,
  "passRate": "96.0",
  "qualityGate": "FAIL",
  "summary": {
    "criticalFailures": 1,
    "readinessAssessment": "NOT_READY"
  },
  "details": [
    {
      "testId": "SEC-01",
      "name": "Security Tests",
      "status": "FAIL",
      "message": "Security vulnerabilities found",
      "severity": "CRITICAL",
      "timestamp": "2026-04-04T10:00:15Z"
    }
  ]
}
```

---

## 🚦 Quality Gate Criteria

### BLOCK Commit If:

- ❌ Any security test fails (100% pass required)
- ❌ Any critical tests fail
- ❌ Build fails
- ❌ Test coverage drops below thresholds
- ❌ Linting/type errors present

### WARN (Document & Track):

- ⚠️ Non-critical test failures
- ⚠️ Coverage warnings
- ⚠️ Skipped integration tests

### ALLOW Commit If:

- ✅ All tests pass
- ✅ Only low-severity warnings
- ✅ P2/P3 issues documented with tracking tickets

---

## 📈 Test Coverage Requirements

### Minimum Thresholds

| Category | Minimum | Critical Paths |
|----------|---------|----------------|
| Lines | 85% | 100% |
| Functions | 85% | 100% |
| Branches | 75% | 100% |
| Statements | 85% | 100% |

### Critical Paths (100% Required)

- User authentication & authorization
- Payment processing (if applicable)
- Data deletion operations
- Password management
- File upload/download

---

## 🛠️ Writing New Tests

### Test Structure Template

```javascript
#!/usr/bin/env node

/**
 * Test Suite: [Feature Name]
 * Purpose: [What this validates]
 * Author: Senior QA Engineer
 * 
 * Usage: node test-[feature].js [options]
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  verbose: process.argv.includes('--verbose'),
  timeout: 10000,
};

// Results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: [],
  startTime: Date.now(),
};

// Utility: Make HTTP request
function makeRequest(url, options = {}) {
  // ... implementation (see test-pre-commit.js)
}

// Utility: Record test result
function recordTest(testId, name, status, message, severity = 'HIGH') {
  results.total++;
  results[status === 'PASS' ? 'passed' : status === 'FAIL' ? 'failed' : 'skipped']++;
  results.details.push({ testId, name, status, message, severity, timestamp: new Date().toISOString() });
  
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  const color = status === 'PASS' ? '\x1b[32m' : status === 'FAIL' ? '\x1b[31m' : '\x1b[33m';
  console.log(`  ${icon} ${message}`, color);
}

// Test Implementation
async function testFeature() {
  log('\n' + '='.repeat(80));
  log('🧪 Feature: [Name]', '\x1b[1m');
  log('='.repeat(80));

  // Test 1: Happy path
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/endpoint`, {
      method: 'POST',
      body: JSON.stringify({ /* test data */ })
    });

    if (response.status === 200) {
      recordTest('TEST-01', 'Feature', 'PASS', 'Happy path works');
    } else {
      recordTest('TEST-01', 'Feature', 'FAIL', `Expected 200 but got ${response.status}`);
    }
  } catch (err) {
    recordTest('TEST-01', 'Feature', 'FAIL', `Error: ${err.message}`);
  }

  // Test 2: Edge case
  // ... more tests
}

// Report
function printReport() {
  const duration = Date.now() - results.startTime;
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST REPORT');
  console.log('='.repeat(80));
  console.log(`Total: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Pass Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
}

// Main
async function main() {
  await testFeature();
  printReport();
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
```

---

## 🔐 Security Testing Standards

### Always Test These Security Areas

#### 1. Authentication
```javascript
// Unauthenticated access should be rejected
it('should require authentication', async () => {
  const response = await makeRequest('/api/protected');
  expect(response.status).toBe(401);
});

// Invalid tokens should be rejected
it('should reject invalid tokens', async () => {
  const response = await makeRequest('/api/protected', {
    headers: { 'Authorization': 'Bearer invalid-token' }
  });
  expect(response.status).toBe(401);
});
```

#### 2. Authorization
```javascript
// Users should only access their own data
it('should prevent access to other users data', async () => {
  const response = await makeRequest('/api/users/user-a/data', {
    headers: { 'Authorization': 'Bearer user-b-token' }
  });
  expect(response.status).toBe(403);
});
```

#### 3. Input Validation
```javascript
// SQL injection prevention
it('should escape ILIKE wildcards', () => {
  const escape = (str) => str.replace(/%/g, '\\%').replace(/_/g, '\\_');
  expect(escape('%')).toBe('\\%');
  expect(escape('_')).toBe('\\_');
});

// XSS prevention
it('should sanitize HTML input', () => {
  // ... validation logic
});
```

#### 4. Data Exposure
```javascript
// Sensitive data should not be in responses
it('should not expose password hashes', async () => {
  const response = await makeRequest('/api/users');
  expect(response.body).not.toContain('password_hash');
});
```

---

## 📞 Telegram Integration

### Setup

Create a `.env` file (or add to existing):

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### Usage

```bash
node test-pre-commit.js --telegram
```

### Report Format

The Telegram message includes:
- Test summary (pass/fail/skip counts)
- Pass rate percentage
- Duration
- Quality gate status
- Readiness assessment
- Action items

---

## 🎯 Best Practices

### DO ✅

- Write descriptive test names: `should [behavior] when [condition]`
- Test behavior, not implementation
- Use meaningful assertions (not just status codes)
- Mock external dependencies
- Implement proper test isolation
- Use test data builders/factories
- Write meaningful error messages
- Tag tests by category (smoke, regression, security)
- Review tests in PR like production code
- Keep tests fast (< 10s per test)
- Make tests deterministic

### DON'T ❌

- Test implementation details
- Make tests dependent on execution order
- Use hard-coded test data (use factories)
- Ignore flaky tests (fix immediately)
- Test only happy path
- Duplicate test code
- Write slow tests (> 10s)
- Write tests without assertions
- Test third-party code (mock it)
- Leave incomplete test cleanup

---

## 📝 Pre-Commit Checklist

Before EVERY commit, verify:

- [ ] All linting checks pass
- [ ] All type checks pass
- [ ] All unit tests pass
- [ ] All security tests pass (100% required)
- [ ] All critical fixes validated
- [ ] Production build succeeds
- [ ] Test coverage meets thresholds (85%+ lines)
- [ ] No P0/P1 defects found
- [ ] Critical user journeys validated
- [ ] No sensitive data exposure
- [ ] Performance benchmarks met
- [ ] Error handling tested
- [ ] Edge cases covered

---

## 🚨 Defect Management

### Severity Levels

#### CRITICAL (P0) - BLOCK COMMIT
- Data loss
- Security breach
- System crash
- Authentication bypass

#### HIGH (P1) - FIX BEFORE COMMIT
- Core feature broken
- Workaround exists but UX impacted
- Performance degradation > 50%

#### MEDIUM (P2) - DOCUMENT & TRACK
- Non-critical bug
- Affects UX but not functionality
- Cosmetic issues with impact

#### LOW (P3) - BACKLOG
- Minor cosmetic issue
- Enhancement request
- Nice-to-have improvement

### Defect Report Template

```markdown
## Defect Report

**ID**: DEF-20260404-001
**Severity**: CRITICAL
**Category**: Security
**Test**: SEC-01
**Description**: Unauthenticated users can delete CV files
**Impact**: Any user can delete other users' CVs, causing data loss
**Steps to Reproduce**:
1. Send POST request to /delete-cv without auth token
2. Include valid publicIds in body
3. Expected: 401 Unauthorized
4. Actual: 200 OK with deletion

**Evidence**: [Test output, logs]
**Recommendation**: Add authentication middleware check before deletion
**Status**: OPEN
```

---

## 📊 Metrics & KPIs

Track these to measure testing effectiveness:

| Metric | Target | Current |
|--------|--------|---------|
| Test Pass Rate | > 95% | Track over time |
| Defect Escape Rate | < 5% | Track over time |
| Test Execution Time | < 5 min | ~15-30s |
| Code Coverage (Lines) | > 85% | Check with tests |
| Code Coverage (Branches) | > 75% | Check with tests |
| Flaky Tests | 0 | Track count |
| Critical Defects Found | Trend down | Track over time |
| Time to Fix (Critical) | < 4 hours | Track average |

---

## 🔗 References

- **Senior QA Rule**: `.qwen/rules/senior-qa-automation.mdc`
- **Senior QA Skill**: `.qwen/skills/senior-qa-automation/SKILL.md`
- **QA Doc Skill**: `.qwen/skills/qa-doc/SKILL.md`
- **Engineering Standards**: `.qwen/rules/engineering-doc.mdc`
- **Frontend Standards**: `.qwen/rules/frontend-code-standards.mdc`

### Existing Test Files

- `test-pre-commit.js` - Main pre-commit test runner
- `test-phase1-critical-security.js` - Security vulnerability tests
- `test-critical-fixes.js` - Critical fixes validation
- `scripts/` - Various test and reporting scripts

---

## 💡 Pro Tips

### 1. Use Verbose Mode for Debugging

```bash
node test-pre-commit.js --verbose
```

See exactly what's happening, including:
- Commands being run
- HTTP request/response details
- Test execution steps

### 2. Integrate with Git Hooks

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
node test-pre-commit.js || exit 1
```

### 3. Use JSON Output for CI/CD

```bash
node test-pre-commit.js --json > test-results.json
```

Parse in your CI/CD pipeline for automated quality gates.

### 4. Send Telegram Reports for Visibility

```bash
node test-pre-commit.js --telegram
```

Keep the whole team informed of test results.

### 5. Skip Build for Quick Checks

```bash
node test-pre-commit.js --skip-build
```

Useful when you know build will pass and want faster feedback.

---

## ❓ FAQ

**Q: How often should I run pre-commit tests?**

A: **BEFORE EVERY COMMIT.** This is non-negotiable for maintaining quality.

**Q: What if tests take too long?**

A: Optimize slow tests. Each test should be < 10s. Use mocking for external services.

**Q: Can I skip security tests?**

A: **NEVER.** Security tests are mandatory and will block commit if they fail.

**Q: What if I need to commit despite failures?**

A: You shouldn't. Fix the issues first. If absolutely necessary, use `--skip-build` or document why it's acceptable.

**Q: How do I add new tests?**

A: Create a new `test-[feature].js` file following the template in this guide. Add it to `test-pre-commit.js`.

**Q: Can I run tests individually?**

A: Yes, run specific test files directly:
```bash
node test-phase1-critical-security.js --test C-01
```

---

## 🎓 Learning Resources

### Test Automation

- Test Pyramid: https://martinfowler.com/bliki/TestPyramid.html
- AAA Pattern: Arrange-Act-Assert
- Page Object Model (for E2E)

### Security Testing

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection
- XSS Prevention: https://owasp.org/www-community/attacks/xss/

### Performance Testing

- Response Time Budgets: < 200ms API, < 1s page load
- Load Testing: Simulate expected concurrent users
- Memory Testing: Check for leaks, monitor growth

---

## 📞 Support

For questions about these QA standards:

1. Review this documentation
2. Check existing test files for examples
3. Use the `/senior-qa-automation` skill in Qwen Code
4. Consult with team QA lead

---

**Remember**: Quality is everyone's responsibility. Test thoroughly, commit confidently. 🚀
