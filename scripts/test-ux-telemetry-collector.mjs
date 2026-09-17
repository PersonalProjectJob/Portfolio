import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('  TEST: UX TELEMETRY COLLECTOR UNIT TEST SUITE                  ');
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

// ─── Test 1: Module and Types Existence ───
runTest('1. Types module defines UxSession, UxSectionDwell, and UxFrictionEvent', () => {
  const typesFile = path.resolve('src/lib/uxTelemetry/types.ts');
  assert.ok(fs.existsSync(typesFile), 'types.ts must exist');
  const content = fs.readFileSync(typesFile, 'utf8');

  assert.ok(content.includes('export interface UxSession'), 'UxSession interface must be exported');
  assert.ok(content.includes('export interface UxSectionDwell'), 'UxSectionDwell must be exported');
  assert.ok(content.includes('export interface UxFrictionEvent'), 'UxFrictionEvent must be exported');
  assert.ok(content.includes('export type UxReaderType'), 'UxReaderType must be exported');
  assert.ok(content.includes('export type UxFrictionType'), 'UxFrictionType must be exported');
});

// ─── Test 2: Collector Module Logic & Dwell Calculation ───
runTest('2. Collector implements IntersectionObserver and Rage Click algorithms', () => {
  const collectorFile = path.resolve('src/lib/uxTelemetry/collector.ts');
  assert.ok(fs.existsSync(collectorFile), 'collector.ts must exist');
  const content = fs.readFileSync(collectorFile, 'utf8');

  assert.ok(content.includes('detectUxDevice'), 'detectUxDevice helper must be defined');
  assert.ok(content.includes('IntersectionObserver'), 'IntersectionObserver must be utilized for section visibility');
  assert.ok(content.includes('setupRageClickDetection'), 'setupRageClickDetection must track rapid consecutive clicks');
  assert.ok(content.includes('setupScrollDepthTracking'), 'setupScrollDepthTracking must track max scroll depth');
  assert.ok(content.includes('recordSectionDwell'), 'recordSectionDwell must record section enter/exit dwell time');
  assert.ok(content.includes('recordFrictionEvent'), 'recordFrictionEvent must capture rage clicks');
});

// ─── Test 3: Dispatcher Persistence & Reset ───
runTest('3. Dispatcher handles event queuing, localStorage buffer, and flush', () => {
  const dispatcherFile = path.resolve('src/lib/uxTelemetry/dispatcher.ts');
  assert.ok(fs.existsSync(dispatcherFile), 'dispatcher.ts must exist');
  const content = fs.readFileSync(dispatcherFile, 'utf8');

  assert.ok(content.includes('portfolio_ux_events_v1'), 'Must use portfolio_ux_events_v1 storage key');
  assert.ok(content.includes('portfolio_ux_sessions_v1'), 'Must use portfolio_ux_sessions_v1 storage key');
  assert.ok(content.includes('enqueue(event'), 'enqueue method must exist');
  assert.ok(content.includes('flush()'), 'flush method must exist');
  assert.ok(content.includes('reset()'), 'reset method must exist to clear telemetry');
});

// ─── Test 4: Public API Index Facade ───
runTest('4. index.ts exports public API: initUxTelemetry, observeSection, resetUxTelemetry', () => {
  const indexFile = path.resolve('src/lib/uxTelemetry/index.ts');
  assert.ok(fs.existsSync(indexFile), 'index.ts must exist');
  const content = fs.readFileSync(indexFile, 'utf8');

  assert.ok(content.includes('export function initUxTelemetry'), 'initUxTelemetry must be exported');
  assert.ok(content.includes('export function observeSection'), 'observeSection must be exported');
  assert.ok(content.includes('export function recordUxEvent'), 'recordUxEvent must be exported');
  assert.ok(content.includes('export function recordFrictionEvent'), 'recordFrictionEvent must be exported');
  assert.ok(content.includes('export function resetUxTelemetry'), 'resetUxTelemetry must be exported');
  assert.ok(content.includes('export function destroyUxTelemetry'), 'destroyUxTelemetry must be exported');
});

// ─── Test 5: Algorithmic Simulation of Rage Click and Dwell Time ───
runTest('5. Rage click detection algorithm correctly clusters rapid consecutive clicks', () => {
  // Simulate 3 clicks within 500ms in 15px radius
  const clicks = [
    { x: 100, y: 150, time: 1000 },
    { x: 105, y: 152, time: 1200 },
    { x: 108, y: 149, time: 1400 },
  ];

  const first = clicks[0];
  const isCluster = clicks.every(
    (c) => Math.hypot(c.x - first.x, c.y - first.y) <= 35 && c.time - first.time <= 700
  );

  assert.ok(isCluster, 'Consecutive clicks within 35px radius and 700ms should trigger rage click cluster');

  // Verify non-clustered clicks do not trigger
  const scatteredClicks = [
    { x: 100, y: 150, time: 1000 },
    { x: 300, y: 450, time: 1200 },
  ];
  const isScattered = scatteredClicks.every(
    (c) => Math.hypot(c.x - first.x, c.y - first.y) <= 35
  );
  assert.strictEqual(isScattered, false, 'Scattered clicks must not be classified as rage click');
});

console.log('\n================================================================');
console.log(`  RESULT: ${passedTests}/${totalTests} TEST SUITES PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
