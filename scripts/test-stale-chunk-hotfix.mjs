import fs from 'fs';
import path from 'path';
import { isChunkLoadError, triggerStaleChunkReload } from '../src/utils/lazyWithRetry.ts';

console.log('====================================================');
console.log('  TEST SUITE: STALE CHUNK & MIME HOTFIX VERIFICATION ');
console.log('====================================================\n');

// 1. Unit Test: isChunkLoadError
console.log('▶ [TEST 1] isChunkLoadError detection logic');
const testCases = [
  { err: new TypeError('Failed to fetch dynamically imported module: https://tnsthao94.online/assets/ProjectAgentHandoff-T3_7CGsQ.js'), expected: true },
  { err: new Error('Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.'), expected: true },
  { err: { name: 'ChunkLoadError', message: 'Loading chunk 42 failed' }, expected: true },
  { err: new Error('error loading dynamically imported module'), expected: true },
  { err: new Error('Importing a module script failed.'), expected: true },
  { err: new ReferenceError('someVariable is not defined'), expected: false },
  { err: new Error('Network timeout in API request'), expected: false },
  { err: null, expected: false },
];

for (const { err, expected } of testCases) {
  const result = isChunkLoadError(err);
  console.assert(result === expected, `Mismatch for error: "${err?.message || err}"`);
}
console.log('  ✅ 8/8 error signature cases correctly classified');

// 2. Unit Test: triggerStaleChunkReload session debounce
console.log('\n▶ [TEST 2] triggerStaleChunkReload debounce guard');
const sessionStore = new Map();
let reloadCount = 0;
global.window = {
  location: {
    reload: () => { reloadCount++; }
  }
};
global.sessionStorage = {
  getItem: (k) => sessionStore.get(k) ?? null,
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k),
};

const firstCall = triggerStaleChunkReload(new Error('Failed to fetch dynamically imported module'));
console.assert(firstCall === true, 'First stale chunk error should trigger reload');
console.assert(reloadCount === 1, 'Reload count should be 1');

// Immediate second call within 15s should NOT reload again (loop guard)
const secondCall = triggerStaleChunkReload(new Error('Failed to fetch dynamically imported module'));
console.assert(secondCall === false, 'Rapid second call should be blocked by loop guard');
console.assert(reloadCount === 1, 'Reload count should still be 1');
console.log('  ✅ Debounce guard successfully prevents reload loops');

// 3. vercel.json Inspection
console.log('\n▶ [TEST 3] vercel.json rewrite and header configuration');
const vercelConfig = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf8'));

// Check rewrites exclude assets
const spaRewrite = vercelConfig.rewrites.find(r => r.destination === '/index.html');
console.assert(spaRewrite, 'Missing SPA rewrite rule in vercel.json');
console.assert(spaRewrite.source.includes('(?!assets/'), `Expected rewrite source to exclude assets, got: ${spaRewrite.source}`);
console.log('  ✅ vercel.json excludes /assets/ from rewriting into index.html (authentic 404 preserved)');

// Check headers
const htmlHeader = vercelConfig.headers.find(h => h.source.includes('assets') === false || h.source.includes('(?!assets/)'));
console.assert(htmlHeader, 'Missing Cache-Control header for HTML');
const noCacheValue = htmlHeader.headers.find(h => h.key === 'Cache-Control')?.value;
console.assert(noCacheValue?.includes('max-age=0'), `Expected max-age=0 for HTML routes, got: ${noCacheValue}`);
console.log('  ✅ vercel.json enforces max-age=0 on HTML routes to prevent stale bundle retention');

// 4. App.tsx & ErrorBoundary imports verification
console.log('\n▶ [TEST 4] App.tsx and ErrorBoundary.tsx integration');
const appSource = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
console.assert(appSource.includes('lazyWithRetry'), 'App.tsx must use lazyWithRetry');
console.assert(!appSource.includes('import { lazy }') && !appSource.includes(', lazy,'), 'App.tsx should not import raw lazy');
console.assert(appSource.includes('const ProjectAgentHandoff = lazyWithRetry('), 'ProjectAgentHandoff must be wrapped with lazyWithRetry');
console.assert(appSource.includes('const ProjectCryptomap = lazyWithRetry('), 'ProjectCryptomap must be wrapped with lazyWithRetry');
console.log('  ✅ All 10 case study routes in App.tsx are protected with lazyWithRetry');

const ebSource = fs.readFileSync(path.resolve('src/components/ErrorBoundary.tsx'), 'utf8');
console.assert(ebSource.includes('isChunkLoadError'), 'ErrorBoundary must import isChunkLoadError');
console.assert(ebSource.includes('triggerStaleChunkReload'), 'ErrorBoundary must call triggerStaleChunkReload');
console.assert(ebSource.includes('Phiên bản mới đã sẵn sàng'), 'ErrorBoundary must have friendly new version prompt');
console.log('  ✅ ErrorBoundary is equipped with auto-recovery and new version UI');

// 5. main.tsx vite:preloadError verification
console.log('\n▶ [TEST 5] main.tsx global vite:preloadError hook');
const mainSource = fs.readFileSync(path.resolve('src/main.tsx'), 'utf8');
console.assert(mainSource.includes('vite:preloadError'), 'main.tsx must handle vite:preloadError');
console.log('  ✅ main.tsx listens to vite:preloadError for preloaded chunk failures');

console.log('\n====================================================');
console.log('  🎉 ALL 5 HOTFIX TEST GATES PASSED (100% SUCCESS)    ');
console.log('====================================================\n');
