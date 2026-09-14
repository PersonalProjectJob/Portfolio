/**
 * Automated Test Suite: 3D View Mode Default & Retired A/B Testing Matrix
 * Validates:
 * 1. 100% deterministic 3D default for new visitors (0% A/B split).
 * 2. Explicit 2D opt-in via query parameter (?view=2d, ?v=2d, ?mode=2d).
 * 3. Explicit 2D opt-in via route (/2d).
 * 4. Explicit 3D route overrides (/kage, /project/kage).
 * 5. Preference persistence via portfolio_view_mode.
 * 6. Legacy portfolio_ab_variant retirement & cleanup.
 */

// Simulated browser environment for Node.js test
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};

global.window = {
  location: {
    search: '',
    pathname: '/',
  },
  gtag: () => {},
};

import { getOrAssignVariant, setViewModePreference } from '../src/utils/abTesting.ts';

console.log('====================================================');
console.log('  TEST SUITE: 3D VIEW MODE DEFAULT & A/B RETIREMENT ');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  }
}

// TEST 1: Default public visitor gets 3D (Variant B)
console.log('▶ [TEST 1] New Visitor Default Experience');
storage.clear();
window.location.search = '';
window.location.pathname = '/';

const defaultVariant = getOrAssignVariant();
assert(defaultVariant === 'B', `Expected default variant 'B' (3D), got '${defaultVariant}'`);

// TEST 2: Deterministic test - 100 fresh visitors all receive 3D (0% A/B split)
console.log('\n▶ [TEST 2] Elimination of 50/50 Random Split (100 Samples)');
let variantACount = 0;
let variantBCount = 0;
for (let i = 0; i < 100; i++) {
  storage.clear();
  window.location.search = '';
  window.location.pathname = '/';
  const v = getOrAssignVariant();
  if (v === 'A') variantACount++;
  if (v === 'B') variantBCount++;
}
assert(variantBCount === 100 && variantACount === 0, `Expected 100 B / 0 A, got ${variantBCount} B / ${variantACount} A`);

// TEST 3: Query Parameter Overrides (?view=2d, ?v=2d, ?mode=2d, ?v=a)
console.log('\n▶ [TEST 3] Query Parameter Explicit Overrides');
const query2DVariants = ['?view=2d', '?v=2d', '?mode=2d', '?v=a', '?variant=2d'];
for (const q of query2DVariants) {
  storage.clear();
  window.location.search = q;
  window.location.pathname = '/';
  const v = getOrAssignVariant();
  assert(v === 'A', `Query '${q}' should activate 2D view ('A'), got '${v}'`);
}

const query3DVariants = ['?view=3d', '?v=3d', '?mode=3d', '?v=b'];
for (const q of query3DVariants) {
  storage.clear();
  window.location.search = q;
  window.location.pathname = '/';
  const v = getOrAssignVariant();
  assert(v === 'B', `Query '${q}' should activate 3D view ('B'), got '${v}'`);
}

// TEST 4: Direct Route Overrides (/2d, /kage, /project/kage)
console.log('\n▶ [TEST 4] Direct Route Explicit Overrides');
storage.clear();
window.location.search = '';
window.location.pathname = '/2d';
assert(getOrAssignVariant() === 'A', `Route '/2d' should activate 2D view ('A')`);

storage.clear();
window.location.search = '';
window.location.pathname = '/kage';
assert(getOrAssignVariant() === 'B', `Route '/kage' should activate 3D view ('B')`);

storage.clear();
window.location.search = '';
window.location.pathname = '/project/kage';
assert(getOrAssignVariant() === 'B', `Route '/project/kage' should activate 3D view ('B')`);

// TEST 5: Preference Persistence via setViewModePreference
console.log('\n▶ [TEST 5] Preference Persistence & Switching');
storage.clear();
window.location.search = '';
window.location.pathname = '/';

setViewModePreference('A');
assert(storage.get('portfolio_view_mode') === '2d', `Expected '2d' in storage`);
assert(getOrAssignVariant() === 'A', `Stored '2d' should return variant 'A'`);

setViewModePreference('B');
assert(storage.get('portfolio_view_mode') === '3d', `Expected '3d' in storage`);
assert(getOrAssignVariant() === 'B', `Stored '3d' should return variant 'B'`);

// TEST 6: Legacy A/B Key Retirement
console.log('\n▶ [TEST 6] Legacy A/B Key Cleanup & Zero Trap');
storage.clear();
storage.set('portfolio_ab_variant', 'A'); // Old visitor assigned 'A' in prior A/B experiment
window.location.search = '';
window.location.pathname = '/';

const resolvedPostLegacy = getOrAssignVariant();
assert(resolvedPostLegacy === 'B', `Legacy 'A' should NOT trap visitor in 2D, expected default 'B'`);
assert(!storage.has('portfolio_ab_variant'), `Legacy key 'portfolio_ab_variant' must be purged from storage`);

console.log('\n====================================================');
console.log(`  🎉 ALL ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
console.log('====================================================\n');
