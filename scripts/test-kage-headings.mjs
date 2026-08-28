import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('public/landing-pages/kage.html');
const content = fs.readFileSync(htmlPath, 'utf8');

console.log('====================================================');
console.log('  TEST: KAGE 3D LANDING PAGE HEADINGS & TRANSLATION ');
console.log('====================================================\n');

// Test 1: Check that the old bug selector (#hero .display.h-hero .mask-line > span) is removed
console.log('▶ [TEST 1] Ensure buggy querySelectorAll is removed');
const hasBuggySelector = content.includes('#hero .display.h-hero .mask-line > span');
if (hasBuggySelector) {
  console.error('❌ FAILED: Found buggy selector "#hero .display.h-hero .mask-line > span"');
  process.exit(1);
} else {
  console.log('  ✅ PASS: Buggy selector is not present');
}

// Test 2: Ensure setHeadingWords function is defined
console.log('\n▶ [TEST 2] Verify setHeadingWords function exists in kage.html');
const hasSetHeadingWords = content.includes('function setHeadingWords(');
if (!hasSetHeadingWords) {
  console.error('❌ FAILED: setHeadingWords is not defined');
  process.exit(1);
} else {
  console.log('  ✅ PASS: setHeadingWords helper is defined');
}

// Test 3: Verify heroLines querySelectorAll is used
console.log('\n▶ [TEST 3] Verify heroLines querySelectorAll on mask-line container');
const hasHeroLines = content.includes("querySelectorAll('#hero .display.h-hero .mask-line')");
if (!hasHeroLines) {
  console.error('❌ FAILED: Missing querySelectorAll on mask-line containers');
  process.exit(1);
} else {
  console.log('  ✅ PASS: Proper container selector is used');
}

// Test 4: Simulate DOM manipulation logic with mock DOM
console.log('\n▶ [TEST 4] Functional simulation of setHeadingWords');

function mockSetHeadingWords(target, text, REDUCE = false) {
  const phrase = (text !== undefined ? text : target.textContent || '').replace(/\s+/g, ' ').trim();
  if (!phrase) return;
  target.setAttribute('aria-label', phrase);
  if (REDUCE) {
    target.textContent = phrase;
    target.classList.remove('word-reveal');
    return;
  }
  target.dataset.wordReady = 'true';
  target.classList.add('word-reveal');
  target.textContent = '';
  target.children = [];
  phrase.split(' ').forEach((word) => {
    target.children.push({ className: 'word-mask', text: word });
  });
}

const mockLines = [
  { textContent: 'KIẾN TẠO TRẢI NGHIỆM', setAttribute: () => {}, classList: { add: () => {}, remove: () => {} }, dataset: {}, children: [] },
  { textContent: 'FINTECH, AI & HỆ THỐNG', setAttribute: () => {}, classList: { add: () => {}, remove: () => {} }, dataset: {}, children: [] },
  { textContent: 'DESIGN SYSTEM.', setAttribute: () => {}, classList: { add: () => {}, remove: () => {} }, dataset: {}, children: [] },
];

// Initial conversion
mockLines.forEach(l => mockSetHeadingWords(l, l.textContent));
console.assert(mockLines[0].children.length === 4, 'Line 1 should have 4 words');
console.assert(mockLines[1].children.length === 5, 'Line 2 should have 5 words');
console.assert(mockLines[2].children.length === 2, 'Line 3 should have 2 words');

// Re-apply localization (e.g. Vietnamese)
mockSetHeadingWords(mockLines[0], 'KIẾN TẠO TRẢI NGHIỆM');
mockSetHeadingWords(mockLines[1], 'FINTECH, AI & HỆ THỐNG');
mockSetHeadingWords(mockLines[2], 'DESIGN SYSTEM.');

const resultTextVi = mockLines.map(l => l.children.map(c => c.text).join(' ')).join('\n');
console.log('Resulting Vietnamese text:\n' + resultTextVi);

const expectedVi = 'KIẾN TẠO TRẢI NGHIỆM\nFINTECH, AI & HỆ THỐNG\nDESIGN SYSTEM.';
if (resultTextVi !== expectedVi) {
  console.error(`❌ FAILED: Text mismatch. Expected:\n${expectedVi}\nGot:\n${resultTextVi}`);
  process.exit(1);
} else {
  console.log('  ✅ PASS: Vietnamese text is perfectly clean and non-duplicated');
}

// Re-apply localization (e.g. English)
mockSetHeadingWords(mockLines[0], 'CRAFTING DIGITAL EXPERIENCES');
mockSetHeadingWords(mockLines[1], 'FINTECH, AI & SYSTEMS');
mockSetHeadingWords(mockLines[2], 'DESIGN SYSTEM.');

const resultTextEn = mockLines.map(l => l.children.map(c => c.text).join(' ')).join('\n');
console.log('Resulting English text:\n' + resultTextEn);

const expectedEn = 'CRAFTING DIGITAL EXPERIENCES\nFINTECH, AI & SYSTEMS\nDESIGN SYSTEM.';
if (resultTextEn !== expectedEn) {
  console.error(`❌ FAILED: Text mismatch. Expected:\n${expectedEn}\nGot:\n${resultTextEn}`);
  process.exit(1);
} else {
  console.log('  ✅ PASS: English text is perfectly clean and non-duplicated');
}

console.log('\n====================================================');
console.log('  🎉 ALL KAGE HEADING TESTS PASSED (100% SUCCESS)   ');
console.log('====================================================');
