import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('  TEST: UX INSTRUMENTATION IN CASE STUDY & LANDING PAGE          ');
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

// ─── Test 1: CaseStudyLayout Integration ───
runTest('1. CaseStudyLayout.tsx imports and mounts initUxTelemetry & destroyUxTelemetry', () => {
  const layoutFile = path.resolve('src/components/layout/CaseStudyLayout.tsx');
  assert.ok(fs.existsSync(layoutFile), 'CaseStudyLayout.tsx must exist');
  const content = fs.readFileSync(layoutFile, 'utf8');

  assert.ok(content.includes('initUxTelemetry'), 'Must import initUxTelemetry');
  assert.ok(content.includes('observeSection'), 'Must import observeSection');
  assert.ok(content.includes('destroyUxTelemetry'), 'Must import destroyUxTelemetry');
  assert.ok(content.includes('data-ux-section'), 'Must observe elements with data-ux-section');
});

// ─── Test 2: ProjectAgentHandoff Section Markers ───
runTest('2. ProjectAgentHandoff.tsx contains explicit data-ux-section tags', () => {
  const pageFile = path.resolve('src/pages/ProjectAgentHandoff.tsx');
  assert.ok(fs.existsSync(pageFile), 'ProjectAgentHandoff.tsx must exist');
  const content = fs.readFileSync(pageFile, 'utf8');

  assert.ok(content.includes('data-ux-section="hero"'), 'Must have hero section marked');
  assert.ok(content.includes('data-ux-section="problem_statement"'), 'Must have problem_statement marked');
  assert.ok(content.includes('data-ux-section="system_architecture"'), 'Must have system_architecture marked');
  assert.ok(content.includes('data-ux-section="interaction_protocol"'), 'Must have interaction_protocol marked');
  assert.ok(content.includes('data-ux-section="impact_metrics"'), 'Must have impact_metrics marked');
});

console.log('\n================================================================');
console.log(`  RESULT: ${passedTests}/${totalTests} TEST SUITES PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
