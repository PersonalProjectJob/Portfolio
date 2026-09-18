import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const EVIDENCE_DIR = path.resolve('public/images/qa-evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

console.log('================================================================');
console.log('       QA ENGINEER LIVE BROWSER DOGFOODING & AUDIT SUITE         ');
console.log('================================================================\n');

const BASE_URL = 'http://localhost:5180';

async function runQA() {
  const browser = await chromium.launch({ headless: true });

  let totalTC = 0;
  let passedTC = 0;

  function assert(condition, message) {
    totalTC++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      process.exit(1);
    } else {
      console.log(`  ✅ PASS: ${message}`);
      passedTC++;
    }
  }

  // ─── TC-01: 3D Kage Landing Page - Desktop Baseline (P0) ───
  console.log('▶ [TC-01] 3D Kage Landing Page - Desktop Baseline (1440x900)');
  const context1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page1 = await context1.newPage();
  const logs1 = [];
  page1.on('console', msg => {
    if (msg.type() === 'error') logs1.push(`[error] ${msg.text()}`);
    else if (msg.type() === 'warning') logs1.push(`[warn] ${msg.text()}`);
  });
  page1.on('pageerror', err => logs1.push(`[pageerror] ${err.message}`));

  await page1.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page1.waitForTimeout(1000);

  const fboErrors1 = logs1.filter(l => l.includes('GL_INVALID_FRAMEBUFFER_OPERATION') || l.includes('Attachment has zero size'));
  assert(fboErrors1.length === 0, `TC-01: Expected 0 WebGL FBO errors, found ${fboErrors1.length}`);
  assert(logs1.filter(l => l.startsWith('[error]') || l.startsWith('[pageerror]')).length === 0, 'TC-01: Zero console errors on 3D Kage desktop baseline');

  const shot3dDesktop = path.join(EVIDENCE_DIR, 'qa_3d_desktop_1440.png');
  await page1.screenshot({ path: shot3dDesktop });
  console.log(`  📸 Evidence captured: ${shot3dDesktop}`);

  // ─── TC-02: 3D Kage Chapter 02 - Horizontal Drag & Scroll (P0) ───
  console.log('\n▶ [TC-02] 3D Kage Chapter 02 - Horizontal Scroll & Drag');
  await page1.mouse.wheel(0, 1500);
  await page1.waitForTimeout(600);

  const shot3dCards = path.join(EVIDENCE_DIR, 'qa_3d_chapter2_interaction.png');
  await page1.screenshot({ path: shot3dCards });
  console.log(`  📸 Evidence captured: ${shot3dCards}`);

  const fboErrors2 = logs1.filter(l => l.includes('GL_INVALID_FRAMEBUFFER_OPERATION') || l.includes('Attachment has zero size'));
  assert(fboErrors2.length === 0, 'TC-02: Zero WebGL FBO errors during 3D scroll and card navigation');
  await context1.close();

  // ─── TC-03: Mobile Viewport Rendering (iPhone 14 Pro - 390x844) (P0) ───
  console.log('\n▶ [TC-03] Mobile Viewport Rendering (iPhone 14 Pro - 390x844 DPR 3)');
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3
  });
  const pageMobile = await contextMobile.newPage();
  const logsMobile = [];
  pageMobile.on('console', msg => {
    if (msg.type() === 'error') logsMobile.push(`[error] ${msg.text()}`);
  });
  pageMobile.on('pageerror', err => logsMobile.push(`[pageerror] ${err.message}`));

  await pageMobile.goto(BASE_URL, { waitUntil: 'networkidle' });
  await pageMobile.waitForTimeout(1000);

  const fboErrorsMobile = logsMobile.filter(l => l.includes('GL_INVALID_FRAMEBUFFER_OPERATION') || l.includes('Attachment has zero size'));
  assert(fboErrorsMobile.length === 0, 'TC-03: Zero WebGL FBO errors on mobile viewport');
  assert(logsMobile.length === 0, 'TC-03: Zero console errors on mobile viewport');

  const shotMobile = path.join(EVIDENCE_DIR, 'qa_3d_mobile_390.png');
  await pageMobile.screenshot({ path: shotMobile });
  console.log(`  📸 Evidence captured: ${shotMobile}`);
  await contextMobile.close();

  // ─── TC-04: Tablet Viewport Rendering (iPad Mini - 768x1024) (P1) ───
  console.log('\n▶ [TC-04] Tablet Viewport Rendering (iPad Mini - 768x1024 DPR 2)');
  const contextTablet = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });
  const pageTablet = await contextTablet.newPage();
  const logsTablet = [];
  pageTablet.on('console', msg => {
    if (msg.type() === 'error') logsTablet.push(`[error] ${msg.text()}`);
  });
  pageTablet.on('pageerror', err => logsTablet.push(`[pageerror] ${err.message}`));

  await pageTablet.goto(BASE_URL, { waitUntil: 'networkidle' });
  await pageTablet.waitForTimeout(1000);

  const fboErrorsTablet = logsTablet.filter(l => l.includes('GL_INVALID_FRAMEBUFFER_OPERATION') || l.includes('Attachment has zero size'));
  assert(fboErrorsTablet.length === 0, 'TC-04: Zero WebGL FBO errors on tablet viewport');

  const shotTablet = path.join(EVIDENCE_DIR, 'qa_3d_tablet_768.png');
  await pageTablet.screenshot({ path: shotTablet });
  console.log(`  📸 Evidence captured: ${shotTablet}`);
  await contextTablet.close();

  // ─── TC-05: 2D Hero Landing Page Mode Switch (P0) ───
  console.log('\n▶ [TC-05] 2D Mode Switch & Hero Landing Page (?view=2d)');
  const context2d = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page2d = await context2d.newPage();
  const logs2d = [];
  page2d.on('console', msg => {
    if (msg.type() === 'error') logs2d.push(`[error] ${msg.text()}`);
  });
  page2d.on('pageerror', err => logs2d.push(`[pageerror] ${err.message}`));

  await page2d.goto(`${BASE_URL}/?view=2d`, { waitUntil: 'networkidle' });
  await page2d.waitForTimeout(800);

  const heroHeadline = await page2d.locator('text=PRODUCT DESIGNER').first().isVisible();
  assert(heroHeadline, 'TC-05: 2D Hero layout renders branding and content properly');
  assert(logs2d.length === 0, 'TC-05: Zero console errors on 2D mode');

  const shot2d = path.join(EVIDENCE_DIR, 'qa_2d_desktop.png');
  await page2d.screenshot({ path: shot2d });
  console.log(`  📸 Evidence captured: ${shot2d}`);
  await context2d.close();

  // ─── TC-06: Case Study View & Telemetry Tracking (P0) ───
  console.log('\n▶ [TC-06] Case Study View & Telemetry Tracking (/project/agent-handoff)');
  const contextCase = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageCase = await contextCase.newPage();
  const logsCase = [];
  pageCase.on('console', msg => {
    if (msg.type() === 'error') logsCase.push(`[error] ${msg.text()}`);
  });
  pageCase.on('pageerror', err => logsCase.push(`[pageerror] ${err.message}`));

  await pageCase.goto(`${BASE_URL}/project/agent-handoff`, { waitUntil: 'networkidle' });
  await pageCase.waitForTimeout(1000);

  await pageCase.mouse.wheel(0, 1000);
  await pageCase.waitForTimeout(500);

  const shotCase = path.join(EVIDENCE_DIR, 'qa_case_study_agent_handoff.png');
  await pageCase.screenshot({ path: shotCase });
  console.log(`  📸 Evidence captured: ${shotCase}`);
  assert(logsCase.length === 0, 'TC-06: Zero console errors on Case Study view');
  await contextCase.close();

  // ─── TC-07: Admin Real Analytics & UX Lab (P1) ───
  console.log('\n▶ [TC-07] Admin Real Analytics & Dashboard Verification (/admin/analytics)');
  const contextAdmin = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await contextAdmin.addInitScript(() => {
    localStorage.setItem('portfolio_admin_demo_auth', 'true');
  });
  const pageAdmin = await contextAdmin.newPage();
  const logsAdmin = [];
  pageAdmin.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) logsAdmin.push(`[error] ${msg.text()}`);
  });
  pageAdmin.on('pageerror', err => logsAdmin.push(`[pageerror] ${err.message}`));

  await pageAdmin.goto(`${BASE_URL}/admin/analytics`, { waitUntil: 'networkidle' });
  await pageAdmin.waitForTimeout(1000);

  const shotAdmin = path.join(EVIDENCE_DIR, 'qa_admin_analytics.png');
  await pageAdmin.screenshot({ path: shotAdmin });
  console.log(`  📸 Evidence captured: ${shotAdmin}`);
  assert(logsAdmin.length === 0, 'TC-07: Zero console errors on Admin Analytics page');
  await contextAdmin.close();

  await browser.close();
  console.log(`\n================================================================`);
  console.log(`  🎉 ALL ${passedTC}/${totalTC} QA DOGFOODING TEST CASES PASSED (100% SUCCESS)`);
  console.log(`================================================================\n`);
}

runQA().catch(err => {
  console.error('QA Test execution error:', err);
  process.exit(1);
});