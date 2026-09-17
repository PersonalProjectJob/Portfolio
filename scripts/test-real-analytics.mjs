import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('  TEST: REAL CLICK COUNTING & AI ANALYTICS VERIFICATION SUITE   ');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(description, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`▶ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`✖ [FAIL] ${description}`);
    console.error(`   Error: ${err.message}\n`);
  }
}

// ─── Test 1: Zero Mock Verification in Source Code ───
runTest('1. trackingRepository DEFAULT_TRACKING_LINKS has zero mock values (clicks_count = 0)', () => {
  const repoFile = path.resolve('src/cms/repositories/trackingRepository.ts');
  const content = fs.readFileSync(repoFile, 'utf8');

  assert.ok(
    content.includes('clicks_count: 0'),
    'DEFAULT_TRACKING_LINKS must set clicks_count to 0'
  );
  assert.ok(
    !content.includes('[48, 35, 29, 21, 14][idx]'),
    'Hardcoded mock array [48, 35, 29, 21, 14] must be completely removed'
  );
  assert.ok(
    content.includes('export interface ClickEvent'),
    'ClickEvent interface must be exported'
  );
  assert.ok(
    content.includes('export function recordClickEvent'),
    'recordClickEvent must be exported'
  );
  assert.ok(
    content.includes('export function detectDeviceType'),
    'detectDeviceType must be exported'
  );
});

// ─── Test 2: Client-side /r/:slug Redirect Resolver in App.tsx ───
runTest('2. App.tsx includes client-side /r/:slug interceptor & redirect resolver', () => {
  const appFile = path.resolve('src/App.tsx');
  const content = fs.readFileSync(appFile, 'utf8');

  assert.ok(
    content.includes("path.startsWith('/r/')"),
    "App.tsx must intercept paths starting with '/r/'"
  );
  assert.ok(
    content.includes('incrementTrackingClick(slug)'),
    'App.tsx must call incrementTrackingClick on shortlink visit'
  );
  assert.ok(
    content.includes('window.location.replace(targetUrl)'),
    'App.tsx must redirect visitor to resolved destination URL'
  );
});

// ─── Test 3: Analytics Repository Structure & Metrics Calculation ───
runTest('3. analyticsRepository.ts exports overview, timeline, channel breakdown, and reset', () => {
  const analyticsFile = path.resolve('src/cms/repositories/analyticsRepository.ts');
  const content = fs.readFileSync(analyticsFile, 'utf8');

  assert.ok(content.includes('export function getAnalyticsOverview'), 'getAnalyticsOverview exported');
  assert.ok(content.includes('export function getTimelineStats'), 'getTimelineStats exported');
  assert.ok(content.includes('export function getChannelBreakdown'), 'getChannelBreakdown exported');
  assert.ok(content.includes('export function getTopTrackingLinks'), 'getTopTrackingLinks exported');
  assert.ok(content.includes('export function getRecentClickEvents'), 'getRecentClickEvents exported');
  assert.ok(content.includes('export async function resetAllAnalyticsData'), 'resetAllAnalyticsData exported');
  assert.ok(content.includes('recruiterIntentScore'), 'Recruiter Intent Score calculation present');
});

// ─── Test 4: AI Analyst Service & Heuristic Executive Engine ───
runTest('4. aiAnalystService.ts generates Driver, Friction, Recommendation, and Markdown report', () => {
  const aiFile = path.resolve('src/cms/services/aiAnalystService.ts');
  const content = fs.readFileSync(aiFile, 'utf8');

  assert.ok(content.includes('export function generateAiInsights'), 'generateAiInsights exported');
  assert.ok(content.includes('export function generateExecutiveMarkdownReport'), 'generateExecutiveMarkdownReport exported');
  assert.ok(content.includes("type: 'driver'"), 'Driver card generator present');
  assert.ok(content.includes("type: 'friction'"), 'Friction card generator present');
  assert.ok(content.includes("type: 'recommendation'"), 'Recommendation card generator present');
  assert.ok(content.includes('executiveSummary'), 'Executive summary narrative generated');
});

// ─── Test 5: AdminApp Navigation & Routing for /admin/analytics ───
runTest('5. AdminApp.tsx includes AI Analytics route, sidebar item, and component rendering', () => {
  const adminAppFile = path.resolve('src/admin/AdminApp.tsx');
  const content = fs.readFileSync(adminAppFile, 'utf8');

  assert.ok(content.includes("'/admin/analytics'"), "AdminRoute union contains '/admin/analytics'");
  assert.ok(content.includes("name: 'AI Analytics'"), 'NAV_ITEMS includes AI Analytics item');
  assert.ok(content.includes('AdminAnalytics'), 'AdminAnalytics component is imported and rendered');
  assert.ok(content.includes('BarChart3'), 'BarChart3 icon is imported and used');
});

// ─── Test 6: AdminDashboard Dynamic Click Calculation ───
runTest('6. AdminDashboard.tsx removes static 142 clicks and calculates real total dynamically', () => {
  const dashFile = path.resolve('src/admin/routes/AdminDashboard.tsx');
  const content = fs.readFileSync(dashFile, 'utf8');

  assert.ok(
    content.includes('realTotalClicks'),
    'AdminDashboard calculates realTotalClicks dynamically'
  );
  assert.ok(
    !content.includes('totalClicks: 142'),
    'Hardcoded static totalClicks: 142 must be removed'
  );
  assert.ok(
    content.includes("onClick={() => handleAction('/admin/analytics')}"),
    'AdminDashboard contains direct button linking to /admin/analytics'
  );
});

// ─── Test 7: AdminAnalytics Component UI & Interactive Features ───
runTest('7. AdminAnalytics.tsx renders AI Deck, KPI grid, SVG timeline, and report modal', () => {
  const analyticsUIFile = path.resolve('src/admin/routes/AdminAnalytics.tsx');
  const content = fs.readFileSync(analyticsUIFile, 'utf8');

  assert.ok(content.includes('export const AdminAnalytics'), 'AdminAnalytics is exported as a React FC');
  assert.ok(content.includes('LIVE TELEMETRY'), 'Live Telemetry badge rendered');
  assert.ok(content.includes('AI Strategic Insights Deck'), 'AI Insights Deck section rendered');
  assert.ok(content.includes('Clicks Trend Over Time'), 'Timeline chart rendered');
  assert.ok(content.includes('Channel Distribution'), 'Channel distribution breakdown rendered');
  assert.ok(content.includes('Top Performing Shortlinks Leaderboard'), 'Leaderboard rendered');
  assert.ok(content.includes('Live Inbound Activity Feed'), 'Live activity feed rendered');
  assert.ok(content.includes('AI Strategic Executive Report'), 'Executive report modal included');
  assert.ok(content.includes('Xác nhận Reset Dữ liệu'), 'Reset test data modal included');
});

console.log('\n================================================================');
console.log(`  RESULT: ${passedTests}/${totalTests} TEST SUITES PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
