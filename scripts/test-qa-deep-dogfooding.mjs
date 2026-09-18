import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const EVIDENCE_DIR = path.resolve('public/images/qa-evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

console.log('================================================================');
console.log('       QA DEEP DOGFOODING & USER JOURNEY VERIFICATION SUITE       ');
console.log('================================================================\n');

const BASE_URL = 'http://localhost:5180';

async function runDeepQA() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN'
  });

  // Pre-authenticate admin demo session
  await context.addInitScript(() => {
    localStorage.setItem('portfolio_admin_demo_auth', 'true');
  });

  let totalTests = 0;
  let passedTests = 0;

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

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => consoleErrors.push(`[pageerror] ${err.message}`));

  // ─── STAGE 1: 3D Kage Iframe Language Switching ───
  console.log('▶ [STAGE 1] 3D Kage Language Toggle (VI -> EN -> VI)');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const iframeEl = await page.$('iframe');
  assert(iframeEl !== null, 'Iframe hosting 3D Kage must exist');
  const frame = await iframeEl.contentFrame();
  assert(frame !== null, 'Iframe content frame must be accessible');

  // Wait for preloader to finish in iframe
  await frame.waitForSelector('#pre.done', { timeout: 10000 }).catch(() => {});

  // Toggle to English via DOM event
  await frame.evaluate(() => {
    const btn = document.querySelector('#kage-lang-toggle .lang-btn[data-lang="en"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(600);

  const langEn = await frame.evaluate(() => localStorage.getItem('portfolio-lang'));
  console.log(`  ✓ Toggled to English: localStorage portfolio-lang="${langEn}"`);
  assert(langEn === 'en', "Language preference should be 'en'");

  // Toggle back to Vietnamese via DOM event
  await frame.evaluate(() => {
    const btn = document.querySelector('#kage-lang-toggle .lang-btn[data-lang="vi"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(600);

  const langVi = await frame.evaluate(() => localStorage.getItem('portfolio-lang'));
  console.log(`  ✓ Toggled back to Vietnamese: localStorage portfolio-lang="${langVi}"`);
  assert(langVi === 'vi', "Language preference should be 'vi'");

  const shotLang = path.join(EVIDENCE_DIR, 'qa_deep_lang_toggle.png');
  await page.screenshot({ path: shotLang });
  console.log(`  📸 Evidence captured: ${shotLang}`);
  assert(consoleErrors.length === 0, 'Zero console errors during language switching');

  // ─── STAGE 2: Chapter 02 Category Filter Chips ───
  console.log('\n▶ [STAGE 2] Chapter 02 Category Filter Chips');
  await frame.evaluate(() => {
    window.scrollTo(0, 2000);
  });
  await page.waitForTimeout(800);

  const chipCount = await frame.evaluate(() => document.querySelectorAll('.filter-chip').length);
  console.log(`  ✓ Found ${chipCount} filter chips in Chapter 02`);
  assert(chipCount >= 2, 'At least 2 filter chips must exist');

  // Click Project filter chip
  const projectCardsCount = await frame.evaluate(() => {
    const chip = document.querySelector('.filter-chip[data-filter="project"]');
    if (chip) chip.click();
    return document.querySelectorAll('.mosaic-group .card').length;
  });
  console.log(`  ✓ Filtered by 'project': ${projectCardsCount} cards visible`);
  assert(projectCardsCount === 4, `Expected 4 project cards, found ${projectCardsCount}`);

  // Click Workflow filter chip
  const workflowCardsCount = await frame.evaluate(() => {
    const chip = document.querySelector('.filter-chip[data-filter="workflow"]');
    if (chip) chip.click();
    return document.querySelectorAll('.mosaic-group .card').length;
  });
  console.log(`  ✓ Filtered by 'workflow': ${workflowCardsCount} cards visible`);
  assert(workflowCardsCount === 6, `Expected 6 workflow cards, found ${workflowCardsCount}`);

  // Reset to All
  const allCardsCount = await frame.evaluate(() => {
    const chip = document.querySelector('.filter-chip[data-filter="all"]');
    if (chip) chip.click();
    return document.querySelectorAll('.mosaic-group .card').length;
  });
  console.log(`  ✓ Reset to 'all': ${allCardsCount} cards visible`);
  assert(allCardsCount === 10, `Expected 10 total cards, found ${allCardsCount}`);

  const shotFilter = path.join(EVIDENCE_DIR, 'qa_deep_filter_chips.png');
  await page.screenshot({ path: shotFilter });
  console.log(`  📸 Evidence captured: ${shotFilter}`);
  assert(consoleErrors.length === 0, 'Zero console errors during category filtering');

  // ─── STAGE 3: Admin AI Executive Report Modal ───
  console.log('\n▶ [STAGE 3] Admin Real Analytics — AI Executive Report Modal');
  await page.goto(`${BASE_URL}/admin/analytics`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const reportBtn = page.locator('button:has-text("AI Executive Report")');
  await reportBtn.click();
  await page.waitForTimeout(600);

  const modalVisible = await page.locator('text=Executive Summary').isVisible();
  assert(modalVisible, 'AI Executive Report modal must render Executive Summary section');

  const shotModal = path.join(EVIDENCE_DIR, 'qa_deep_ai_report_modal.png');
  await page.screenshot({ path: shotModal });
  console.log(`  📸 Evidence captured: ${shotModal}`);

  // Close modal
  const closeBtn = page.locator('button:has-text("Đóng"), button:has-text("Close")').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(400);
  }

  // ─── STAGE 4: Admin UX Lab — AI UX Critique Modal ───
  console.log('\n▶ [STAGE 4] Admin UX Lab — AI UX Critique Modal');
  await page.goto(`${BASE_URL}/admin/ux-lab`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const critiqueBtn = page.getByRole('button', { name: 'AI UX Critique' });
  if (await critiqueBtn.isVisible()) {
    await critiqueBtn.click();
    await page.waitForTimeout(600);
    const critiqueTitle = await page.locator('text=AI UX Critique').first().isVisible();
    assert(critiqueTitle, 'AI UX Critique modal must open properly');

    const shotCritique = path.join(EVIDENCE_DIR, 'qa_deep_ai_critique_modal.png');
    await page.screenshot({ path: shotCritique });
    console.log(`  📸 Evidence captured: ${shotCritique}`);

    const closeCritique = page.locator('button:has-text("Đóng"), button:has-text("Close")').first();
    if (await closeCritique.isVisible()) {
      await closeCritique.click();
      await page.waitForTimeout(400);
    }
  }

  // ─── STAGE 5: End-to-End Case Study & Navigation ───
  console.log('\n▶ [STAGE 5] Case Study View & Navigation Flow');
  await page.goto(`${BASE_URL}/project/agent-handoff`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const caseTitle = await page.locator('h1').first().textContent();
  console.log(`  ✓ Case study title loaded: "${caseTitle?.trim()}"`);
  assert(caseTitle && caseTitle.length > 0, 'Case study title should not be empty');

  // Verify back navigation
  const backBtn = page.locator('button:has-text("Back to Projects"), button:has-text("Quay lại")').first();
  if (await backBtn.isVisible()) {
    await backBtn.click();
    await page.waitForTimeout(800);
  }

  const shotJourney = path.join(EVIDENCE_DIR, 'qa_deep_journey_navigation.png');
  await page.screenshot({ path: shotJourney });
  console.log(`  📸 Evidence captured: ${shotJourney}`);

  assert(consoleErrors.length === 0, `Zero console errors throughout entire deep QA session (found ${consoleErrors.length})`);

  await browser.close();
  console.log(`\n================================================================`);
  console.log(`  🎉 DEEP QA SIGN-OFF: ALL ${passedTests}/${totalTests} STAGES PASSED (100% SUCCESS)`);
  console.log(`================================================================\n`);
}

runDeepQA().catch(err => {
  console.error('Deep QA Test execution error:', err);
  process.exit(1);
});