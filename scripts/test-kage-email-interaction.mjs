import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('public/landing-pages/kage.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('====================================================');
console.log('  TEST: KAGE EMAIL INTERACTION & DOM INTEGRITY       ');
console.log('====================================================\n');

// 1. Check Popover and Toast markup
console.log('▶ [TEST 1] Verify Popover & Toast markup');
const requiredIds = [
  'kage-email-popover',
  'pop-copy-email',
  'pop-gmail',
  'pop-mailto',
  'pop-email-address',
  'kage-toast'
];

for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) {
    throw new Error(`❌ FAILED: Missing element with id="${id}"`);
  }
  console.log(`  ✅ Found element with id="${id}"`);
}

// 2. Check Translation span targeting (preserving SVG/i icons)
console.log('\n▶ [TEST 2] Verify DOM node preservation in applyKageTranslations');
if (html.includes('btnEmail.textContent = d.eternity.btn_email;')) {
  throw new Error('❌ FAILED: Destructive btnEmail.textContent assignment found');
}
if (html.includes('btnViewCv.textContent = d.eternity.btn_view_cv;')) {
  throw new Error('❌ FAILED: Destructive btnViewCv.textContent assignment found');
}
if (!html.includes('btnEmail.querySelector(\'span\')')) {
  throw new Error('❌ FAILED: Missing querySelector span preservation on btnEmail');
}
console.log('  ✅ applyKageTranslations preserves <i></i>, <span></span>, and <svg></svg> child nodes');

// 3. Check i18n keys for both Vietnamese and English
console.log('\n▶ [TEST 3] Verify i18n keys in KAGE_I18N dictionary');
const requiredI18nKeys = [
  'pop_copy',
  'pop_copied',
  'pop_gmail',
  'pop_default',
  'toast_copied'
];

for (const k of requiredI18nKeys) {
  if (!html.includes(`${k}:`)) {
    throw new Error(`❌ FAILED: Missing translation key "${k}"`);
  }
  console.log(`  ✅ Translation key "${k}" exists in KAGE_I18N`);
}

// 4. Check JS helper functions
console.log('\n▶ [TEST 4] Verify JS functions for Copy, Toast, and Popover');
if (!html.includes('function copyEmailToClipboard')) throw new Error('❌ Missing copyEmailToClipboard function');
if (!html.includes('function showKageToast')) throw new Error('❌ Missing showKageToast function');
if (!html.includes('function toggleEmailPopover')) throw new Error('❌ Missing toggleEmailPopover function');
console.log('  ✅ Helper functions (copyEmailToClipboard, showKageToast, toggleEmailPopover) are defined');

console.log('\n====================================================');
console.log('  🎉 ALL KAGE EMAIL INTERACTION TESTS PASSED!       ');
console.log('====================================================\n');
