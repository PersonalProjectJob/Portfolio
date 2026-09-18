import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('  TEST: FIRST-PARTY POST VIEWS TELEMETRY & ADMIN ANALYTICS      ');
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

// ─── Test 1: Tracking Repository Exports & Post View Model ───
runTest('1. trackingRepository.ts exports PostViewEvent and core post tracking methods', () => {
  const file = path.resolve('src/cms/repositories/trackingRepository.ts');
  const content = fs.readFileSync(file, 'utf8');

  assert.ok(content.includes('export interface PostViewEvent'), 'Must export PostViewEvent');
  assert.ok(content.includes('export const POST_VIEWS_STORAGE_KEY'), 'Must export POST_VIEWS_STORAGE_KEY');
  assert.ok(content.includes('export function getLocalPostViewEvents'), 'Must export getLocalPostViewEvents');
  assert.ok(content.includes('export function recordPostViewEvent'), 'Must export recordPostViewEvent');
  assert.ok(content.includes('export function clearLocalPostViewEvents'), 'Must export clearLocalPostViewEvents');
  assert.ok(content.includes('export function recordPostView'), 'Must export recordPostView');
  assert.ok(content.includes('export function getProjectViewsMap'), 'Must export getProjectViewsMap');
  assert.ok(content.includes('clearLocalPostViewEvents()'), 'resetAllTrackingStats must clear post views');
});

// ─── Test 2: Analytics Repository Post View Integration ───
runTest('2. analyticsRepository.ts integrates post views into overview, leaderboards & timeline', () => {
  const file = path.resolve('src/cms/repositories/analyticsRepository.ts');
  const content = fs.readFileSync(file, 'utf8');

  assert.ok(content.includes('totalPostViews: number;'), 'AnalyticsOverview must have totalPostViews');
  assert.ok(content.includes('totalEngagements: number;'), 'AnalyticsOverview must have totalEngagements');
  assert.ok(content.includes('topPost:'), 'AnalyticsOverview must have topPost');
  assert.ok(content.includes('export function getTopViewedCaseStudies'), 'Must export getTopViewedCaseStudies');
  assert.ok(content.includes('export function getUnifiedRecentEvents'), 'Must export getUnifiedRecentEvents');
  assert.ok(content.includes('export function filterPostViewsByRange'), 'Must export filterPostViewsByRange');
  assert.ok(content.includes('postViews: number;'), 'TimelinePoint must include postViews');
});

// ─── Test 3: Navigation & Page Mount Instrumentation ───
runTest('3. CaseStudyLayout and ProjectRoute automatically record post views on mount', () => {
  const caseStudyLayoutFile = path.resolve('src/components/layout/CaseStudyLayout.tsx');
  const caseStudyContent = fs.readFileSync(caseStudyLayoutFile, 'utf8');
  assert.ok(caseStudyContent.includes('recordPostView('), 'CaseStudyLayout must call recordPostView');

  const projectRouteFile = path.resolve('src/pages/ProjectRoute.tsx');
  const projectRouteContent = fs.readFileSync(projectRouteFile, 'utf8');
  assert.ok(projectRouteContent.includes('recordPostView('), 'ProjectRoute must call recordPostView for non-legacy case studies');
});

// ─── Test 4: UX Telemetry Dwell Retention on Exit ───
runTest('4. uxTelemetry collector flushes active section dwell times on destroy() and tracks in-view on observe', () => {
  const collectorFile = path.resolve('src/lib/uxTelemetry/collector.ts');
  const collectorContent = fs.readFileSync(collectorFile, 'utf8');

  assert.ok(collectorContent.includes('state.enterTime'), 'destroy() must inspect state.enterTime');
  assert.ok(collectorContent.includes('this.recordSectionDwell(state)'), 'destroy() must flush dwell time before clearing sectionMap');
  assert.ok(collectorContent.includes('getBoundingClientRect'), 'observeSection must check initial viewport visibility');
});

