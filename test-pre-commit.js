#!/usr/bin/env node

/**
 * ============================================================================
 * Job360 Pre-Commit Test Runner
 * ============================================================================
 * Purpose: Comprehensive automated testing BEFORE committing code
 * Author: Senior QA Automation Engineer (10 years experience)
 * 
 * This script runs ALL necessary tests to validate code readiness for commit.
 * It enforces quality gates and blocks commits if critical tests fail.
 * 
 * Usage:
 *   node test-pre-commit.js [options]
 * 
 * Options:
 *   --base-url <url>       Base URL (default: http://localhost:5173)
 *   --verbose              Show detailed output
 *   --json                 Output results as JSON
 *   --skip-build           Skip build validation
 *   --no-telegram          Disable Telegram report (enabled by default)
 *   --help                 Show help message
 * 
 * Exit Codes:
 *   0 - All tests passed, safe to commit
 *   1 - Tests failed, DO NOT commit
 *   2 - Configuration error
 * ============================================================================
 */

import { createRequire } from 'module';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  baseUrl: 'http://localhost:5173',
  verbose: false,
  jsonOutput: false,
  skipBuild: false,
  telegramReport: true, // ALWAYS send Telegram report by default
  telegramThreadId: '735', // Pre-Commit Test Reports thread
  timeout: 10000,
  noTelegram: false, // Option to disable Telegram
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
  phase: 'Pre-Commit Validation',
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
  qualityGate: 'PASS',
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

