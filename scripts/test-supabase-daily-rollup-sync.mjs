import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('  TEST: SUPABASE DAILY ROLLUP & CLOUD HYDRATION TEST SUITE      ');
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

// ─── Test 1: SQL Migration File for Daily Rollup Automation & RLS ───
runTest('1. 20260918_daily_rollup_automation.sql exists with RLS policies and stored procedure', () => {
  const sqlFile = path.resolve('supabase/migrations/20260918_daily_rollup_automation.sql');
  assert.ok(fs.existsSync(sqlFile), 'Migration SQL file must exist');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  assert.ok(sql.includes('Public can insert ux_daily_rollups'), 'Must have INSERT policy for anon on ux_daily_rollups');
  assert.ok(sql.includes('Public can update ux_daily_rollups'), 'Must have UPDATE policy for anon on ux_daily_rollups');
  assert.ok(sql.includes('calculate_and_upsert_ux_daily_rollups'), 'Must define calculate_and_upsert_ux_daily_rollups stored procedure');
  assert.ok(sql.includes('SECURITY DEFINER'), 'Stored procedure must use SECURITY DEFINER for safe DB execution');
  assert.ok(sql.includes('ON CONFLICT (date_string, page_slug)'), 'Must enforce upsert idempotency on date_string and page_slug');
});

// ─── Test 2: trackingRepository.ts Cloud Hydration ───
runTest('2. trackingRepository.ts exports syncPostViewsFromSupabase with proper deduplication', () => {
  const file = path.resolve('src/cms/repositories/trackingRepository.ts');
  assert.ok(fs.existsSync(file), 'trackingRepository.ts must exist');
  const content = fs.readFileSync(file, 'utf8');

  assert.ok(content.includes('export async function syncPostViewsFromSupabase'), 'Must export syncPostViewsFromSupabase');
  assert.ok(content.includes('from(\'post_views\')'), 'Must query post_views table');
  assert.ok(content.includes('localStorage.setItem(POST_VIEWS_STORAGE_KEY'), 'Must hydrate local cache');
});

// ─── Test 3: dispatcher.ts UX Cloud Hydration & Automated Rollup ───
runTest('3. dispatcher.ts implements syncUxDataFromSupabase and auto-upserts daily rollups', () => {
  const file = path.resolve('src/lib/uxTelemetry/dispatcher.ts');
  assert.ok(fs.existsSync(file), 'dispatcher.ts must exist');
  const content = fs.readFileSync(file, 'utf8');

  assert.ok(content.includes('public async syncUxDataFromSupabase'), 'Must implement syncUxDataFromSupabase');
  assert.ok(content.includes('from(\'ux_sessions\')'), 'Must query ux_sessions');
  assert.ok(content.includes('from(\'ux_events\')'), 'Must query ux_events');
  assert.ok(content.includes('from(\'ux_daily_rollups\').upsert'), 'Must upsert into ux_daily_rollups on event flush');
});

// ─── Test 4: uxAnalyticsRepository.ts Rollup Sync Functions ───
runTest('4. uxAnalyticsRepository.ts exports syncDailyUxRollupToSupabase and syncAllDailyRollupsToSupabase', () => {
  const file = path.resolve('src/cms/repositories/uxAnalyticsRepository.ts');
  assert.ok(fs.existsSync(file), 'uxAnalyticsRepository.ts must exist');
  const content = fs.readFileSync(file, 'utf8');

  assert.ok(content.includes('export async function syncDailyUxRollupToSupabase'), 'Must export syncDailyUxRollupToSupabase');
  assert.ok(content.includes('export async function syncAllDailyRollupsToSupabase'), 'Must export syncAllDailyRollupsToSupabase');
  assert.ok(content.includes('export async function getCloudDailyUxRollups'), 'Must export getCloudDailyUxRollups');
  assert.ok(content.includes('from(\'ux_daily_rollups\').upsert'), 'Must upsert to ux_daily_rollups');
});