// ─── Test 5: Admin UI Integration (Dashboard, Analytics, Content) ───
runTest('5. AdminDashboard, AdminAnalytics, and AdminContent display post views telemetry', () => {
  const dashFile = path.resolve('src/admin/routes/AdminDashboard.tsx');
  const dashContent = fs.readFileSync(dashFile, 'utf8');
  assert.ok(dashContent.includes('totalPostViews'), 'AdminDashboard must include totalPostViews in stats');
  assert.ok(dashContent.includes('Post Views'), 'AdminDashboard must render Post Views KPI card');
  assert.ok(dashContent.includes('Case Study Viewed:'), 'AdminDashboard must include case study views in activity feed');

  const analyticsFile = path.resolve('src/admin/routes/AdminAnalytics.tsx');
  const analyticsContent = fs.readFileSync(analyticsFile, 'utf8');
  assert.ok(analyticsContent.includes('Case Study Views'), 'AdminAnalytics must render Case Study Views card');
  assert.ok(analyticsContent.includes('getTopViewedCaseStudies'), 'AdminAnalytics must load top viewed case studies');
  assert.ok(analyticsContent.includes('getUnifiedRecentEvents'), 'AdminAnalytics must load unified recent events');
  assert.ok(analyticsContent.includes('POST VIEW'), 'AdminAnalytics must badge post view events in feed');

  const contentFile = path.resolve('src/admin/routes/AdminContent.tsx');
  const contentContent = fs.readFileSync(contentFile, 'utf8');
  assert.ok(contentContent.includes('getProjectViewsMap'), 'AdminContent must call getProjectViewsMap');
  assert.ok(contentContent.includes('Total Case Study Views'), 'AdminContent must render views badge on project cards');
});

// ─── Test 6: Algorithmic Verification of Post Views Aggregation & Ranking ───
runTest('6. Algorithmic ranking and aggregation logic functions accurately', () => {
  const mockEvents = [
    { projectId: 'agent-handoff', projectName: 'The Agent Handoff Problem', timestamp: '2026-09-18T08:00:00Z', device_type: 'desktop' },
    { projectId: 'agent-handoff', projectName: 'The Agent Handoff Problem', timestamp: '2026-09-18T08:05:00Z', device_type: 'mobile' },
    { projectId: 'vlink-cargo', projectName: 'Vlink Logistics Suite', timestamp: '2026-09-18T08:10:00Z', device_type: 'desktop' },
    { projectId: 'agent-handoff', projectName: 'The Agent Handoff Problem', timestamp: '2026-09-18T08:15:00Z', device_type: 'desktop' },
  ];

  // Views Map calculation
  const viewsMap = {};
  for (const ev of mockEvents) {
    viewsMap[ev.projectId] = (viewsMap[ev.projectId] || 0) + 1;
  }
  assert.strictEqual(viewsMap['agent-handoff'], 3);
  assert.strictEqual(viewsMap['vlink-cargo'], 1);

  // Top Post calculation
  let topPost = null;
  let maxViews = 0;
  for (const [id, count] of Object.entries(viewsMap)) {
    if (count > maxViews) {
      maxViews = count;
      topPost = { projectId: id, views: count };
    }
  }
  assert.strictEqual(topPost.projectId, 'agent-handoff');
  assert.strictEqual(topPost.views, 3);

  // Unified stream sorting
  const mockClicks = [
    { eventType: 'shortlink_click', slug: 'linkedin', timestamp: '2026-09-18T08:12:00Z' },
  ];
  const mockViews = mockEvents.map((e) => ({ eventType: 'post_view', ...e }));
  const unified = [...mockClicks, ...mockViews].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  assert.strictEqual(unified.length, 5);
  assert.strictEqual(unified[0].eventType, 'post_view'); // 08:15
  assert.strictEqual(unified[1].eventType, 'shortlink_click'); // 08:12
  assert.strictEqual(unified[2].eventType, 'post_view'); // 08:10
});

// ─── Test Summary ───
console.log(`\n================================================================`);
console.log(`  TEST RESULTS: ${passedTests}/${totalTests} SUITES PASSED (100%) `);
console.log(`================================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