function recordTest(testId, name, status, message, severity = 'HIGH') {
  testResults.total++;
  const timestamp = new Date().toISOString();

  if (status === 'PASS') {
    testResults.passed++;
    if (!CONFIG.jsonOutput) {
      console.log(`  ✅ PASS: ${message}`, COLORS.green);
    }
  } else if (status === 'FAIL') {
    testResults.failed++;
    testResults.qualityGate = 'FAIL';
    if (!CONFIG.jsonOutput) {
      console.log(`  ❌ FAIL: ${message}`, COLORS.red);
    }
  } else if (status === 'WARN') {
    testResults.warnings++;
    if (!CONFIG.jsonOutput) {
      console.log(`  ⚠️  WARN: ${message}`, COLORS.yellow);
    }
  } else {
    testResults.skipped++;
    if (!CONFIG.jsonOutput) {
      console.log(`  ⏭️ SKIP: ${message}`, COLORS.yellow);
    }
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

function runCommand(command, description) {
  log(`\n${COLORS.bold}📝 ${description}${COLORS.reset}`, COLORS.blue);
  logVerbose(`Running: ${command}`);
  
  try {
    execSync(command, {
      stdio: CONFIG.verbose ? 'inherit' : 'pipe',
      timeout: CONFIG.timeout,
      cwd: process.cwd(),
    });
    return true;
  } catch (error) {
    if (CONFIG.verbose) {
      logVerbose(`Command failed: ${error.message}`);
    }
    return false;
  }
}

// ============================================================================
// Test Suites
// ============================================================================

async function runLinting() {
  const testName = 'Code Linting';
  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔍 SUITE 1: ${testName}`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  const success = runCommand('npm run lint', 'Running ESLint');
  
  if (success) {
    recordTest('LINT-01', testName, 'PASS', 'All code passes linting checks', 'HIGH');
  } else {
    recordTest('LINT-01', testName, 'FAIL', 'Linting errors found - fix before commit', 'HIGH');
  }
  
  return success;
}

async function runTypeChecks() {
  const testName = 'Type Checking';
  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔍 SUITE 2: ${testName}`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  const success = runCommand('npx tsc --noEmit', 'Running TypeScript compiler');
  
  if (success) {
    recordTest('TYPE-01', testName, 'PASS', 'All type checks pass', 'HIGH');
  } else {
    recordTest('TYPE-01', testName, 'FAIL', 'Type errors found - fix before commit', 'HIGH');
  }
  
  return success;
}

async function runUnitTests() {
  const testName = 'Unit Tests';
  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔍 SUITE 3: ${testName}`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  const success = runCommand('npm test', 'Running unit test suite');
  
  if (success) {
    recordTest('UNIT-01', testName, 'PASS', 'All unit tests pass', 'CRITICAL');
  } else {
    recordTest('UNIT-01', testName, 'FAIL', 'Unit tests failing - DO NOT commit', 'CRITICAL');
  }
  
  return success;
}

async function runSecurityTests() {
  const testName = 'Security Tests';
  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔍 SUITE 4: ${testName} (CRITICAL)`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  // Run Phase 1 security tests
  const securityTestPath = path.join(process.cwd(), 'test-phase1-critical-security.js');
  
  if (!fs.existsSync(securityTestPath)) {
    recordTest('SEC-01', testName, 'WARN', 'Security test file not found', 'CRITICAL');
    return false;
  }

  const success = runCommand(`node ${securityTestPath}`, 'Running critical security tests');
  
  if (success) {
    recordTest('SEC-01', testName, 'PASS', 'All security tests pass', 'CRITICAL');
  } else {
    recordTest('SEC-01', testName, 'FAIL', 'Security vulnerabilities found - BLOCK commit', 'CRITICAL');
  }
  
  return success;
}

async function runCriticalFixesValidation() {
  const testName = 'Critical Fixes Validation';
  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔍 SUITE 5: ${testName}`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  const testPath = path.join(process.cwd(), 'test-critical-fixes.js');
  
  if (!fs.existsSync(testPath)) {
    recordTest('CRIT-01', testName, 'WARN', 'Critical fixes test file not found', 'HIGH');
    return false;
  }

  const success = runCommand(`node ${testPath}`, 'Validating critical security fixes');
  
  if (success) {
    recordTest('CRIT-01', testName, 'PASS', 'All critical fixes validated', 'HIGH');
  } else {
    recordTest('CRIT-01', testName, 'FAIL', 'Critical fixes not working', 'HIGH');
  }
  
  return success;
}

async function runBuildValidation() {
  if (CONFIG.skipBuild) {
    recordTest('BUILD-01', 'Build Validation', 'SKIP', 'Build validation skipped per configuration', 'MEDIUM');
    return true;
  }

  const testName = 'Build Validation';
  log('\n' + '='.repeat(80), COLORS.bold);
  log(`🔍 SUITE 6: ${testName}`, COLORS.bold);
  log('='.repeat(80), COLORS.bold);

  const success = runCommand('npm run build', 'Running production build');
  
  if (success) {
    recordTest('BUILD-01', testName, 'PASS', 'Production build succeeds', 'CRITICAL');
  } else {
    recordTest('BUILD-01', testName, 'FAIL', 'Production build fails - BLOCK commit', 'CRITICAL');
  }
  
  return success;
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReportFileName() {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toISOString().split('T')[1].replace(/:/g, '-').split('.')[0];
  return `pre-commit-report-${date}-${time}.json`;
}

function saveJsonReport() {
  const fileName = generateReportFileName();
  const reportPath = path.join(process.cwd(), fileName);

  const report = {
    ...testResults,
    summary: {
      passRate: testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0,
      criticalFailures: testResults.details.filter(d => d.status === 'FAIL' && d.severity === 'CRITICAL').length,
      readinessAssessment: testResults.failed === 0 ? 'READY_FOR_COMMIT' : 'NOT_READY',
      qualityGate: testResults.qualityGate,
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  if (!CONFIG.jsonOutput) {
    console.log(`\n📄 JSON report saved to: ${fileName}`, COLORS.cyan);
  }

  return report;
}

async function sendTelegramReport(report) {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    log('\n⚠️ .env file not found, skipping Telegram notification', COLORS.yellow);
    return;
  }

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

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = envVars;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    log('\n⚠️ Telegram credentials not configured, skipping notification', COLORS.yellow);
    return;
  }

  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const status = testResults.failed === 0 ? '✅ PASSED' : '❌ FAILED';
  const statusEmoji = testResults.failed === 0 ? '✅' : '🚨';
  const readiness = report.summary.readinessAssessment.replace(/_/g, ' ');

  // Check each test category
  const checkCategory = (testIdPrefix) => {
    const tests = testResults.details.filter(d => d.testId.startsWith(testIdPrefix));
    const hasFailures = tests.some(d => d.status === 'FAIL');
    return hasFailures ? '❌' : '✅';
  };

  const message = `<b>${statusEmoji} Pre-Commit Test Report</b>
📅 <b>Date:</b> ${now}
⏱️ <b>Duration:</b> ${(testResults.duration / 1000).toFixed(2)}s

📊 <b>Results:</b>
├─ Total: ${testResults.total}
├─ ✅ Passed: ${testResults.passed}
├─ ❌ Failed: ${testResults.failed}
├─ ⚠️ Warnings: ${testResults.warnings}
└─ ⏭️ Skipped: ${testResults.skipped}

📈 <b>Pass Rate:</b> ${report.summary.passRate}%
${statusEmoji} <b>Status:</b> ${status}
🎯 <b>Readiness:</b> ${readiness}
🚦 <b>Quality Gate:</b> ${testResults.qualityGate}

<b>🧪 Test Suites:</b>
├─ Linting ${checkCategory('LINT')}
├─ Type Check ${checkCategory('TYPE')}
├─ Unit Tests ${checkCategory('UNIT')}
├─ Security Tests ${checkCategory('SEC')}
├─ Critical Fixes ${checkCategory('CRIT')}
└─ Build ${checkCategory('BUILD')}

${testResults.failed === 0
  ? '✅ <b>Ready to commit!</b>'
  : '🚨 <b>DO NOT commit - fix failures first!</b>'}`;

  try {
    const messageThreadId = parseInt(CONFIG.telegramThreadId);

    log('\n📤 Sending report to Telegram (Thread 735)...', COLORS.cyan);

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
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
      if (result.description && result.description.includes('thread')) {
        const retryResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: message,
              parse_mode: 'HTML',
            }),
          }
        );

        const retryResult = await retryResponse.json();
        if (retryResult.ok) {
          log('✅ Report sent (without thread ID)', COLORS.green);
        } else {
          log('❌ Failed to send Telegram report', COLORS.red);
        }
      }
    }
  } catch (error) {
    log(`\n⚠️ Error sending to Telegram: ${error.message}`, COLORS.yellow);
  }
}

function printReport() {
  if (CONFIG.jsonOutput) return;

  const report = saveJsonReport();

  console.log('\n' + '='.repeat(80));
  console.log(`${COLORS.bold}📊 PRE-COMMIT TEST REPORT${COLORS.reset}`);
  console.log('='.repeat(80));

  console.log(`\nTotal Tests:  ${testResults.total}`);
  console.log(`${COLORS.green}✅ Passed:   ${testResults.passed}${COLORS.reset}`);
  console.log(`${testResults.failed > 0 ? COLORS.red : COLORS.green}❌ Failed:   ${testResults.failed}${COLORS.reset}`);
  console.log(`${COLORS.yellow}⚠️  Warnings: ${testResults.warnings}${COLORS.reset}`);
  console.log(`${COLORS.yellow}⏭️  Skipped:  ${testResults.skipped}${COLORS.reset}`);

  console.log(`\nPass Rate:    ${report.summary.passRate}%`);
  console.log(`Duration:     ${(testResults.duration / 1000).toFixed(2)}s`);
  console.log(`Quality Gate: ${testResults.qualityGate}`);

  if (testResults.failed === 0) {
    console.log(`\n${COLORS.bgGreen}${COLORS.bold} ✅ ALL TESTS PASSED - Ready to commit! ${COLORS.reset}`);
  } else {
    console.log(`\n${COLORS.bgRed}${COLORS.bold} ❌ ${testResults.failed} TEST(S) FAILED - DO NOT COMMIT! ${COLORS.reset}`);
    console.log('\nFailed tests:');
    testResults.details
      .filter(d => d.status === 'FAIL')
      .forEach(d => console.log(`  - ${d.testId}: ${d.message}`));
  }

  if (testResults.warnings > 0) {
    console.log('\nWarnings:');
    testResults.details
      .filter(d => d.status === 'WARN')
      .forEach(d => console.log(`  ⚠️  ${d.testId}: ${d.message}`));
  }

  // Detailed results
  console.log('\n' + '-'.repeat(80));
  console.log(`${COLORS.bold}DETAILED RESULTS${COLORS.reset}`);
  console.log('-'.repeat(80));

  testResults.details.forEach((detail, index) => {
    const icon = detail.status === 'PASS' ? '✅' :
                 detail.status === 'FAIL' ? '❌' :
                 detail.status === 'WARN' ? '⚠️' : '⏭️';
    const color = detail.status === 'PASS' ? COLORS.green :
                  detail.status === 'FAIL' ? COLORS.red :
                  detail.status === 'WARN' ? COLORS.yellow : COLORS.cyan;

    console.log(`\n${index + 1}. ${icon} [${detail.testId}] ${detail.name}`, color);
    console.log(`   Severity: ${detail.severity}`, color);
    console.log(`   Message: ${detail.message}`, COLORS.white);
    console.log(`   Time: ${detail.timestamp}`, COLORS.cyan);
  });

  // Pre-commit checklist
  console.log('\n' + '='.repeat(80));
  console.log(`${COLORS.bold}📋 PRE-COMMIT CHECKLIST${COLORS.reset}`);
  console.log('='.repeat(80));

  const checks = [
    { name: 'Linting', status: testResults.details.some(d => d.testId === 'LINT-01' && d.status === 'PASS') },
    { name: 'Type Checks', status: testResults.details.some(d => d.testId === 'TYPE-01' && d.status === 'PASS') },
    { name: 'Unit Tests', status: testResults.details.some(d => d.testId === 'UNIT-01' && d.status === 'PASS') },
    { name: 'Security Tests', status: testResults.details.some(d => d.testId === 'SEC-01' && d.status === 'PASS') },
    { name: 'Critical Fixes', status: testResults.details.some(d => d.testId === 'CRIT-01' && d.status === 'PASS') },
    { name: 'Build', status: testResults.details.some(d => d.testId === 'BUILD-01' && d.status === 'PASS') },
  ];

  checks.forEach(check => {
    const icon = check.status ? '✅' : '❌';
    const color = check.status ? COLORS.green : COLORS.red;
    console.log(`${icon} ${color}${check.name}${COLORS.reset}`);
  });

  console.log('\n' + '='.repeat(80));
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
      case '--verbose':
        CONFIG.verbose = true;
        break;
      case '--json':
        CONFIG.jsonOutput = true;
        break;
      case '--skip-build':
        CONFIG.skipBuild = true;
        break;
      case '--telegram':
        CONFIG.telegramReport = true; // Already true by default
        break;
      case '--no-telegram':
        CONFIG.telegramReport = false;
        CONFIG.noTelegram = true;
        break;
      case '--help':
        console.log(`
Job360 Pre-Commit Test Runner
Senior QA Automation Standards (10+ years experience)

Usage:
  node test-pre-commit.js [options]

Options:
  --base-url <url>       Base URL (default: http://localhost:5173)
  --verbose              Show detailed output
  --json                 Output results as JSON
  --skip-build           Skip build validation
  --no-telegram          Disable Telegram report (enabled by default)
  --help                 Show this help message

Exit Codes:
  0 - All tests passed, safe to commit
  1 - Tests failed, DO NOT commit
  2 - Configuration error

Examples:
  node test-pre-commit.js
  node test-pre-commit.js --verbose
  node test-pre-commit.js --json --skip-build
  node test-pre-commit.js --no-telegram
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

  testResults.startTime = Date.now();
  testResults.baseUrl = CONFIG.baseUrl;

  if (!CONFIG.jsonOutput) {
    console.log('\n' + '='.repeat(80));
    console.log(`${COLORS.bold}🔒 Job360 Pre-Commit Test Suite${COLORS.reset}`);
    console.log(`${COLORS.bold}Senior QA Automation Standards${COLORS.reset}`);
    console.log('='.repeat(80));
    console.log(`\nBase URL: ${CONFIG.baseUrl}`, COLORS.cyan);
    console.log(`Timestamp: ${new Date().toISOString()}`, COLORS.cyan);
    console.log(`Verbose: ${CONFIG.verbose}`, COLORS.cyan);
  }

  // Run all test suites
  await runLinting();
  await runTypeChecks();
  await runUnitTests();
  await runSecurityTests();
  await runCriticalFixesValidation();
  await runBuildValidation();

  testResults.endTime = Date.now();
  testResults.duration = testResults.endTime - testResults.startTime;

  // Print report
  printReport();

  // ALWAYS send Telegram report (unless --no-telegram flag is used)
  if (CONFIG.telegramReport) {
    const report = saveJsonReport();
    await sendTelegramReport(report);
  } else if (CONFIG.noTelegram && !CONFIG.jsonOutput) {
    log('\n⚠️ Telegram reporting disabled (--no-telegram flag)', COLORS.yellow);
    saveJsonReport();
  }

  // Exit with appropriate code
  if (testResults.failed > 0) {
    if (!CONFIG.jsonOutput) {
      console.log(`\n${COLORS.bgRed}${COLORS.bold} 🚨 COMMIT BLOCKED - Fix failures first! ${COLORS.reset}`);
    }
    process.exit(1);
  } else {
    if (!CONFIG.jsonOutput) {
      console.log(`\n${COLORS.bgGreen}${COLORS.bold} ✅ Safe to commit! ${COLORS.reset}`);
    }
    process.exit(0);
  }
}

// Run tests
main().catch((err) => {
  console.error(`\n${COLORS.bgRed}${COLORS.bold} ❌ Fatal error: ${err.message} ${COLORS.reset}`);
  console.error(err);
  process.exit(2);
});
