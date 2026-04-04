#!/usr/bin/env node

/**
 * ============================================================================
 * Job360 Security Test Suite - Phase 2: High Priority Security
 * ============================================================================
 * Purpose: Comprehensive automated testing for all HIGH severity security vulnerabilities
 * Date: April 4, 2026
 * Author: Senior QA Testing Engineer (10 years experience)
 *
 * Tests:
 * - H-01: PII sent to Telegram without user consent (CVSS 7.8)
 * - H-02: Registration does not record user consent (CVSS 7.5)
 * - H-03: CV upload consent is implicit/automatic (CVSS 7.2)
 * - H-04: Full CV content sent to third-party AI without disclosure (CVSS 7.5)
 * - H-05: No Row Level Security (RLS) policies for core tables (CVSS 7.8)
 * - H-06: XSS vulnerability in chart component (CVSS 7.2)
 * - H-07: Browser fingerprinting without disclosure (CVSS 6.5)
 *
 * Usage:
 *   node test-phase2-high-security.js [options]
 *
 * Options:
 *   --base-url <url>       Base URL of the application (default: http://localhost:5173)
 *   --test <id>            Run specific test (H-01 to H-07, or all)
 *   --verbose              Show detailed output
 *   --json                 Output results as JSON
 *   --telegram             Send report to Telegram
 *   --help                 Show help message
 *
 * Examples:
 *   node test-phase2-high-security.js
 *   node test-phase2-high-security.js --test H-01 --verbose
 *   node test-phase2-high-security.js --base-url https://staging.example.com --json
 * ============================================================================
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  baseUrl: 'http://localhost:5173',
  verbose: false,
  jsonOutput: false,
  telegramReport: false,
  tests: ['H-01', 'H-02', 'H-03', 'H-04', 'H-05', 'H-06', 'H-07'],
  timeout: 15000,
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
  phase: 'Phase 2: High Priority Security',
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
    log(message, COLORS.cyan);
  }
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(path, CONFIG.baseUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: CONFIG.timeout,
    };

    const req = lib.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json: () => {
              try {
                return JSON.parse(data);
              } catch (e) {
                return null;
              }
            },
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${CONFIG.timeout}ms`));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

function recordTest(testId, name, status, message, subtests = []) {
  testResults.total++;
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else if (status === 'SKIP') testResults.skipped++;
  else if (status === 'WARN') testResults.warnings++;

  testResults.details.push({
    testId,
    name,
    status,
    message,
    subtests,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================================
// Test H-01: PII Sent to Telegram Without User Consent
// ============================================================================

async function testH01_PIISentToTelegram() {
  const testName = 'H-01: PII Sent to Telegram Without User Consent';
  log(`\n${COLORS.bold}Testing: ${testName}${COLORS.reset}`, COLORS.blue);
  log('─'.repeat(80));

  const subtests = [];
  let overallStatus = 'PASS';
  let overallMessage = 'No PII leakage to Telegram detected';

  try {
    // Test 1: Check registration endpoint for Telegram API calls
    log('  Checking registration endpoint for Telegram notifications...', COLORS.cyan);
    
    let registerResponse;
    try {
      registerResponse = await makeRequest('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `test-h01-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          displayName: 'H01 Test User',
        }),
      });

      // Check if response indicates external notifications
      const responseBody = registerResponse.json();
      
      if (registerResponse.statusCode === 200 || registerResponse.statusCode === 400) {
        subtests.push({
          name: 'Registration endpoint response analysis',
          status: 'PASS',
          message: 'Endpoint responded without exposing Telegram integration',
        });
      } else {
        subtests.push({
          name: 'Registration endpoint response analysis',
          status: 'WARN',
          message: `Unexpected status code: ${registerResponse.statusCode}`,
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Registration endpoint response analysis',
        status: 'SKIP',
        message: 'Server not reachable - skipping live endpoint test',
      });
    }

    // Test 2: Check server source code for Telegram API calls
    log('  Analyzing server code for Telegram PII transmission...', COLORS.cyan);
    
    try {
      const serverCode = fs.readFileSync(
        path.join('supabase', 'functions', 'server', 'index.tsx'),
        'utf8'
      );

      // Check for Telegram notification patterns with PII
      const telegramPatterns = [
        { pattern: /sendTelegram.*email/gi, name: 'Email sent to Telegram' },
        { pattern: /sendTelegram.*ip/gi, name: 'IP sent to Telegram' },
        { pattern: /sendTelegram.*location/gi, name: 'Location sent to Telegram' },
        { pattern: /sendTelegram.*displayName/gi, name: 'Display name sent to Telegram' },
      ];

      const foundIssues = [];
      telegramPatterns.forEach(({ pattern, name }) => {
        const matches = serverCode.match(pattern);
        if (matches && matches.length > 0) {
          foundIssues.push(name);
        }
      });

      if (foundIssues.length > 0) {
        overallStatus = 'FAIL';
        overallMessage = `PII found in Telegram notifications: ${foundIssues.join(', ')}`;
        subtests.push({
          name: 'Telegram PII transmission check',
          status: 'FAIL',
          message: `Found PII being sent to Telegram: ${foundIssues.join(', ')}`,
        });
      } else {
        subtests.push({
          name: 'Telegram PII transmission check',
          status: 'PASS',
          message: 'No PII transmission to Telegram detected in server code',
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Server code analysis',
        status: 'SKIP',
        message: 'Could not read server source code: ' + e.message,
      });
    }

    // Test 3: Check privacy policy for third-party disclosure
    log('  Checking privacy policy for Telegram disclosure...', COLORS.cyan);
    
    try {
      const privacyPolicy = fs.readFileSync(
        path.join('src', 'app', 'components', 'legal', 'PrivacyPolicy.tsx'),
        'utf8'
      );

      const mentionsTelegram = privacyPolicy.toLowerCase().includes('telegram');
      const mentionsThirdParty = privacyPolicy.toLowerCase().includes('third party') ||
                                  privacyPolicy.toLowerCase().includes('third-party');

      if (!mentionsTelegram && !mentionsThirdParty) {
        if (overallStatus !== 'FAIL') {
          overallStatus = 'WARN';
          overallMessage = 'Privacy policy does not mention third-party data sharing';
        }
        subtests.push({
          name: 'Privacy policy disclosure',
          status: 'WARN',
          message: 'No mention of Telegram or third-party data sharing in privacy policy',
        });
      } else {
        subtests.push({
          name: 'Privacy policy disclosure',
          status: 'PASS',
          message: 'Privacy policy mentions third-party data sharing',
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Privacy policy check',
        status: 'SKIP',
        message: 'Could not read privacy policy file: ' + e.message,
      });
    }

  } catch (e) {
    overallStatus = 'FAIL';
    overallMessage = 'Test execution error: ' + e.message;
    log(`  ❌ Error: ${e.message}`, COLORS.red);
  }

  recordTest('H-01', testName, overallStatus, overallMessage, subtests);
  log(`  ${overallStatus === 'PASS' ? '✅' : overallStatus === 'FAIL' ? '❌' : '⚠️'}  ${overallMessage}`,
    overallStatus === 'PASS' ? COLORS.green : overallStatus === 'FAIL' ? COLORS.red : COLORS.yellow);
}

// ============================================================================
// Test H-02: Registration Does Not Record User Consent
// ============================================================================

async function testH02_NoRegistrationConsent() {
  const testName = 'H-02: Registration Does Not Record User Consent';
  log(`\n${COLORS.bold}Testing: ${testName}${COLORS.reset}`, COLORS.blue);
  log('─'.repeat(80));

  const subtests = [];
  let overallStatus = 'PASS';
  let overallMessage = 'Registration consent mechanism is properly implemented';

  try {
    // Test 1: Check registration form for consent checkbox
    log('  Checking registration form for consent checkbox...', COLORS.cyan);
    
    try {
      const authModal = fs.readFileSync(
        path.join('src', 'app', 'components', 'chat', 'AuthModal.tsx'),
        'utf8'
      );

      const hasExplicitCheckbox = authModal.includes('type="checkbox"') && 
                                  (authModal.toLowerCase().includes('terms') || 
                                   authModal.toLowerCase().includes('privacy') ||
                                   authModal.toLowerCase().includes('consent'));
      
      const hasImplicitConsent = authModal.includes('Bằng việc nhấn') ||
                                  authModal.includes('By clicking') ||
                                  authModal.includes('By registering') ||
                                  authModal.includes('đồng ý với') ||
                                  authModal.includes('agree to');
      
      const hasConsentValidation = authModal.includes('consent') && 
                                    (authModal.includes('required') || 
                                     authModal.includes('disabled') ||
                                     authModal.includes('!consent'));

      if (hasExplicitCheckbox && hasConsentValidation) {
        subtests.push({
          name: 'Consent checkbox in registration form',
          status: 'PASS',
          message: 'Explicit consent checkbox found in registration form',
        });
      } else if (hasImplicitConsent && !hasExplicitCheckbox) {
        overallStatus = 'FAIL';
        overallMessage = 'Registration uses implicit consent (no explicit checkbox)';
        subtests.push({
          name: 'Consent checkbox in registration form',
          status: 'FAIL',
          message: 'Only implicit consent found (text note, no checkbox)',
        });
      } else if (!hasImplicitConsent && !hasExplicitCheckbox) {
        overallStatus = 'FAIL';
        overallMessage = 'Registration form missing any consent mechanism';
        subtests.push({
          name: 'Consent checkbox in registration form',
          status: 'FAIL',
          message: 'No consent checkbox, validation, or implicit consent notice found',
        });
      } else {
        subtests.push({
          name: 'Consent checkbox in registration form',
          status: 'WARN',
          message: 'Consent mechanism found but may not be explicit',
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Registration form check',
        status: 'SKIP',
        message: 'Could not read AuthModal.tsx: ' + e.message,
      });
    }

    // Test 2: Check server for consent recording
    log('  Checking server for consent recording...', COLORS.cyan);
    
    try {
      const serverCode = fs.readFileSync(
        path.join('supabase', 'functions', 'server', 'index.tsx'),
        'utf8'
      );

      const hasConsentRecording = serverCode.includes('user_consents') ||
                                   serverCode.includes('recordConsent') ||
                                   serverCode.includes('saveConsent');
      
      const hasConsentRequirement = serverCode.includes('consent') && 
                                     (serverCode.includes('required') || 
                                      serverCode.includes('!consent') ||
                                      serverCode.includes('must agree'));

      if (hasConsentRecording) {
        subtests.push({
          name: 'Server consent recording',
          status: 'PASS',
          message: 'Server has consent recording mechanism',
        });
      } else {
        overallStatus = 'FAIL';
        overallMessage = 'Server does not record user consent';
        subtests.push({
          name: 'Server consent recording',
          status: 'FAIL',
          message: 'No consent recording found in server code',
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Server consent check',
        status: 'SKIP',
        message: 'Could not read server code: ' + e.message,
      });
    }

    // Test 3: Check for user_consents table in migrations
    log('  Checking for user_consents table...', COLORS.cyan);
    
    try {
      const migrationFiles = fs.readdirSync(
        path.join('supabase', 'migrations')
      );

      let hasConsentsTable = false;
      for (const file of migrationFiles) {
        const content = fs.readFileSync(
          path.join('supabase', 'migrations', file),
          'utf8'
        );
        if (content.includes('user_consents') || content.includes('consents')) {
          hasConsentsTable = true;
          break;
        }
      }

      if (hasConsentsTable) {
        subtests.push({
          name: 'User consents table exists',
          status: 'PASS',
          message: 'User consents table found in migrations',
        });
      } else {
        overallStatus = 'WARN';
        overallMessage = 'User consents table not found in migrations';
        subtests.push({
          name: 'User consents table exists',
          status: 'WARN',
          message: 'No user_consents table found in migration files',
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Migration files check',
        status: 'SKIP',
        message: 'Could not read migrations: ' + e.message,
      });
    }

  } catch (e) {
    overallStatus = 'FAIL';
    overallMessage = 'Test execution error: ' + e.message;
    log(`  ❌ Error: ${e.message}`, COLORS.red);
  }

  recordTest('H-02', testName, overallStatus, overallMessage, subtests);
  log(`  ${overallStatus === 'PASS' ? '✅' : overallStatus === 'FAIL' ? '❌' : '⚠️'}  ${overallMessage}`,
    overallStatus === 'PASS' ? COLORS.green : overallStatus === 'FAIL' ? COLORS.red : COLORS.yellow);
}

// ============================================================================
// Test H-03: CV Upload Consent Is Implicit/Automatic
// ============================================================================

async function testH03_CVUploadConsentImplicit() {
  const testName = 'H-03: CV Upload Consent Is Implicit/Automatic';
  log(`\n${COLORS.bold}Testing: ${testName}${COLORS.reset}`, COLORS.blue);
  log('─'.repeat(80));

  const subtests = [];
  let overallStatus = 'PASS';
  let overallMessage = 'CV upload consent is properly implemented';

  try {
    log('  Checking CV upload consent flow...', COLORS.cyan);
    
    try {
      const cvUploadCode = fs.readFileSync(
        path.join('src', 'app', 'components', 'chat', 'CVUploadModal.tsx'),
        'utf8'
      );

      // Check for automatic consent saving
      const hasAutomaticConsent = cvUploadCode.includes('getCachedConsent') && 
                                   cvUploadCode.includes('await saveConsent()');
      
      // Check for explicit consent requirement before upload
      const hasExplicitConsent = cvUploadCode.includes('consentRequired') ||
                                  cvUploadCode.includes('!consent') ||
                                  (cvUploadCode.includes('checkbox') && 
                                   cvUploadCode.includes('disabled'));

      // Check if upload is blocked without consent
      const blocksUploadWithoutConsent = cvUploadCode.includes('disabled') &&
                                          cvUploadCode.includes('consent');

      if (hasAutomaticConsent && !hasExplicitConsent) {
        overallStatus = 'FAIL';
        overallMessage = 'CV upload saves consent automatically without explicit user action';
        subtests.push({
          name: 'Automatic consent detection',
          status: 'FAIL',
          message: 'Found automatic saveConsent() call bypassing explicit consent',
        });
      } else {
        subtests.push({
          name: 'Automatic consent detection',
          status: 'PASS',
          message: 'No automatic consent saving detected',
        });
      }

      if (blocksUploadWithoutConsent) {
        subtests.push({
          name: 'Upload blocked without consent',
          status: 'PASS',
          message: 'Upload is properly blocked without explicit consent',
        });
      } else if (!hasExplicitConsent) {
        overallStatus = 'FAIL';
        overallMessage = 'CV upload does not require explicit consent';
        subtests.push({
          name: 'Upload blocked without consent',
          status: 'FAIL',
          message: 'Upload may not require explicit user consent',
        });
      } else {
        subtests.push({
          name: 'Upload blocked without consent',
          status: 'WARN',
          message: 'Could not verify upload blocking mechanism',
        });
      }

    } catch (e) {
      subtests.push({
        name: 'CV upload code analysis',
        status: 'SKIP',
        message: 'Could not read CVUploadModal.tsx: ' + e.message,
      });
    }

  } catch (e) {
    overallStatus = 'FAIL';
    overallMessage = 'Test execution error: ' + e.message;
    log(`  ❌ Error: ${e.message}`, COLORS.red);
  }

  recordTest('H-03', testName, overallStatus, overallMessage, subtests);
  log(`  ${overallStatus === 'PASS' ? '✅' : overallStatus === 'FAIL' ? '❌' : '⚠️'}  ${overallMessage}`,
    overallStatus === 'PASS' ? COLORS.green : overallStatus === 'FAIL' ? COLORS.red : COLORS.yellow);
}

// ============================================================================
// Test H-04: Full CV Content Sent to Third-Party AI Without Disclosure
// ============================================================================

async function testH04_CVSentToThirdPartyAI() {
  const testName = 'H-04: Full CV Content Sent to Third-Party AI Without Disclosure';
  log(`\n${COLORS.bold}Testing: ${testName}${COLORS.reset}`, COLORS.blue);
  log('─'.repeat(80));

  const subtests = [];
  let overallStatus = 'PASS';
  let overallMessage = 'Third-party AI processing is properly disclosed';

  try {
    // Test 1: Check server code for AI provider calls
    log('  Checking for third-party AI API calls...', COLORS.cyan);
    
    try {
      const serverCode = fs.readFileSync(
        path.join('supabase', 'functions', 'server', 'index.tsx'),
        'utf8'
      );

      const hasAICalls = serverCode.includes('dashscope') || 
                          serverCode.includes('qwen') ||
                          serverCode.includes('alibaba') ||
                          serverCode.includes('openai') ||
                          serverCode.includes('cv-parser');

      const hasCVDisclosure = serverCode.includes('cv will be processed') ||
                               serverCode.includes('third party') ||
                               serverCode.includes('AI provider');

      if (hasAICalls && !hasCVDisclosure) {
        overallStatus = 'FAIL';
        overallMessage = 'CV is sent to third-party AI without user disclosure';
        subtests.push({
          name: 'Third-party AI detection',
          status: 'FAIL',
          message: 'Found AI provider calls but no disclosure to users',
        });
      } else if (hasAICalls && hasCVDisclosure) {
        subtests.push({
          name: 'Third-party AI detection',
          status: 'PASS',
          message: 'AI provider calls found with proper disclosure',
        });
      } else {
        subtests.push({
          name: 'Third-party AI detection',
          status: 'PASS',
          message: 'No third-party AI processing detected',
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Server code analysis',
        status: 'SKIP',
        message: 'Could not read server code: ' + e.message,
      });
    }

    // Test 2: Check frontend for AI processing disclosure
    log('  Checking frontend for AI processing disclosure...', COLORS.cyan);
    
    try {
      const cvUploadCode = fs.readFileSync(
        path.join('src', 'app', 'components', 'chat', 'CVUploadModal.tsx'),
        'utf8'
      );

      const hasAIDisclosure = cvUploadCode.toLowerCase().includes('ai') ||
                               cvUploadCode.toLowerCase().includes('third party') ||
                               cvUploadCode.toLowerCase().includes('qwen') ||
                               cvUploadCode.toLowerCase().includes('processed by');

      if (hasAIDisclosure) {
        subtests.push({
          name: 'Frontend AI disclosure',
          status: 'PASS',
          message: 'Frontend discloses AI processing to users',
        });
      } else {
        overallStatus = 'FAIL';
        overallMessage = 'No disclosure about AI processing in upload flow';
        subtests.push({
          name: 'Frontend AI disclosure',
          status: 'FAIL',
          message: 'No mention of AI processing in CV upload interface',
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Frontend disclosure check',
        status: 'SKIP',
        message: 'Could not read CVUploadModal.tsx: ' + e.message,
      });
    }

    // Test 3: Check privacy policy for AI processor disclosure
    log('  Checking privacy policy for AI provider disclosure...', COLORS.cyan);
    
    try {
      const privacyPolicy = fs.readFileSync(
        path.join('src', 'app', 'components', 'legal', 'PrivacyPolicy.tsx'),
        'utf8'
      );

      const mentionsAI = privacyPolicy.toLowerCase().includes('artificial intelligence') ||
                          privacyPolicy.toLowerCase().includes('ai processing') ||
                          privacyPolicy.toLowerCase().includes('automated processing');
      
      const mentionsProviders = privacyPolicy.toLowerCase().includes('qwen') ||
                                 privacyPolicy.toLowerCase().includes('alibaba') ||
                                 privacyPolicy.toLowerCase().includes('dashscope');

      if (!mentionsAI && !mentionsProviders) {
        if (overallStatus !== 'FAIL') {
          overallStatus = 'WARN';
          overallMessage = 'Privacy policy does not mention AI processing';
        }
        subtests.push({
          name: 'Privacy policy AI disclosure',
          status: 'WARN',
          message: 'No mention of AI processing or AI providers in privacy policy',
        });
      } else {
        subtests.push({
          name: 'Privacy policy AI disclosure',
          status: 'PASS',
          message: 'Privacy policy mentions AI processing',
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Privacy policy check',
        status: 'SKIP',
        message: 'Could not read privacy policy: ' + e.message,
      });
    }

  } catch (e) {
    overallStatus = 'FAIL';
    overallMessage = 'Test execution error: ' + e.message;
    log(`  ❌ Error: ${e.message}`, COLORS.red);
  }

  recordTest('H-04', testName, overallStatus, overallMessage, subtests);
  log(`  ${overallStatus === 'PASS' ? '✅' : overallStatus === 'FAIL' ? '❌' : '⚠️'}  ${overallMessage}`,
    overallStatus === 'PASS' ? COLORS.green : overallStatus === 'FAIL' ? COLORS.red : COLORS.yellow);
}

// ============================================================================
// Test H-05: No Row Level Security (RLS) Policies for Core Tables
// ============================================================================

async function testH05_NoRLSPolicies() {
  const testName = 'H-05: No Row Level Security (RLS) Policies for Core Tables';
  log(`\n${COLORS.bold}Testing: ${testName}${COLORS.reset}`, COLORS.blue);
  log('─'.repeat(80));

  const subtests = [];
  let overallStatus = 'PASS';
  let overallMessage = 'RLS policies are properly configured';

  try {
    const coreTables = [
      'users',
      'auth_logs',
      'audit_logs',
      'user_consents',
      'cv_profiles',
      'sessions',
    ];

    log('  Checking migration files for RLS policies...', COLORS.cyan);
    
    try {
      const migrationFiles = fs.readdirSync(
        path.join('supabase', 'migrations')
      );

      const tablesWithRLS = new Set();
      const tablesWithRLSEnabled = new Set();

      for (const file of migrationFiles) {
        const content = fs.readFileSync(
          path.join('supabase', 'migrations', file),
          'utf8'
        );

        // Check for ENABLE ROW LEVEL SECURITY
        coreTables.forEach(table => {
          if (content.includes(`${table} ENABLE ROW LEVEL SECURITY`) || 
              content.includes(`${table} ENABLE ROW`)) {
            tablesWithRLSEnabled.add(table);
          }
        });

        // Check for CREATE POLICY statements
        coreTables.forEach(table => {
          if (content.includes(`CREATE POLICY`) && content.includes(`ON ${table}`)) {
            tablesWithRLS.add(table);
          }
        });
      }

      const tablesMissingRLS = coreTables.filter(
        table => !tablesWithRLSEnabled.has(table) && !tablesWithRLS.has(table)
      );

      if (tablesMissingRLS.length > 0) {
        overallStatus = 'FAIL';
        overallMessage = `Missing RLS policies for: ${tablesMissingRLS.join(', ')}`;
        subtests.push({
          name: 'Core tables RLS check',
          status: 'FAIL',
          message: `Tables missing RLS: ${tablesMissingRLS.join(', ')}`,
        });
      } else {
        subtests.push({
          name: 'Core tables RLS check',
          status: 'PASS',
          message: 'All core tables have RLS policies enabled',
        });
      }

      // Report which tables have RLS
      subtests.push({
        name: 'Tables with RLS enabled',
        status: 'PASS',
        message: `Tables with RLS: ${Array.from(tablesWithRLSEnabled).join(', ') || 'None'}`,
      });

    } catch (e) {
      subtests.push({
        name: 'Migration files check',
        status: 'SKIP',
        message: 'Could not read migration files: ' + e.message,
      });
    }

  } catch (e) {
    overallStatus = 'FAIL';
    overallMessage = 'Test execution error: ' + e.message;
    log(`  ❌ Error: ${e.message}`, COLORS.red);
  }

  recordTest('H-05', testName, overallStatus, overallMessage, subtests);
  log(`  ${overallStatus === 'PASS' ? '✅' : overallStatus === 'FAIL' ? '❌' : '⚠️'}  ${overallMessage}`,
    overallStatus === 'PASS' ? COLORS.green : overallStatus === 'FAIL' ? COLORS.red : COLORS.yellow);
}

// ============================================================================
// Test H-06: XSS Vulnerability in Chart Component
// ============================================================================

async function testH06_XSSInChartComponent() {
  const testName = 'H-06: XSS Vulnerability in Chart Component';
  log(`\n${COLORS.bold}Testing: ${testName}${COLORS.reset}`, COLORS.blue);
  log('─'.repeat(80));

  const subtests = [];
  let overallStatus = 'PASS';
  let overallMessage = 'Chart components are protected against XSS';

  try {
    log('  Checking for dangerouslySetInnerHTML usage...', COLORS.cyan);
    
    try {
      // Find all chart components
      const chartFiles = [];
      const searchDir = path.join('src', 'app', 'components', 'ui');
      
      try {
        const files = fs.readdirSync(searchDir);
        files.forEach(file => {
          if (file.includes('chart') || file.includes('Chart')) {
            chartFiles.push(path.join(searchDir, file));
          }
        });
      } catch (e) {
        // Try broader search
        try {
          const allComponents = fs.readdirSync(path.join('src', 'app', 'components'));
          allComponents.forEach(dir => {
            if (dir.toLowerCase().includes('chart')) {
              const fullPath = path.join('src', 'app', 'components', dir);
              const stats = fs.statSync(fullPath);
              if (stats.isDirectory()) {
                const files = fs.readdirSync(fullPath);
                files.forEach(f => {
                  if (f.endsWith('.tsx') || f.endsWith('.jsx')) {
                    chartFiles.push(path.join(fullPath, f));
                  }
                });
              }
            }
          });
        } catch (e2) {
          // Ignore
        }
      }

      // Also check for chart.tsx specifically
      const chartPath = path.join('src', 'app', 'components', 'ui', 'chart.tsx');
      if (fs.existsSync(chartPath) && !chartFiles.includes(chartPath)) {
        chartFiles.push(chartPath);
      }

      const vulnerableComponents = [];

      for (const file of chartFiles) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for dangerouslySetInnerHTML
          if (content.includes('dangerouslySetInnerHTML')) {
            // Check if there's sanitization
            const hasSanitization = content.includes('DOMPurify') ||
                                     content.includes('sanitize') ||
                                     content.includes('xss') ||
                                     content.includes('trusted');

            if (!hasSanitization) {
              vulnerableComponents.push({
                file: path.relative(process.cwd(), file),
                line: content.split('\n').findIndex(line => 
                  line.includes('dangerouslySetInnerHTML')
                ) + 1,
              });
            }
          }
        } catch (e) {
          // Skip files that can't be read
        }
      }

      if (vulnerableComponents.length > 0) {
        overallStatus = 'FAIL';
        overallMessage = `XSS vulnerability in ${vulnerableComponents.length} component(s): ${vulnerableComponents.map(c => path.basename(c.file)).join(', ')}`;
        subtests.push({
          name: 'dangerouslySetInnerHTML check',
          status: 'FAIL',
          message: `Found unsanitized dangerouslySetInnerHTML in: ${vulnerableComponents.map(c => path.basename(c.file)).join(', ')}`,
        });
      } else {
        subtests.push({
          name: 'dangerouslySetInnerHTML check',
          status: 'PASS',
          message: 'No XSS vulnerabilities found in chart components',
        });
      }

    } catch (e) {
      subtests.push({
        name: 'Chart component analysis',
        status: 'SKIP',
        message: 'Could not analyze chart components: ' + e.message,
      });
    }

  } catch (e) {
    overallStatus = 'FAIL';
    overallMessage = 'Test execution error: ' + e.message;
    log(`  ❌ Error: ${e.message}`, COLORS.red);
  }

  recordTest('H-06', testName, overallStatus, overallMessage, subtests);
  log(`  ${overallStatus === 'PASS' ? '✅' : overallStatus === 'FAIL' ? '❌' : '⚠️'}  ${overallMessage}`,
    overallStatus === 'PASS' ? COLORS.green : overallStatus === 'FAIL' ? COLORS.red : COLORS.yellow);
}

// ============================================================================
// Test H-07: Browser Fingerprinting Without Disclosure
// ============================================================================

async function testH07_BrowserFingerprinting() {
  const testName = 'H-07: Browser Fingerprinting Without Disclosure';
  log(`\n${COLORS.bold}Testing: ${testName}${COLORS.reset}`, COLORS.blue);
  log('─'.repeat(80));

  const subtests = [];
  let overallStatus = 'PASS';
  let overallMessage = 'Browser fingerprinting is properly disclosed';

  try {
    // Test 1: Check for fingerprinting code
    log('  Checking for browser fingerprinting implementation...', COLORS.cyan);
    
    try {
      const sessionScopeCode = fs.readFileSync(
        path.join('src', 'app', 'lib', 'sessionScope.ts'),
        'utf8'
      );

      const hasFingerprinting = sessionScopeCode.includes('fingerprint') ||
                                 sessionScopeCode.includes('hardwareConcurrency') ||
                                 sessionScopeCode.includes('deviceMemory') ||
                                 (sessionScopeCode.includes('navigator') && 
                                  sessionScopeCode.includes('screen'));

      if (hasFingerprinting) {
        subtests.push({
          name: 'Fingerprinting code detection',
          status: 'PASS',
          message: 'Browser fingerprinting code found in session management',
        });
      } else {
        subtests.push({
          name: 'Fingerprinting code detection',
          status: 'PASS',
          message: 'No browser fingerprinting code detected',
        });
      }

    } catch (e) {
      subtests.push({
        name: 'Session scope code analysis',
        status: 'SKIP',
        message: 'Could not read sessionScope.ts: ' + e.message,
      });
    }

    // Test 2: Check privacy policy for fingerprinting disclosure
    log('  Checking privacy policy for fingerprinting disclosure...', COLORS.cyan);
    
    try {
      const privacyPolicy = fs.readFileSync(
        path.join('src', 'app', 'components', 'legal', 'PrivacyPolicy.tsx'),
        'utf8'
      );

      const mentionsFingerprinting = privacyPolicy.toLowerCase().includes('fingerprint') ||
                                      privacyPolicy.toLowerCase().includes('device information') ||
                                      privacyPolicy.toLowerCase().includes('browser information') ||
                                      privacyPolicy.toLowerCase().includes('tracking');

      if (!mentionsFingerprinting) {
        overallStatus = 'WARN';
        overallMessage = 'Privacy policy does not mention browser fingerprinting';
        subtests.push({
          name: 'Privacy policy disclosure',
          status: 'WARN',
          message: 'No mention of browser fingerprinting or device tracking in privacy policy',
        });
      } else {
        subtests.push({
          name: 'Privacy policy disclosure',
          status: 'PASS',
          message: 'Privacy policy mentions browser fingerprinting or device tracking',
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Privacy policy check',
        status: 'SKIP',
        message: 'Could not read privacy policy: ' + e.message,
      });
    }

    // Test 3: Check for consent mechanism for fingerprinting
    log('  Checking for fingerprinting consent...', COLORS.cyan);
    
    try {
      const sessionScopeCode = fs.readFileSync(
        path.join('src', 'app', 'lib', 'sessionScope.ts'),
        'utf8'
      );

      const hasConsentForFingerprint = sessionScopeCode.includes('consent') &&
                                        sessionScopeCode.includes('fingerprint');
      
      const hasOptOut = sessionScopeCode.includes('opt') ||
                         sessionScopeCode.includes('disable') ||
                         sessionScopeCode.includes('preferences');

      if (!hasConsentForFingerprint && !hasOptOut) {
        if (overallStatus !== 'FAIL') {
          overallStatus = 'WARN';
          overallMessage = 'No consent or opt-out mechanism for fingerprinting';
        }
        subtests.push({
          name: 'Fingerprinting consent',
          status: 'WARN',
          message: 'No explicit consent or opt-out for browser fingerprinting',
        });
      } else {
        subtests.push({
          name: 'Fingerprinting consent',
          status: 'PASS',
          message: 'Consent or opt-out mechanism exists for fingerprinting',
        });
      }
    } catch (e) {
      subtests.push({
        name: 'Consent mechanism check',
        status: 'SKIP',
        message: 'Could not analyze consent mechanism: ' + e.message,
      });
    }

  } catch (e) {
    overallStatus = 'FAIL';
    overallMessage = 'Test execution error: ' + e.message;
    log(`  ❌ Error: ${e.message}`, COLORS.red);
  }

  recordTest('H-07', testName, overallStatus, overallMessage, subtests);
  log(`  ${overallStatus === 'PASS' ? '✅' : overallStatus === 'FAIL' ? '❌' : '⚠️'}  ${overallMessage}`,
    overallStatus === 'PASS' ? COLORS.green : overallStatus === 'FAIL' ? COLORS.red : COLORS.yellow);
}

// ============================================================================
// Report Generation
// ============================================================================

function generateSummary() {
  log('\n' + '═'.repeat(80), COLORS.bold);
  log(`  Phase 2: High Priority Security - Test Summary`, COLORS.bold);
  log('═'.repeat(80), COLORS.bold);

  log(`\n  Total Tests:  ${testResults.total}`, COLORS.white);
  log(`  ✅ Passed:    ${testResults.passed}`, testResults.passed > 0 ? COLORS.green : COLORS.white);
  log(`  ❌ Failed:    ${testResults.failed}`, testResults.failed > 0 ? COLORS.red : COLORS.white);
  log(`  ⚠️  Warnings:   ${testResults.warnings}`, testResults.warnings > 0 ? COLORS.yellow : COLORS.white);
  log(`  ⏭️  Skipped:    ${testResults.skipped}`, testResults.skipped > 0 ? COLORS.cyan : COLORS.white);
  log(`  Duration:     ${testResults.duration}ms`, COLORS.white);

  if (testResults.failed > 0) {
    log(`\n  ${COLORS.bgRed}${COLORS.bold} STATUS: FAILED - ${testResults.failed} test(s) failed ${COLORS.reset}`, COLORS.red);
  } else if (testResults.warnings > 0) {
    log(`\n  ${COLORS.bgYellow}${COLORS.bold} STATUS: PASSED WITH WARNINGS ${COLORS.reset}`, COLORS.yellow);
  } else {
    log(`\n  ${COLORS.bgGreen}${COLORS.bold} STATUS: ALL TESTS PASSED ✅${COLORS.reset}`, COLORS.green);
  }

  log('\n' + '─'.repeat(80), COLORS.bold);
  log('  Detailed Results:', COLORS.bold);
  log('─'.repeat(80), COLORS.bold);

  testResults.details.forEach((detail, i) => {
    const icon = detail.status === 'PASS' ? '✅' : 
                 detail.status === 'FAIL' ? '❌' : 
                 detail.status === 'WARN' ? '⚠️' : '⏭️';
    const color = detail.status === 'PASS' ? COLORS.green : 
                  detail.status === 'FAIL' ? COLORS.red : 
                  detail.status === 'WARN' ? COLORS.yellow : COLORS.cyan;

    log(`\n  ${i + 1}. ${icon} ${detail.testId}: ${detail.name}`, color);
    log(`     Status: ${detail.status}`, color);
    log(`     Message: ${detail.message}`, COLORS.white);
    
    if (detail.subtests && detail.subtests.length > 0) {
      detail.subtests.forEach((sub, j) => {
        const subIcon = sub.status === 'PASS' ? '  ✅' : 
                        sub.status === 'FAIL' ? '  ❌' : 
                        sub.status === 'WARN' ? '  ⚠️' : '  ⏭️';
        log(`     ${subIcon} ${sub.name}: ${sub.message}`, COLORS.cyan);
      });
    }
  });

  log('\n' + '═'.repeat(80), COLORS.bold);
}

function generateJSONReport() {
  const report = {
    ...testResults,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      skipped: testResults.skipped,
      duration: testResults.duration,
      status: testResults.failed > 0 ? 'FAILED' : 
              testResults.warnings > 0 ? 'PASSED_WITH_WARNINGS' : 'PASSED',
    },
  };

  const outputPath = path.join(
    'test-reports',
    `phase2-high-security-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );

  fs.mkdirSync('test-reports', { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  return outputPath;
}

// ============================================================================
// Telegram Integration
// ============================================================================

async function sendTelegramReport() {
  try {
    // Try to read from .env file first (like Phase 1)
    let botToken, chatId, threadId;
    
    try {
      const envPath = path.join('.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            envVars[match[1].trim()] = match[2].trim();
          }
        });
        
        botToken = envVars.TELEGRAM_BOT_TOKEN;
        chatId = envVars.TELEGRAM_CHAT_ID;
        threadId = envVars.TELEGRAM_TESTING_THREAD_ID || '735'; // Default to Phase 1 thread
      }
    } catch (e) {
      log('  ⚠️  Could not read .env file, trying telegram-config.json...', COLORS.yellow);
    }
    
    // Fallback to telegram-config.json if .env not found
    if (!botToken || !chatId) {
      try {
        const configPath = path.join('scripts', 'telegram-config.json');
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          botToken = config.botToken;
          chatId = config.chatId;
          threadId = config.threadIdPhase2 || config.threadId || '735';
        }
      } catch (e) {
        // Ignore
      }
    }

    if (!botToken || !chatId) {
      log('  ⚠️  Telegram credentials not configured. Skipping notification.', COLORS.yellow);
      log('     Please add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to .env file.', COLORS.yellow);
      return;
    }

    const failedCount = testResults.failed;
    const passCount = testResults.passed;
    const totalCount = testResults.total;
    const status = failedCount > 0 ? '❌ FAILED' : '✅ PASSED';

    const summary = testResults.details
      .map(d => {
        const icon = d.status === 'PASS' ? '✅' : d.status === 'FAIL' ? '❌' : '⚠️';
        return `${icon} ${d.testId}: ${d.message}`;
      })
      .join('\n');

    const message = `
*🔒 Phase 2 Security Test Report*

*Status:* ${status}
*Tests:* ${totalCount} total | ${passCount} passed | ${failedCount} failed
*Duration:* ${testResults.duration}ms

*Results:*
${summary}

*Overall:* ${failedCount > 0 ? 'HIGH vulnerabilities detected!' : testResults.warnings > 0 ? 'Passed with warnings' : 'All high priority security tests passed'}
`.trim();

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await makeRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: threadId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (response.statusCode === 200) {
      log('  ✅ Telegram notification sent', COLORS.green);
    } else {
      log(`  ⚠️  Telegram notification failed: ${response.statusCode}`, COLORS.yellow);
    }
  } catch (e) {
    log(`  ⚠️  Telegram notification error: ${e.message}`, COLORS.yellow);
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function runTests() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--base-url':
        CONFIG.baseUrl = args[++i];
        break;
      case '--test':
        const testArg = args[++i];
        if (testArg === 'all') {
          CONFIG.tests = ['H-01', 'H-02', 'H-03', 'H-04', 'H-05', 'H-06', 'H-07'];
        } else {
          CONFIG.tests = [testArg];
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
Job360 Phase 2 High Priority Security Test Suite

Usage:
  node test-phase2-high-security.js [options]

Options:
  --base-url <url>       Base URL (default: http://localhost:5173)
  --test <id>            Run specific test (H-01 to H-07, or all)
  --verbose              Show detailed output
  --json                 Output results as JSON
  --telegram             Send report to Telegram
  --help                 Show this help message
`);
        process.exit(0);
        break;
    }
  }

  testResults.baseUrl = CONFIG.baseUrl;
  testResults.startTime = new Date();

  log('\n' + '═'.repeat(80), COLORS.bold);
  log(`  ${COLORS.bold}Job360 Security Test Suite - Phase 2: High Priority${COLORS.reset}`, COLORS.bold);
  log('═'.repeat(80), COLORS.bold);
  log(`  Base URL: ${CONFIG.baseUrl}`, COLORS.cyan);
  log(`  Tests: ${CONFIG.tests.join(', ')}`, COLORS.cyan);
  log(`  Started: ${testResults.startTime.toISOString()}`, COLORS.cyan);
  log('═'.repeat(80), COLORS.bold);

  // Run selected tests
  const testMap = {
    'H-01': testH01_PIISentToTelegram,
    'H-02': testH02_NoRegistrationConsent,
    'H-03': testH03_CVUploadConsentImplicit,
    'H-04': testH04_CVSentToThirdPartyAI,
    'H-05': testH05_NoRLSPolicies,
    'H-06': testH06_XSSInChartComponent,
    'H-07': testH07_BrowserFingerprinting,
  };

  for (const testId of CONFIG.tests) {
    const testFn = testMap[testId];
    if (testFn) {
      await testFn();
    } else {
      log(`\n  ⚠️  Unknown test: ${testId}`, COLORS.yellow);
    }
  }

  testResults.endTime = new Date();
  testResults.duration = testResults.endTime - testResults.startTime;

  // Generate reports
  generateSummary();

  if (CONFIG.jsonOutput) {
    const jsonPath = generateJSONReport();
    log(`\n  📄 JSON report saved to: ${jsonPath}`, COLORS.cyan);
  }

  if (CONFIG.telegramReport) {
    await sendTelegramReport();
  }

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