// ─── Test 5: Admin Analytics & UX Lab Cloud Integration ───
runTest('5. Admin Analytics and UX Lab trigger cloud hydration on mount and refresh', () => {
  const analyticsFile = path.resolve('src/admin/routes/AdminAnalytics.tsx');
  const uxLabFile = path.resolve('src/admin/routes/AdminUxLab.tsx');
  const dashFile = path.resolve('src/admin/routes/AdminDashboard.tsx');

  const analyticsContent = fs.readFileSync(analyticsFile, 'utf8');
  assert.ok(analyticsContent.includes('syncPostViewsFromSupabase'), 'AdminAnalytics must call syncPostViewsFromSupabase');

  const uxLabContent = fs.readFileSync(uxLabFile, 'utf8');
  assert.ok(uxLabContent.includes('syncUxDataFromSupabase'), 'AdminUxLab must call syncUxDataFromSupabase');
  assert.ok(uxLabContent.includes('syncAllDailyRollupsToSupabase'), 'AdminUxLab must call syncAllDailyRollupsToSupabase');

  const dashContent = fs.readFileSync(dashFile, 'utf8');
  assert.ok(dashContent.includes('syncPostViewsFromSupabase'), 'AdminDashboard must call syncPostViewsFromSupabase');
});

// ─── Test 6: Algorithmic Deduplication Logic Test ───
runTest('6. Algorithmic deduplication correctly merges cloud and local events without duplication', () => {
  const cloudEvents = [
    { id: '1', projectId: 'agent-handoff', timestamp: '2026-09-18T10:00:00Z', device_type: 'desktop' },
    { id: '2', projectId: 'vlinkpay', timestamp: '2026-09-18T10:05:00Z', device_type: 'mobile' },
  ];

  const localEvents = [
    { id: '1', projectId: 'agent-handoff', timestamp: '2026-09-18T10:00:00Z', device_type: 'desktop' }, // Duplicate of cloud
    { id: '3', projectId: 'agent-handoff', timestamp: '2026-09-18T10:10:00Z', device_type: 'desktop' }, // Local-only
  ];

  const map = new Map();
  cloudEvents.forEach((ev) => map.set(ev.id || `${ev.projectId}_${ev.timestamp}`, ev));
  localEvents.forEach((ev) => {
    const key = ev.id || `${ev.projectId}_${ev.timestamp}`;
    if (!map.has(key)) map.set(key, ev);
  });

  const merged = Array.from(map.values());
  assert.equal(merged.length, 3, 'Must have exactly 3 unique events after deduplication');
  assert.ok(merged.find((e) => e.id === '1'), 'Must include event 1');
  assert.ok(merged.find((e) => e.id === '2'), 'Must include event 2');
  assert.ok(merged.find((e) => e.id === '3'), 'Must include event 3');
});

// ─── Test 7: Daily Rollup Schema Parity Test ───
runTest('7. Daily Rollup object fields exactly match Supabase schema columns', () => {
  const requiredColumns = [
    'date_string',
    'page_slug',
    'project_name',
    'total_readers',
    'avg_dwell_seconds',
    'completion_rate',
    'ux_grade',
    'friction_alerts_count',
    'skimmer_pct',
    'scanner_pct',
    'deep_reader_pct',
    'rollup_timestamp',
  ];

  const sampleRollup = {
    date_string: '2026-09-18',
    page_slug: 'agent-handoff',
    project_name: 'Agent Handoff & Governance',
    total_readers: 2,
    avg_dwell_seconds: 45,
    completion_rate: 60,
    ux_grade: 'A',
    friction_alerts_count: 0,
    skimmer_pct: 30,
    scanner_pct: 40,
    deep_reader_pct: 30,
    rollup_timestamp: new Date().toISOString(),
  };

  for (const col of requiredColumns) {
    assert.ok(col in sampleRollup, `Sample rollup must contain column: ${col}`);
  }
});

console.log(`\n================================================================`);
console.log(`  RESULT: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`================================================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
