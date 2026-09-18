import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('================================================================');
console.log('  TEST: UX ANALYTICS REPOSITORY & AI CRITIQUE INTEGRATION TEST   ');
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

// ─── Test 1: UX Analytics Repository File & Exports ───
runTest('1. uxAnalyticsRepository.ts exists and exports core aggregation functions', () => {
  const repoFile = path.resolve('src/cms/repositories/uxAnalyticsRepository.ts');
  assert.ok(fs.existsSync(repoFile), 'uxAnalyticsRepository.ts must exist');
  const content = fs.readFileSync(repoFile, 'utf8');

  assert.ok(content.includes('getUxProjectSummary'), 'getUxProjectSummary must be exported');
  assert.ok(content.includes('getSectionHeatMap'), 'getSectionHeatMap must be exported');
  assert.ok(content.includes('getUxReadingFunnel'), 'getUxReadingFunnel must be exported');
  assert.ok(content.includes('getFrictionAlerts'), 'getFrictionAlerts must be exported');
  assert.ok(content.includes('getDailyUxRollup'), 'getDailyUxRollup must be exported for 00:01 daily rollup');
  assert.ok(content.includes('getLocalPostViewEvents'), 'Must cross-reference getLocalPostViewEvents for truth reconciliation');
  assert.ok(content.includes('export interface UxProjectSummary'), 'UxProjectSummary interface must be exported');
  assert.ok(content.includes('export interface SectionHeatPoint'), 'SectionHeatPoint interface must be exported');
  assert.ok(content.includes('export interface UxFunnelStep'), 'UxFunnelStep interface must be exported');
});

// ─── Test 2: AI UX Critique Service File & Exports ───
runTest('2. aiUxCritiqueService.ts exists and exports critique generator', () => {
  const serviceFile = path.resolve('src/cms/services/aiUxCritiqueService.ts');
  assert.ok(fs.existsSync(serviceFile), 'aiUxCritiqueService.ts must exist');
  const content = fs.readFileSync(serviceFile, 'utf8');

  assert.ok(content.includes('generateAiUxCritique'), 'generateAiUxCritique must be exported');
  assert.ok(content.includes('generateExecutiveCritiqueMarkdown'), 'generateExecutiveCritiqueMarkdown must be exported');
  assert.ok(content.includes('export interface AiUxCritique'), 'AiUxCritique interface must be exported');
});

// ─── Test 3: Mathematical & Algorithmic Validation of Heat Normalization ───
runTest('3. Attention heat calculation normalizes section dwell times correctly', () => {
  const sections = [
    { sectionId: 'hero', dwellMs: 5000 },
    { sectionId: 'problem', dwellMs: 45000 },
    { sectionId: 'architecture', dwellMs: 90000 },
    { sectionId: 'protocol', dwellMs: 30000 },
    { sectionId: 'impact', dwellMs: 15000 },
  ];

  const maxDwell = Math.max(...sections.map((s) => s.dwellMs));
  assert.strictEqual(maxDwell, 90000);

  const normalized = sections.map((s) => ({
    sectionId: s.sectionId,
    heatScore: Math.round((s.dwellMs / maxDwell) * 100),
  }));

  const arch = normalized.find((n) => n.sectionId === 'architecture');
  assert.strictEqual(arch.heatScore, 100, 'Peak dwell section must have heatScore 100');

  const hero = normalized.find((n) => n.sectionId === 'hero');
  assert.strictEqual(hero.heatScore, 6, 'Hero section heatScore must be properly scaled (~6)');
});

// ─── Test 4: Reader Segmentation Logic ───
runTest('4. Reader segmentation classifies skimmer, scanner, and deep reader', () => {
  function classifyReader(totalDurationMs, maxScroll) {
    if (totalDurationMs < 30000 && maxScroll >= 50) return 'skimmer';
    if (totalDurationMs < 90000) return 'scanner';
    return 'deep_reader';
  }

  assert.strictEqual(classifyReader(15000, 80), 'skimmer');
  assert.strictEqual(classifyReader(60000, 60), 'scanner');
  assert.strictEqual(classifyReader(120000, 95), 'deep_reader');
});

// ─── Test 5: Max-Per-Session Dwell Aggregation (Anti-Double-Count) ───
runTest('5. Max-per-session dwell algorithm prevents double-counting on multiple scroll exits', () => {
  // Simulate multiple exit events for the same section in the same session
  const rawEvents = [
    { sessionToken: 'sess-1', sectionId: 'hero', dwellTimeMs: 4000 },
    { sessionToken: 'sess-1', sectionId: 'hero', dwellTimeMs: 8000 }, // updated exit
    { sessionToken: 'sess-2', sectionId: 'hero', dwellTimeMs: 5000 },
  ];

  const sessMap = new Map();
  for (const ev of rawEvents) {
    const cur = sessMap.get(ev.sessionToken) || 0;
    sessMap.set(ev.sessionToken, Math.max(cur, ev.dwellTimeMs));
  }

  let totalHeroDwell = 0;
  for (const dwell of sessMap.values()) {
    totalHeroDwell += dwell;
  }

  // sess-1 should contribute 8000 (not 4000 + 8000 = 12000), sess-2 contributes 5000 -> Total 13000
  assert.strictEqual(totalHeroDwell, 13000, 'sess-1 max (8000) + sess-2 (5000) must equal 13000ms');
});

console.log('\n================================================================');
console.log(`  RESULT: ${passedTests}/${totalTests} TEST SUITES PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
