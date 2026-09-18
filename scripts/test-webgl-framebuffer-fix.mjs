import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('  TEST SUITE: WEBGL ZERO-SIZE FRAMEBUFFER FIX        ');
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

// 1. Audit public/landing-pages/kage.html
console.log('▶ [TEST 1] Auditing public/landing-pages/kage.html');
const kageHtmlPath = path.join(rootDir, 'public/landing-pages/kage.html');
assert(fs.existsSync(kageHtmlPath), 'kage.html must exist');
const kageHtml = fs.readFileSync(kageHtmlPath, 'utf8');

assert(
  kageHtml.includes('const vpW = () => Math.max(2, document.documentElement.clientWidth'),
  'vpW must clamp minimum width to 2px'
);
assert(
  kageHtml.includes('const vpH = () => Math.max(2, document.documentElement.clientHeight'),
  'vpH must clamp minimum height to 2px'
);
assert(
  kageHtml.includes('renderer.setSize(Math.max(2, vpW()), Math.max(2, vpH()), true)'),
  'initGL must clamp renderer size to >= 2px'
);
assert(
  kageHtml.includes('const w = Math.max(2, renderer.domElement.width || vpW())'),
  'initPost must clamp w to >= 2px'
);
assert(
  kageHtml.includes('h = Math.max(2, renderer.domElement.height || vpH())'),
  'initPost must clamp h to >= 2px'
);
assert(
  kageHtml.includes('if (target && (target.width <= 0 || target.height <= 0)) return;'),
  'pass() must reject incomplete render targets with zero or negative dimensions'
);
assert(
  kageHtml.includes('if (!POST.scene || POST.scene.width <= 0 || POST.scene.height <= 0) return;'),
  'renderPost() must guard against zero-sized POST.scene'
);
assert(
  kageHtml.includes('if (w <= 0 || h <= 0) return;'),
  'setRegion() must guard against zero w or h'
);
assert(
  kageHtml.includes('if (rt.width <= 0 || rt.height <= 0) return;'),
  'setRegion() and clearRegion() must guard against incomplete render target'
);
assert(
  kageHtml.includes('r.width < 4 || r.height < 4'),
  'renderCards() must skip elements with width < 4 or height < 4'
);
assert(
  kageHtml.includes('if (!buf || buf.width <= 0 || buf.height <= 0) continue;'),
  'renderCards() must skip cards whose cardBuffer has zero size'
);
assert(
  kageHtml.includes('const pw = Math.max(2, renderer.domElement.width), ph = Math.max(2, renderer.domElement.height);'),
  'resize() must clamp pw and ph to >= 2px'
);
assert(
  kageHtml.includes('if (!renderer || renderer.domElement.width <= 0 || renderer.domElement.height <= 0) return;'),
  'render() must skip drawing when canvas size is 0'
);
assert(
  kageHtml.includes('if (WANT_POST && POST.scene && (POST.scene.width <= 0 || POST.scene.height <= 0)) return;'),
  'render() must skip drawing when POST.scene has zero size'
);

// 2. Audit src/components/kage/KageLandingPage.tsx
console.log('\n▶ [TEST 2] Auditing src/components/kage/KageLandingPage.tsx');
const kageReactPath = path.join(rootDir, 'src/components/kage/KageLandingPage.tsx');
assert(fs.existsSync(kageReactPath), 'KageLandingPage.tsx must exist');
const kageReact = fs.readFileSync(kageReactPath, 'utf8');

assert(
  kageReact.includes("minWidth: '320px'") && kageReact.includes("minHeight: '480px'"),
  'KageLandingPage container must specify minWidth and minHeight'
);

// 3. Audit src/components/kage/kageEngine.ts
console.log('\n▶ [TEST 3] Auditing src/components/kage/kageEngine.ts');
const kageEnginePath = path.join(rootDir, 'src/components/kage/kageEngine.ts');
assert(fs.existsSync(kageEnginePath), 'kageEngine.ts must exist');
const kageEngine = fs.readFileSync(kageEnginePath, 'utf8');

assert(
  kageEngine.includes('const initialW = Math.max(2,'),
  'kageEngine rtScene initial width must be clamped to >= 2'
);
assert(
  kageEngine.includes('const initialH = Math.max(2,'),
  'kageEngine rtScene initial height must be clamped to >= 2'
);
assert(
  kageEngine.includes('if (canvas.clientWidth <= 0 || canvas.clientHeight <= 0) {'),
  'kageEngine render() must skip frames if canvas dimensions are zero'
);
assert(
  kageEngine.includes('rtScene.setSize(Math.max(2, Math.round(w * curDpr)), Math.max(2, Math.round(h * curDpr)));'),
  'kageEngine onResize() must clamp rtScene size to >= 2'
);

console.log(`\n🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);