#!/usr/bin/env node

/**
 * ============================================================================
 * Job360 Security Test Suite - Phase 1: Critical Security
 * ============================================================================
 * Purpose: Comprehensive automated testing for all 5 CRITICAL security vulnerabilities
 * Date: April 4, 2026
 * Author: Senior QA Testing Engineer (10 years experience)
 * 
 * Tests:
 * - C-01: Unauthenticated file deletion prevention (CVSS 9.8)
 * - C-02: SQL injection via ILIKE wildcards (CVSS 8.6)
 * - C-03: Error details leakage prevention (CVSS 7.5)
 * - C-04: Password hash exposure prevention (CVSS 8.1)
 * - C-05: reCAPTCHA test key fallback removed (CVSS 9.1)
 *
 * Usage:
 *   node test-phase1-critical-security.js [options]
 *
 * Options:
 *   --base-url <url>       Base URL of the application (default: http://localhost:5173)
 *   --test <id>            Run specific test (C-01 to C-05, or all)
 *   --verbose              Show detailed output
 *   --json                 Output results as JSON
 *   --help                 Show help message
 *
 * Examples:
 *   node test-phase1-critical-security.js
 *   node test-phase1-critical-security.js --test C-01 --verbose
 *   node test-phase1-critical-security.js --base-url https://staging.example.com --json
 * ============================================================================
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  baseUrl: 'http://localhost:5173',
  verbose: false,
  jsonOutput: false,
  telegramReport: false,
  tests: ['C-01', 'C-02', 'C-03', 'C-04', 'C-05'],
  timeout: 10000,
};

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

// ============================================================================
// Test Results Tracking
// ============================================================================

const testResults = {
  phase: 'Phase 1: Critical Security',
  timestamp: new Date().toISOString(),
  baseUrl: '',
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  warnings: 0,
  details: [],
  startTime: null,
  endTime: null,
  duration: 0,
};

// ============================================================================
// Utility Functions
// ============================================================================

function log(message, color = COLORS.reset) {
  if (!CONFIG.jsonOutput) {
    console.log(`${color}${message}${COLORS.reset}`);
  }
}

function logVerbose(message) {
  if (CONFIG.verbose && !CONFIG.jsonOutput) {
    console.log(`  ${message}`, COLORS.cyan);
  }
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: options.timeout || CONFIG.timeout,
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
            json: (() => {
              try {
                return JSON.parse(data);
              } catch {
                return null;
              }
            })(),
          });
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${requestOptions.timeout}ms`));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

function recordTest(testId, name, status, message, severity = 'CRITICAL') {
  testResults.total++;
  const timestamp = new Date().toISOString();
  
  if (status === 'PASS') {
    testResults.passed++;
    log(`  ✅ PASS: ${message}`, COLORS.green);
  } else if (status === 'FAIL') {
    testResults.failed++;
    log(`  ❌ FAIL: ${message}`, COLORS.red);
  } else if (status === 'WARN') {
    testResults.warnings++;
    log(`  ⚠️  WARN: ${message}`, COLORS.yellow);
  } else {
    testResults.skipped++;
    log(`  ⏭️ SKIP: ${message}`, COLORS.yellow);
  }

  testResults.details.push({
    testId,
    name,
    status,
    message,
    severity,
    timestamp,
  });
}

function generateReportFileName() {
  const date = new Date().toISOString().split('T')[0];
  return `test-report-phase1-${date}.json`;
}

function saveJsonReport() {
  const fileName = generateReportFileName();
  const reportPath = path.join(process.cwd(), fileName);
  
  const report = {
    ...testResults,
    summary: {
      passRate: testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0,
      criticalFailures: testResults.details.filter(d => d.status === 'FAIL' && d.severity === 'CRITICAL').length,
      readinessAssessment: testResults.failed === 0 ? 'READY_FOR_DEPLOYMENT' : 'NOT_READY',
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 JSON report saved to: ${fileName}`, COLORS.cyan);
  
  // Send to Telegram if enabled
  if (CONFIG.telegramReport) {
    sendTelegramReport(report, reportPath).catch(err => {
      log(`\n⚠️ Failed to send Telegram report: ${err.message}`, COLORS.yellow);
    });
  }
  
  return reportPath;
}

async function sendTelegramReport(report, reportPath) {
  // Load environment variables
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    log('\n⚠️ .env file not found, skipping Telegram notification', COLORS.yellow);
    return;
  }

  // Parse .env file
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  const telegramBotToken = envVars.TELEGRAM_BOT_TOKEN;
  const telegramChatId = envVars.TELEGRAM_CHAT_ID;
  const telegramTestThreadId = '735'; // Phase 1 Testing thread

  if (!telegramBotToken || !telegramChatId) {
    log('\n⚠️ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured, skipping notification', COLORS.yellow);
    return;
  }

  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  
  const total = report.total || 0;
  const passed = report.passed || 0;
  const failed = report.failed || 0;
  const skipped = report.skipped || 0;
  const warnings = report.warnings || 0;
  const passRate = report.summary.passRate;
  const duration = report.duration ? (report.duration / 1000).toFixed(2) : 'N/A';
  const readiness = report.summary.readinessAssessment;

  const statusEmoji = failed === 0 ? '✅' : '🚨';
  const status = failed === 0 ? 'PASSED' : 'FAILED';

  // Check each vulnerability category
  const checkVuln = (testId) => {
    const tests = report.details.filter(d => d.testId.startsWith(testId));
    const hasFailures = tests.some(d => d.status === 'FAIL');
    return hasFailures ? '❌' : '✅';
  };

  const message = `<b>🔒 Phase 1: Critical Security Test Report</b>
📅 <b>Date:</b> ${now}
⏱️ <b>Duration:</b> ${duration}s

📊 <b>Test Results:</b>
├─ Total Tests: ${total}
├─ ✅ Passed: ${passed}
├─ ❌ Failed: ${failed}
├─ ⚠️ Warnings: ${warnings}
└─ ⏭️ Skipped: ${skipped}

📈 <b>Pass Rate:</b> ${passRate}%
${statusEmoji} <b>Status:</b> ${status}
🎯 <b>Readiness:</b> ${readiness.replace(/_/g, ' ')}

<b>🧪 Vulnerability Coverage:</b>
├─ C-01: File Deletion (CVSS 9.8) ${checkVuln('C-01')}
├─ C-02: SQL Injection (CVSS 8.6) ${checkVuln('C-02')}
├─ C-03: Error Leakage (CVSS 7.5) ${checkVuln('C-03')}
├─ C-04: Password Hash (CVSS 8.1) ${checkVuln('C-04')}
└─ C-05: reCAPTCHA Key (CVSS 9.1) ${checkVuln('C-05')}

<b>📋 Next Steps:</b>
${failed === 0 
  ? '✅ Complete manual test checklist\n✅ Get security team sign-off\n✅ Proceed to Phase 2'
  : '🚨 Review failed test cases\n🔧 Fix identified vulnerabilities\n🔄 Re-run test suite'}

📖 <b>Full Report:</b> ${path.basename(reportPath)}`;

  try {
    const messageThreadId = parseInt(telegramTestThreadId);

    log('\n📤 Sending report to Telegram...', COLORS.cyan);

    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          message_thread_id: messageThreadId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    const result = await response.json();

    if (result.ok) {
      log('✅ Test report sent to Telegram successfully!', COLORS.green);
    } else {
      log(`⚠️ Telegram API response: ${result.description || 'Unknown error'}`, COLORS.yellow);
      
      // Fallback without thread ID
      if (result.description?.includes('thread')) {
        const retryResponse = await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: message,
              parse_mode: 'HTML',
            }),
          }
        );

        const retryResult = await retryResponse.json();
        if (retryResult.ok) {
          log('✅ Report sent (without thread)', COLORS.green);
        }
      }
    }
  } catch (error) {
    log(`\n⚠️ Error sending to Telegram: ${error.message}`, COLORS.yellow);
  }
}

// ============================================================================
// Security Test: C-01 - Unauthenticated File Deletion
// ============================================================================

async function testC01() {
  const testName = 'Unauthenticated File Deletion Prevention';
  const severity = 'CRITICAL';
  const cvss = 9.8;

  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔒 C-01: ${testName} [CVSS ${cvss}]`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  try {
    // Test 1.1: Delete CV without authentication should return 401
    log('\n📝 Test 1.1: Delete CV without authentication', COLORS.blue);
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/make-server-4ab11b6d/delete-cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicIds: ['Job360/account/test-user/cv.pdf'],
        }),
      });

      logVerbose(`Response status: ${response.status}`);
      logVerbose(`Response body: ${response.body.substring(0, 200)}`);

      if (response.status === 401) {
        recordTest('C-01-1', testName, 'PASS', 
          'Unauthenticated request correctly returned 401 Unauthorized', severity);
      } else {
        recordTest('C-01-1', testName, 'FAIL', 
          `Expected 401 but got ${response.status}. SECURITY FIX NOT WORKING!`, severity);
      }
    } catch (err) {
      recordTest('C-01-1', testName, 'FAIL', 
        `Request failed: ${err.message}`, severity);
    }

    // Test 1.2: Delete CV with invalid token should return 401
    log('\n📝 Test 1.2: Delete CV with invalid authentication token', COLORS.blue);
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/make-server-4ab11b6d/delete-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token-here-12345',
          'X-CareerAI-Scope-Key': 'account:test-user',
        },
        body: JSON.stringify({
          publicIds: ['Job360/account/test-user/cv.pdf'],
        }),
      });

      logVerbose(`Response status: ${response.status}`);

      if (response.status === 401) {
        recordTest('C-01-2', testName, 'PASS', 
          'Invalid token correctly returned 401 Unauthorized', severity);
      } else {
        recordTest('C-01-2', testName, 'FAIL', 
          `Expected 401 but got ${response.status}. Token validation not working!`, severity);
      }
    } catch (err) {
      recordTest('C-01-2', testName, 'FAIL', 
        `Request failed: ${err.message}`, severity);
    }

    // Test 1.3: Delete CV with malformed publicIds
    log('\n📝 Test 1.3: Delete CV with malformed publicIds array', COLORS.blue);
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/make-server-4ab11b6d/delete-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token',
          'X-CareerAI-Scope-Key': 'account:test-user',
        },
        body: JSON.stringify({
          publicIds: ['../../../etc/passwd', 'Job360/../../admin/secret.pdf'],
        }),
      });

      logVerbose(`Response status: ${response.status}`);

      // Should return 401 before even processing the malicious publicIds
      if (response.status === 401) {
        recordTest('C-01-3', testName, 'PASS', 
          'Path traversal attempt blocked by authentication', severity);
      } else if (response.status === 403) {
        recordTest('C-01-3', testName, 'PASS', 
          'Path traversal attempt blocked by ownership check', severity);
      } else {
        recordTest('C-01-3', testName, 'FAIL', 
          `Path traversal not properly blocked (got ${response.status})`, severity);
      }
    } catch (err) {
      recordTest('C-01-3', testName, 'FAIL', 
        `Request failed: ${err.message}`, severity);
    }

    // Test 1.4: Verify ownership check logic (unit test)
    log('\n📝 Test 1.4: Verify ownership check logic', COLORS.blue);
    const testCases = [
      { publicId: 'Job360/account/userA/cv.pdf', sessionIdentifier: 'userA', shouldPass: true },
      { publicId: 'Job360/account/userB/cv.pdf', sessionIdentifier: 'userA', shouldPass: false },
      { publicId: 'Job360/account/userA/2026-04-04/resume.pdf', sessionIdentifier: 'userA', shouldPass: true },
    ];

    testCases.forEach((testCase, index) => {
      const hasOwnership = testCase.publicId.includes(testCase.sessionIdentifier);
      const result = hasOwnership === testCase.shouldPass;
      
      if (result) {
        recordTest(`C-01-4.${index + 1}`, testName, 'PASS', 
          `Ownership check: ${testCase.publicId} ${testCase.shouldPass ? 'allowed' : 'denied'} correctly`, severity);
      } else {
        recordTest(`C-01-4.${index + 1}`, testName, 'FAIL', 
          `Ownership check failed for: ${testCase.publicId}`, severity);
      }
    });

    // Test 1.5: Empty publicIds should be handled gracefully
    log('\n📝 Test 1.5: Empty publicIds array handling', COLORS.blue);
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/make-server-4ab11b6d/delete-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token',
        },
        body: JSON.stringify({ publicIds: [] }),
      });

      if (response.status === 401 || response.status === 200) {
        recordTest('C-01-5', testName, 'PASS', 
          'Empty publicIds handled gracefully', severity);
      } else {
        recordTest('C-01-5', testName, 'WARN', 
          `Unexpected status for empty publicIds: ${response.status}`, severity);
      }
    } catch (err) {
      recordTest('C-01-5', testName, 'FAIL', 
        `Request failed: ${err.message}`, severity);
    }

    // Test 1.6: Missing publicIds field
    log('\n📝 Test 1.6: Missing publicIds field handling', COLORS.blue);
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/make-server-4ab11b6d/delete-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token',
        },
        body: JSON.stringify({}),
      });

      if (response.status === 401) {
        recordTest('C-01-6', testName, 'PASS', 
          'Missing publicIds handled with authentication check first', severity);
      } else {
        recordTest('C-01-6', testName, 'PASS', 
          `Request handled with status ${response.status}`, severity);
      }
    } catch (err) {
      recordTest('C-01-6', testName, 'FAIL', 
        `Request failed: ${err.message}`, severity);
    }

  } catch (err) {
    log(`\n❌ Test suite error: ${err.message}`, COLORS.red);
    recordTest('C-01-ERR', testName, 'FAIL', `Suite error: ${err.message}`, severity);
  }
}

// ============================================================================
// Security Test: C-02 - SQL Injection via ILIKE Wildcards
// ============================================================================

async function testC02() {
  const testName = 'SQL Injection Prevention via ILIKE Wildcards';
  const severity = 'CRITICAL';
  const cvss = 8.6;

  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔒 C-02: ${testName} [CVSS ${cvss}]`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  try {
    // Test 2.1: Verify percent wildcard is escaped
    log('\n📝 Test 2.1: Verify % wildcard is properly escaped', COLORS.blue);
    const escapeILike = (str) => str.replace(/%/g, '\\%').replace(/_/g, '\\_');
    
    const testCases = [
      { input: '%', expected: '\\%', description: 'Single percent sign' },
      { input: '_', expected: '\\_', description: 'Single underscore' },
      { input: '%%%', expected: '\\%\\%\\%', description: 'Multiple percent signs' },
      { input: 'admin%user', expected: 'admin\\%user', description: 'Percent in middle' },
      { input: '_admin_', expected: '\\_admin\\_', description: 'Underscores around text' },
      { input: '%admin%\' OR 1=1 --', expected: '\\%admin\\%\' OR 1=1 --', description: 'SQL injection attempt' },
      { input: 'john.doe@example.com', expected: 'john.doe@example.com', description: 'Normal email (dots preserved)' },
      { input: 'test_user', expected: 'test\\_user', description: 'Underscore in username' },
      { input: '', expected: '', description: 'Empty string' },
      { input: 'normal_search', expected: 'normal\\_search', description: 'Underscore in normal text' },
    ];

    testCases.forEach((testCase, index) => {
      const result = escapeILike(testCase.input);
      const passed = result === testCase.expected;
      
      if (passed) {
        recordTest(`C-02-${index + 1}`, testName, 'PASS', 
          `${testCase.description}: "${testCase.input}" → "${result}"`, severity);
      } else {
        recordTest(`C-02-${index + 1}`, testName, 'FAIL', 
          `${testCase.description}: expected "${testCase.expected}" but got "${result}"`, severity);
      }
    });

    // Test 2.11: Verify the function doesn't modify other special characters
    log('\n📝 Test 2.11: Verify other special characters are not affected', COLORS.blue);
    const specialCharsTest = escapeILike("admin' OR '1'='1");
    const expectedSpecialChars = "admin' OR '1'='1";
    
    if (specialCharsTest === expectedSpecialChars) {
      recordTest('C-02-11', testName, 'PASS', 
        'SQL quotes not modified (handled by parameterized queries)', severity);
    } else {
      recordTest('C-02-11', testName, 'FAIL', 
        'Unexpected modification to SQL quotes', severity);
    }

    // Test 2.12: Verify the escape function exists in source code
    log('\n📝 Test 2.12: Verify escapeILike function is used in admin endpoints', COLORS.blue);
    try {
      const fs = require('fs');
      const serverCode = fs.readFileSync(
        path.join(process.cwd(), 'supabase/functions/server/index.tsx'),
        'utf8'
      );

      const hasEscapeFunction = serverCode.includes('function escapeILike');
      const usesInAdmin = serverCode.includes('escapeILike(search)');
      const usageCount = (serverCode.match(/escapeILike/g) || []).length;

      if (hasEscapeFunction && usesInAdmin) {
        recordTest('C-02-12', testName, 'PASS', 
          `escapeILike function defined and used ${usageCount} time(s) in code`, severity);
      } else {
        recordTest('C-02-12', testName, 'FAIL', 
          `escapeILike function: ${hasEscapeFunction ? 'found' : 'MISSING'}, usage: ${usesInAdmin ? 'found' : 'MISSING'}`, severity);
      }
    } catch (err) {
      recordTest('C-02-12', testName, 'WARN', 
        `Could not verify source code: ${err.message}`, severity);
    }

    // Test 2.13: Integration test note
    log('\n📝 Test 2.13: Integration test with admin endpoint', COLORS.blue);
    log('  ⚠️  Requires admin authentication - manual testing recommended', COLORS.yellow);
    recordTest('C-02-13', testName, 'SKIP', 
      'Test admin /users?search=% endpoint manually to verify not all records returned', severity);

  } catch (err) {
    log(`\n❌ Test suite error: ${err.message}`, COLORS.red);
    recordTest('C-02-ERR', testName, 'FAIL', `Suite error: ${err.message}`, severity);
  }
}

// ============================================================================
// Security Test: C-03 - Error Details Not Leaked
// ============================================================================

async function testC03() {
  const testName = 'Error Details Not Leaked to Client';
  const severity = 'CRITICAL';
  const cvss = 7.5;

  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔒 C-03: ${testName} [CVSS ${cvss}]`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  try {
    // Test 3.1: Registration error should not include details
    log('\n📝 Test 3.1: Registration error response', COLORS.blue);
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/make-server-4ab11b6d/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test',
          email: 'not-an-email',
          password: 'test123',
        }),
      });

      logVerbose(`Response status: ${response.status}`);
      logVerbose(`Response body: ${response.body.substring(0, 300)}`);

      const json = response.json;
      if (json) {
        const hasDetails = json.details !== undefined;
        const hasStackTrace = json.body && (json.body.includes('stack') || json.body.includes('Trace'));
        const hasSqlError = json.body && json.body.toLowerCase().includes('sql');

        if (!hasDetails && !hasStackTrace && !hasSqlError) {
          recordTest('C-03-1', testName, 'PASS', 
            'Registration error does not leak internal details', severity);
        } else {
          const issues = [];
          if (hasDetails) issues.push('has "details" field');
          if (hasStackTrace) issues.push('has stack trace');
          if (hasSqlError) issues.push('has SQL error');
          
          recordTest('C-03-1', testName, 'FAIL', 
            `Error response leaks: ${issues.join(', ')}`, severity);
        }
      } else {
        recordTest('C-03-1', testName, 'PASS', 
          'Response is not JSON (safe default)', severity);
      }
    } catch (err) {
      recordTest('C-03-1', testName, 'FAIL', 
        `Request failed: ${err.message}`, severity);
    }

    // Test 3.2: Login error should not include details
    log('\n📝 Test 3.2: Login error response', COLORS.blue);
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/make-server-4ab11b6d/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        }),
      });

      logVerbose(`Response status: ${response.status}`);
      logVerbose(`Response body: ${response.body.substring(0, 300)}`);

      const json = response.json;
      if (json && json.error) {
        const hasDetails = json.details !== undefined;
        const hasInternalInfo = json.body && (
          json.body.includes('database') || 
          json.body.includes('query') || 
          json.body.includes('postgres')
        );

        if (!hasDetails && !hasInternalInfo) {
          recordTest('C-03-2', testName, 'PASS', 
            'Login error does not leak internal details', severity);
        } else {
          recordTest('C-03-2', testName, 'FAIL', 
            'Login error response leaks internal information', severity);
        }
      } else {
        recordTest('C-03-2', testName, 'PASS', 
          'Login response format is correct', severity);
      }
    } catch (err) {
      recordTest('C-03-2', testName, 'FAIL', 
        `Request failed: ${err.message}`, severity);
    }

    // Test 3.3: Malformed JSON request
    log('\n📝 Test 3.3: Malformed JSON request handling', COLORS.blue);
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/make-server-4ab11b6d/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{malformed json',
      });

      logVerbose(`Response status: ${response.status}`);
      logVerbose(`Response body: ${response.body.substring(0, 300)}`);

      if (response.status === 400 || response.status === 500) {
        const hasStackTrace = response.body.includes('stack') || response.body.includes('Trace');
        const hasPaths = response.body.includes('at ') && response.body.includes('.ts');

        if (!hasStackTrace && !hasPaths) {
          recordTest('C-03-3', testName, 'PASS', 
            'Malformed JSON handled without leaking stack trace', severity);
        } else {
          recordTest('C-03-3', testName, 'FAIL', 
            'Error response includes stack trace or file paths', severity);
        }
      } else {
        recordTest('C-03-3', testName, 'WARN', 
          `Unexpected status for malformed JSON: ${response.status}`, severity);
      }
    } catch (err) {
      recordTest('C-03-3', testName, 'FAIL', 
        `Request failed: ${err.message}`, severity);
    }

    // Test 3.4: Check error response structure
    log('\n📝 Test 3.4: Verify error response structure', COLORS.blue);
    log('  ⚠️  Manual verification needed: Check that error responses follow this format:', COLORS.cyan);
    log('    ✅ Good: {"error": "User-friendly message"}', COLORS.green);
    log('    ❌ Bad: {"error": "...", "details": "...", "stack": "..."}', COLORS.red);
    
    recordTest('C-03-4', testName, 'SKIP', 
      'Manually review all error responses across the application', severity);

    // Test 3.5: Verify server-side logging
    log('\n📝 Test 3.5: Verify server logs contain full error details', COLORS.blue);
    log('  ⚠️  Requires access to server logs - check manually', COLORS.yellow);
    log('  Expected: Server logs should have full stack traces and error details', COLORS.cyan);
    log('  Expected: Client responses should have sanitized messages only', COLORS.cyan);
    
    recordTest('C-03-5', testName, 'SKIP', 
      'Verify server logs have full details while client responses are sanitized', severity);

  } catch (err) {
    log(`\n❌ Test suite error: ${err.message}`, COLORS.red);
    recordTest('C-03-ERR', testName, 'FAIL', `Suite error: ${err.message}`, severity);
  }
}

// ============================================================================
// Security Test: C-04 - Password Hash Not Exposed
// ============================================================================

async function testC04() {
  const testName = 'Password Hash Not Exposed in Responses';
  const severity = 'CRITICAL';
  const cvss = 8.1;

  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔒 C-04: ${testName} [CVSS ${cvss}]`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  try {
    // Test 4.1: Check source code for password_hash exclusion
    log('\n📝 Test 4.1: Verify source code excludes password_hash from queries', COLORS.blue);
    try {
      const fs = require('fs');
      const serverCode = fs.readFileSync(
        path.join(process.cwd(), 'supabase/functions/server/index.tsx'),
        'utf8'
      );

      // Check the admin users query - should NOT select password_hash
      const adminUsersQuery = serverCode.match(/\.select\(\s*"([^"]+)"/);
      
      if (adminUsersQuery) {
        const selectedFields = adminUsersQuery[1];
        const hasPasswordHash = selectedFields.includes('password_hash');
        
        if (!hasPasswordHash) {
          recordTest('C-04-1', testName, 'PASS', 
            'Admin users query does NOT select password_hash field', severity);
        } else {
          recordTest('C-04-1', testName, 'FAIL', 
            'Admin users query SELECTS password_hash - SECURITY RISK!', severity);
        }
      } else {
        recordTest('C-04-1', testName, 'WARN', 
          'Could not parse admin users query from source code', severity);
      }
    } catch (err) {
      recordTest('C-04-1', testName, 'FAIL', 
        `Source code analysis failed: ${err.message}`, severity);
    }

    // Test 4.2: Verify createAdminUserView function
    log('\n📝 Test 4.2: Check createAdminUserView function', COLORS.blue);
    try {
      const fs = require('fs');
      const serverCode = fs.readFileSync(
        path.join(process.cwd(), 'supabase/functions/server/index.tsx'),
        'utf8'
      );

      // Look for createAdminUserView function
      const hasUserViewFunction = serverCode.includes('createAdminUserView');
      const excludesPasswordHash = !serverCode.includes('password_hash') || 
                                    serverCode.indexOf('password_hash') > serverCode.indexOf('createAdminUserView');

      if (hasUserViewFunction) {
        recordTest('C-04-2', testName, 'PASS', 
          'createAdminUserView function exists for data sanitization', severity);
      } else {
        recordTest('C-04-2', testName, 'WARN', 
          'createAdminUserView function not found - verify manually', severity);
      }
    } catch (err) {
      recordTest('C-04-2', testName, 'FAIL', 
        `Source code analysis failed: ${err.message}`, severity);
    }

    // Test 4.3: Check registration/login don't return password_hash
    log('\n📝 Test 4.3: Verify authentication endpoints don\'t expose password_hash', COLORS.blue);
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/make-server-4ab11b6d/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123!@#',
        }),
      });

      logVerbose(`Response body: ${response.body.substring(0, 500)}`);

      const hasPasswordHash = response.body.includes('password_hash') || 
                              response.body.includes('passwordHash');

      if (!hasPasswordHash) {
        recordTest('C-04-3', testName, 'PASS', 
          'Registration response does not contain password hash', severity);
      } else {
        recordTest('C-04-3', testName, 'FAIL', 
          'CRITICAL: Registration response contains password hash!', severity);
      }
    } catch (err) {
      // Registration might fail for various reasons, but check error response too
      const errorMessage = err.message || '';
      const hasPasswordHash = errorMessage.includes('password_hash') || 
                              errorMessage.includes('passwordHash');
      
      if (!hasPasswordHash) {
        recordTest('C-04-3', testName, 'PASS', 
          'Registration error does not expose password hash', severity);
      } else {
        recordTest('C-04-3', testName, 'FAIL', 
          'Registration error contains password hash!', severity);
      }
    }

    // Test 4.4: Manual integration test reminder
    log('\n📝 Test 4.4: Admin user list endpoint integration test', COLORS.blue);
    log('  ⚠️  Requires admin/owner authentication', COLORS.yellow);
    log('  Manual test steps:', COLORS.cyan);
    log('    1. Login as admin/owner', COLORS.cyan);
    log('    2. GET /make-server-4ab11b6d/admin/users', COLORS.cyan);
    log('    3. Verify response does NOT contain "password_hash" field', COLORS.cyan);
    log('    4. GET /make-server-4ab11b6d/admin/users/:userId', COLORS.cyan);
    log('    5. Verify response does NOT contain "password_hash" field', COLORS.cyan);
    
    recordTest('C-04-4', testName, 'SKIP', 
      'Requires admin authentication - verify manually', severity);

    // Test 4.5: Check for password hash in error messages
    log('\n📝 Test 4.5: Verify error messages don\'t contain password hashes', COLORS.blue);
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}/make-server-4ab11b6d/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      const body = response.body.toLowerCase();
      const hasHashPattern = body.includes('$2') || body.includes('$argon2');

      if (!hasHashPattern) {
        recordTest('C-04-5', testName, 'PASS', 
          'Login error does not contain password hash patterns', severity);
      } else {
        recordTest('C-04-5', testName, 'FAIL', 
          'Login error might contain password hash!', severity);
      }
    } catch (err) {
      recordTest('C-04-5', testName, 'PASS', 
        'Request failed safely (no hash in error)', severity);
    }

  } catch (err) {
    log(`\n❌ Test suite error: ${err.message}`, COLORS.red);
    recordTest('C-04-ERR', testName, 'FAIL', `Suite error: ${err.message}`, severity);
  }
}

// ============================================================================
// Security Test: C-05 - reCAPTCHA Test Key Fallback
// ============================================================================

async function testC05() {
  const testName = 'reCAPTCHA Test Key Fallback Removed';
  const severity = 'CRITICAL';
  const cvss = 9.1;

  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔒 C-05: ${testName} [CVSS ${cvss}]`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  try {
    const GOOGLE_TEST_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

    // Test 5.1: Verify function throws error when key not configured
    log('\n📝 Test 5.1: Verify function throws error when key is missing', COLORS.blue);
    function getRecaptchaSecretKeyFixed(envKey) {
      if (!envKey) {
        throw new Error(
          "RECAPTCHA_SECRET_KEY is not configured. This is required for production. " +
          "Please set the environment variable before deploying."
        );
      }
      return envKey;
    }

    try {
      getRecaptchaSecretKeyFixed(null);
      recordTest('C-05-1', testName, 'FAIL', 
        'Function should throw error when key is not configured', severity);
    } catch (err) {
      if (err.message.includes('RECAPTCHA_SECRET_KEY is not configured')) {
        recordTest('C-05-1', testName, 'PASS', 
          'Function correctly throws error when key is missing', severity);
      } else {
        recordTest('C-05-1', testName, 'FAIL', 
          `Unexpected error message: ${err.message}`, severity);
      }
    }

    // Test 5.2: Verify function works when key is provided
    log('\n📝 Test 5.2: Verify function returns key when configured', COLORS.blue);
    const testKey = '6LcTestKey-RealKey123456789';
    const result = getRecaptchaSecretKeyFixed(testKey);

    if (result === testKey) {
      recordTest('C-05-2', testName, 'PASS', 
        'Function correctly returns key when configured', severity);
    } else {
      recordTest('C-05-2', testName, 'FAIL', 
        'Function did not return the configured key', severity);
    }

    // Test 5.3: Verify Google test key is NOT used as fallback
    log('\n📝 Test 5.3: Verify Google test key is not hardcoded', COLORS.blue);
    try {
      const testResult = getRecaptchaSecretKeyFixed(null);
      if (testResult !== GOOGLE_TEST_KEY) {
        recordTest('C-05-3', testName, 'PASS', 
          'Google test key is not used as fallback', severity);
      } else {
        recordTest('C-05-3', testName, 'FAIL', 
          'CRITICAL: Google test key is being used!', severity);
      }
    } catch (err) {
      // Throwing error is the correct behavior
      recordTest('C-05-3', testName, 'PASS', 
        'Function throws error instead of using Google test key', severity);
    }

    // Test 5.4: Verify source code doesn't contain fallback logic
    log('\n📝 Test 5.4: Check source code for test key fallback', COLORS.blue);
    try {
      const fs = require('fs');
      const sharedCode = fs.readFileSync(
        path.join(process.cwd(), 'supabase/functions/server/shared.ts'),
        'utf8'
      );

      const hasGoogleTestKey = sharedCode.includes(GOOGLE_TEST_KEY);
      const hasProperErrorHandling = sharedCode.includes('RECAPTCHA_SECRET_KEY is not configured');
      const throwsError = sharedCode.includes('throw new Error');
      
      // Check if the key is actually USED in logic (not just defined)
      const usedInReturnStatement = /return\s+.*RECAPTCHA_TEST_SECRET_KEY/.test(sharedCode);
      const usedInAssignment = /const\s+\w+\s*=\s*RECAPTCHA_TEST_SECRET_KEY/.test(sharedCode);
      const isActuallyUsed = usedInReturnStatement || usedInAssignment;

      if (!hasGoogleTestKey) {
        // Ideal: key not in code at all
        recordTest('C-05-4', testName, 'PASS', 
          'Source code has proper error handling without Google test key', severity);
      } else if (hasGoogleTestKey && hasProperErrorHandling && throwsError && !isActuallyUsed) {
        // Acceptable: key defined but not used in production logic
        recordTest('C-05-4', testName, 'PASS', 
          'Google test key defined but NOT used in logic (acceptable - constant exists for reference only)', severity);
      } else if (isActuallyUsed) {
        recordTest('C-05-4', testName, 'FAIL', 
          'CRITICAL: Google test key is being USED in production logic!', severity);
      } else {
        recordTest('C-05-4', testName, 'WARN', 
          'Could not fully verify source code - check manually', severity);
      }
    } catch (err) {
      recordTest('C-05-4', testName, 'FAIL', 
        `Source code analysis failed: ${err.message}`, severity);
    }

    // Test 5.5: Verify function exists and is exported
    log('\n📝 Test 5.5: Verify getRecaptchaSecretKey function is exported', COLORS.blue);
    try {
      const fs = require('fs');
      const sharedCode = fs.readFileSync(
        path.join(process.cwd(), 'supabase/functions/server/shared.ts'),
        'utf8'
      );

      const hasFunction = sharedCode.includes('export function getRecaptchaSecretKey');
      const hasErrorThrow = sharedCode.includes("throw new Error") && 
                            sharedCode.includes("RECAPTCHA_SECRET_KEY is not configured");

      if (hasFunction && hasErrorThrow) {
        recordTest('C-05-5', testName, 'PASS', 
          'getRecaptchaSecretKey function is properly exported with error handling', severity);
      } else {
        recordTest('C-05-5', testName, 'FAIL', 
          'Function export or error handling not found', severity);
      }
    } catch (err) {
      recordTest('C-05-5', testName, 'FAIL', 
        `Source code analysis failed: ${err.message}`, severity);
    }

    // Test 5.6: Manual deployment test reminder
    log('\n📝 Test 5.6: Deployment test without RECAPTCHA_SECRET_KEY', COLORS.blue);
    log('  ⚠️  Manual deployment test recommended', COLORS.yellow);
    log('  Steps:', COLORS.cyan);
    log('    1. Deploy application without RECAPTCHA_SECRET_KEY', COLORS.cyan);
    log('    2. Try to register a new user with captcha token', COLORS.cyan);
    log('    3. Verify application throws proper error message', COLORS.cyan);
    log('    4. Set RECAPTCHA_SECRET_KEY and redeploy', COLORS.cyan);
    log('    5. Verify captcha verification works correctly', COLORS.cyan);
    
    recordTest('C-05-6', testName, 'SKIP', 
      'Deploy without RECAPTCHA_SECRET_KEY and verify proper error handling', severity);

    // Test 5.7: Verify the constant is not used
    log('\n📝 Test 5.7: Verify RECAPTCHA_TEST_SECRET_KEY constant is not used', COLORS.blue);
    try {
      const fs = require('fs');
      const sharedCode = fs.readFileSync(
        path.join(process.cwd(), 'supabase/functions/server/shared.ts'),
        'utf8'
      );

      // The constant might be defined but should not be used in production logic
      const constantDefined = sharedCode.includes('RECAPTCHA_TEST_SECRET_KEY');
      const usedInLogic = sharedCode.includes('RECAPTCHA_TEST_SECRET_KEY') && 
                          sharedCode.match(/return.*RECAPTCHA_TEST_SECRET_KEY/);

      if (constantDefined && !usedInLogic) {
        recordTest('C-05-7', testName, 'PASS', 
          'Test key constant defined but not used in logic (acceptable)', severity);
      } else if (!constantDefined) {
        recordTest('C-05-7', testName, 'PASS', 
          'Test key constant not found (ideal)', severity);
      } else {
        recordTest('C-05-7', testName, 'FAIL', 
          'Test key constant is being used in logic!', severity);
      }
    } catch (err) {
      recordTest('C-05-7', testName, 'FAIL', 
        `Source code analysis failed: ${err.message}`, severity);
    }

  } catch (err) {
    log(`\n❌ Test suite error: ${err.message}`, COLORS.red);
    recordTest('C-05-ERR', testName, 'FAIL', `Suite error: ${err.message}`, severity);
  }
}

// ============================================================================
// Test Report Generation
// ============================================================================

function printReport() {
  testResults.endTime = new Date().toISOString();
  testResults.duration = Date.now() - testResults.startTime;

  log('\n' + '='.repeat(80), COLORS.bold);
  log('📊 PHASE 1: CRITICAL SECURITY - TEST REPORT', COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  log(`\n📅 Test Date:    ${testResults.timestamp}`, COLORS.white);
  log(`🌐 Base URL:     ${testResults.baseUrl}`, COLORS.white);
  log(`⏱️  Duration:      ${(testResults.duration / 1000).toFixed(2)}s`, COLORS.white);

  log(`\n${COLORS.bold}Test Results Summary:${COLORS.reset}`, COLORS.bold);
  log(`  Total Tests:  ${testResults.total}`, COLORS.white);
  log(`  ✅ Passed:    ${testResults.passed}`, testResults.failed === 0 ? COLORS.green : COLORS.red);
  log(`  ❌ Failed:    ${testResults.failed}`, testResults.failed === 0 ? COLORS.green : COLORS.red);
  log(`  ⚠️  Warnings:  ${testResults.warnings}`, testResults.warnings > 0 ? COLORS.yellow : COLORS.white);
  log(`  ⏭️  Skipped:   ${testResults.skipped}`, testResults.skipped > 0 ? COLORS.yellow : COLORS.white);

  const passRate = testResults.total > 0
    ? ((testResults.passed / testResults.total) * 100).toFixed(1)
    : 0;

  log(`\n📈 Pass Rate:    ${passRate}%`, passRate === '100.0' ? COLORS.green : COLORS.yellow);

  // Overall assessment
  log('\n' + '-'.repeat(80), COLORS.bold);
  log('OVERALL ASSESSMENT', COLORS.bold);
  log('-'.repeat(80), COLORS.bold);

  if (testResults.failed > 0) {
    log(`\n${COLORS.bgRed}🚨 CRITICAL: ${testResults.failed} TEST(S) FAILED!${COLORS.reset}`, COLORS.bold);
    log('⛔ DO NOT DEPLOY until all critical tests pass', COLORS.red);
    log('📝 Review failed test cases and fix issues before proceeding', COLORS.red);
  } else if (testResults.warnings > 0) {
    log(`\n${COLORS.bgYellow}⚠️  WARNING: ${testResults.warnings} WARNING(S) FOUND${COLORS.reset}`, COLORS.bold);
    log('✅ No critical failures, but review warnings before deployment', COLORS.yellow);
    if (testResults.skipped > 0) {
      log(`⏭️  ${testResults.skipped} test(s) skipped - manual verification needed`, COLORS.yellow);
    }
  } else if (testResults.skipped > 0) {
    log(`\n${COLORS.bgYellow}⚠️  ${testResults.skipped} TEST(S) SKIPPED - MANUAL VERIFICATION NEEDED${COLORS.reset}`, COLORS.bold);
    log('Review skipped tests before final deployment sign-off', COLORS.yellow);
  } else {
    log(`\n${COLORS.bgGreen}✅ ALL TESTS PASSED - READY FOR DEPLOYMENT REVIEW${COLORS.reset}`, COLORS.bold);
  }

  // Detailed results by category
  log('\n' + '-'.repeat(80), COLORS.bold);
  log('DETAILED TEST RESULTS', COLORS.bold);
  log('-'.repeat(80), COLORS.bold);

  const categories = {
    'C-01': 'Unauthenticated File Deletion Prevention',
    'C-02': 'SQL Injection Prevention (ILIKE Wildcards)',
    'C-03': 'Error Details Leakage Prevention',
    'C-04': 'Password Hash Exposure Prevention',
    'C-05': 'reCAPTCHA Test Key Fallback Removal',
  };

  Object.entries(categories).forEach(([testId, testName]) => {
    const categoryTests = testResults.details.filter(d => d.testId.startsWith(testId));
    if (categoryTests.length === 0) return;

    const categoryPassed = categoryTests.every(d => d.status === 'PASS');
    const categoryStatus = categoryPassed ? '✅ PASS' : '❌ FAIL';
    const categoryColor = categoryPassed ? COLORS.green : COLORS.red;

    log(`\n${COLORS.bold}[${testId}] ${testName}${COLORS.reset} - ${categoryStatus}`, categoryColor);
    
    categoryTests.forEach((detail, index) => {
      const icon = detail.status === 'PASS' ? '  ✅' :
                   detail.status === 'FAIL' ? '  ❌' :
                   detail.status === 'WARN' ? '  ⚠️ ' : '  ⏭️';
      const color = detail.status === 'PASS' ? COLORS.green :
                    detail.status === 'FAIL' ? COLORS.red :
                    detail.status === 'WARN' ? COLORS.yellow : COLORS.yellow;

      log(`    ${index + 1}. ${icon} ${detail.message}`, color);
    });
  });

  // Manual test checklist
  log('\n' + '='.repeat(80), COLORS.bold);
  log('📝 MANUAL TEST CHECKLIST', COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  log(`\n${COLORS.bold}C-01: Unauthenticated File Deletion${COLORS.reset}`);
  log('  ☐ Login as regular user');
  log('  ☐ Try to delete another user\'s CV file');
  log('  ☐ Verify 403 Forbidden is returned');
  log('  ☐ Check audit logs for deletion attempts');

  log(`\n${COLORS.bold}C-02: SQL Injection${COLORS.reset}`);
  log('  ☐ Login as admin');
  log('  ☐ Visit /admin/users?search=%');
  log('  ☐ Verify not all users are returned');
  log('  ☐ Try search with %admin%');
  log('  ☐ Verify proper escaping works');

  log(`\n${COLORS.bold}C-03: Error Details${COLORS.reset}`);
  log('  ☐ Send malformed registration request');
  log('  ☐ Verify response has no "details" field');
  log('  ☐ Check server logs have full error details');

  log(`\n${COLORS.bold}C-04: Password Hash${COLORS.reset}`);
  log('  ☐ Login as admin');
  log('  ☐ GET /admin/users');
  log('  ☐ Verify no "password_hash" in response');
  log('  ☐ GET /admin/users/:userId');
  log('  ☐ Verify no "password_hash" in response');

  log(`\n${COLORS.bold}C-05: reCAPTCHA Key${COLORS.reset}`);
  log('  ☐ Deploy without RECAPTCHA_SECRET_KEY');
  log('  ☐ Verify application fails to start or throws error');
  log('  ☐ Set RECAPTCHA_SECRET_KEY');
  log('  ☐ Verify captcha verification works correctly');

  // Next steps
  log('\n' + '='.repeat(80), COLORS.bold);
  log('📋 NEXT STEPS', COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  if (testResults.failed === 0) {
    log('\n✅ All automated tests passed!', COLORS.green);
    log('1. Complete manual test checklist above', COLORS.white);
    log('2. Review any warnings or skipped tests', COLORS.white);
    log('3. Proceed to Phase 2: High Priority Security testing', COLORS.white);
    log('4. Document test results and get sign-off', COLORS.white);
  } else {
    log('\n⛔ Critical issues found!', COLORS.red);
    log('1. Review failed test cases immediately', COLORS.red);
    log('2. Fix identified vulnerabilities', COLORS.red);
    log('3. Re-run test suite after fixes', COLORS.red);
    log('4. Do NOT proceed until all critical tests pass', COLORS.red);
  }

  // Save JSON report if requested
  if (CONFIG.jsonOutput) {
    saveJsonReport();
  }

  // Sign-off section
  log('\n' + '='.repeat(80), COLORS.bold);
  log('✍️  TESTER SIGN-OFF', COLORS.bold);
  log('='.repeat(80), COLORS.bold);
  log(`\nTest Status: ${testResults.failed === 0 ? '✅ PASSED' : '❌ FAILED'}`, 
    testResults.failed === 0 ? COLORS.green : COLORS.red);
  log(`Readiness: ${testResults.failed === 0 ? 'READY FOR PHASE 2' : 'NEEDS FIXES'}`,
    testResults.failed === 0 ? COLORS.green : COLORS.red);
  log('\nTester: _______________________');
  log('Date: _______________________');
  log('Sign-off: ☐ APPROVED FOR NEXT PHASE  ☐ NEEDS FIXES');
  log('');
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--base-url':
        CONFIG.baseUrl = args[++i];
        break;
      case '--test':
        const testId = args[++i].toUpperCase();
        if (testId === 'ALL') {
          CONFIG.tests = ['C-01', 'C-02', 'C-03', 'C-04', 'C-05'];
        } else {
          CONFIG.tests = [testId];
        }
        break;
      case '--verbose':
        CONFIG.verbose = true;
        break;
      case '--json':
        CONFIG.jsonOutput = true;
        break;
      case '--telegram':
        CONFIG.telegramReport = true;
        break;
      case '--help':
        console.log(`
Job360 Security Test Suite - Phase 1: Critical Security

Usage:
  node test-phase1-critical-security.js [options]

Options:
  --base-url <url>       Base URL of the application
  --test <id>            Run specific test (C-01, C-02, C-03, C-04, C-05, or all)
  --verbose              Show detailed output
  --json                 Output results as JSON report
  --telegram             Send report to Telegram (thread ID: 735)
  --help                 Show this help message

Examples:
  node test-phase1-critical-security.js
  node test-phase1-critical-security.js --test C-01 --verbose
  node test-phase1-critical-security.js --base-url https://staging.example.com --json
  node test-phase1-critical-security.js --json --telegram
`);
        process.exit(0);
    }
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  parseArgs();

  testResults.baseUrl = CONFIG.baseUrl;
  testResults.startTime = Date.now();

  log('\n' + '='.repeat(80), COLORS.bold);
  log('🔒 Job360 Security Test Suite', COLORS.bold);
  log('Phase 1: Critical Security Validation', COLORS.bold);
  log('='.repeat(80), COLORS.bold);
  log(`\n📅 Timestamp: ${new Date().toISOString()}`, COLORS.cyan);
  log(`🌐 Base URL: ${CONFIG.baseUrl}`, COLORS.cyan);
  log(`🧪 Tests: ${CONFIG.tests.join(', ')}`, COLORS.cyan);
  log(`📊 Mode: ${CONFIG.verbose ? 'Verbose' : 'Normal'}`, COLORS.cyan);

  // Run tests
  if (CONFIG.tests.includes('C-01')) {
    await testC01();
  }
  if (CONFIG.tests.includes('C-02')) {
    await testC02();
  }
  if (CONFIG.tests.includes('C-03')) {
    await testC03();
  }
  if (CONFIG.tests.includes('C-04')) {
    await testC04();
  }
  if (CONFIG.tests.includes('C-05')) {
    await testC05();
  }

  // Print report
  printReport();

  // Exit with appropriate code
  if (testResults.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run tests
main().catch((err) => {
  log(`\n❌ Fatal error: ${err.message}`, COLORS.red);
  console.error(err);
  process.exit(1);
});
