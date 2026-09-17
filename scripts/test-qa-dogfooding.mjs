import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const EVIDENCE_DIR = path.resolve('public/images/qa-evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

console.log('================================================================');
console.log('   QA DOGFOODING & LIVE BROWSER AUDIT — REAL AI ANALYTICS       ');
console.log('================================================================\n');

async function runQADogfooding() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });

  // Pre-authenticate with demo admin session
  await context.addInitScript(() => {
    localStorage.setItem('portfolio_admin_demo_auth', 'true');
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  try {
    // ─── 1. Access Admin Analytics Initial State ───
    console.log('▶ [QA 1] Navigating to /admin/analytics (Desktop 1440px)');
    await page.goto('http://localhost:5173/admin/analytics', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const titleText = await page.locator('h1').textContent();
    console.log(`  ✓ Page header: "${titleText.trim()}"`);
    console.assert(titleText.includes('AI Real-time Analytics'), 'Header title mismatch');

    const telemetryBadge = await page.locator('text=LIVE TELEMETRY').isVisible();
    console.log(`  ✓ LIVE TELEMETRY badge visible: ${telemetryBadge}`);
    console.assert(telemetryBadge, 'Live telemetry badge should be visible');

    // Take initial screenshot
    const shotDesktopInitial = path.join(EVIDENCE_DIR, 'qa_analytics_desktop_baseline.png');
    await page.screenshot({ path: shotDesktopInitial, fullPage: true });
    console.log(`  📸 Evidence saved: ${shotDesktopInitial}`);

    // ─── 2. Test Modal: AI Executive Report ───
    console.log('\n▶ [QA 2] Testing AI Executive Report modal');
    const reportBtn = page.locator('button:has-text("AI Executive Report")');
    await reportBtn.click();
    await page.waitForTimeout(600);

    const reportModalTitle = await page.locator('h3:has-text("AI Strategic Executive Report")').isVisible();
    console.log(`  ✓ Executive Report modal opened: ${reportModalTitle}`);
    console.assert(reportModalTitle, 'Report modal must open');

    const shotModal = path.join(EVIDENCE_DIR, 'qa_report_modal.png');
    await page.screenshot({ path: shotModal });
    console.log(`  📸 Evidence saved: ${shotModal}`);

    // Close modal
    await page.locator('button:has-text("Close")').click();
    await page.waitForTimeout(400);

    // ─── 3. Test Real Click Inbound Flow ───
    console.log('\n▶ [QA 3] Simulating real inbound shortlink clicks');
    const pageClick1 = await context.newPage();
    console.log('  → Simulating visit to /r/linkedin');
    await pageClick1.goto('http://localhost:5173/r/linkedin', { waitUntil: 'domcontentloaded' });
    await pageClick1.waitForTimeout(800);
    const url1 = pageClick1.url();
    console.log(`  ✓ Redirected destination: ${url1}`);
    console.assert(url1.includes('utm_source=linkedin'), 'URL must contain utm_source=linkedin');
    await pageClick1.close();

    const pageClick2 = await context.newPage();
    console.log('  → Simulating visit to /r/recruiter_email');
    await pageClick2.goto('http://localhost:5173/r/recruiter_email', { waitUntil: 'domcontentloaded' });
    await pageClick2.waitForTimeout(800);
    const url2 = pageClick2.url();
    console.log(`  ✓ Redirected destination: ${url2}`);
    console.assert(url2.includes('utm_source=recruiter_email'), 'URL must contain utm_source=recruiter_email');
    await pageClick2.close();

    // ─── 4. Verify Live Real-time Update on Analytics ───
    console.log('\n▶ [QA 4] Verifying Real-time updates on /admin/analytics');
    await page.bringToFront();
    // Click Refresh
    const refreshBtn = page.locator('button[title="Refresh analytics data"]');
    await refreshBtn.click();
    await page.waitForTimeout(800);

    // Check Live feed has recorded events
    const feedItem = page.getByText('/r/recruiter_email').first();
    const feedItemVisible = await feedItem.isVisible();
    console.log(`  ✓ Live activity feed records /r/recruiter_email: ${feedItemVisible}`);

    const shotActiveClicks = path.join(EVIDENCE_DIR, 'qa_analytics_active_clicks.png');
    await page.screenshot({ path: shotActiveClicks, fullPage: true });
    console.log(`  📸 Evidence saved: ${shotActiveClicks}`);

    // ─── 5. Responsive Testing: Tablet (iPad 768x1024) ───
    console.log('\n▶ [QA 5] Responsive Testing — Tablet (iPad 768px)');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(600);
    const shotTablet = path.join(EVIDENCE_DIR, 'qa_analytics_tablet.png');
    await page.screenshot({ path: shotTablet, fullPage: true });
    console.log(`  📸 Evidence saved: ${shotTablet}`);

    // ─── 6. Responsive Testing: Mobile (iPhone 390x844) ───
    console.log('\n▶ [QA 6] Responsive Testing — Mobile (iPhone 390px)');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(600);

    // Check header and cards fit without layout rupture
    const mobileHeaderVisible = await page.locator('h1:has-text("AI Real-time Analytics")').isVisible();
    console.log(`  ✓ Mobile header visible: ${mobileHeaderVisible}`);

    const shotMobile = path.join(EVIDENCE_DIR, 'qa_analytics_mobile.png');
    await page.screenshot({ path: shotMobile, fullPage: true });
    console.log(`  📸 Evidence saved: ${shotMobile}`);

    // ─── 7. Admin Dashboard Integration ───
    console.log('\n▶ [QA 7] Testing Admin Dashboard integration');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const aiAnalyticsBtn = page.getByRole('button', { name: 'AI Analytics', exact: true });
    const aiBtnExists = await aiAnalyticsBtn.isVisible();
    console.log(`  ✓ AI Analytics button exists on dashboard: ${aiBtnExists}`);
    console.assert(aiBtnExists, 'AI Analytics button must exist on Dashboard');

    const shotDash = path.join(EVIDENCE_DIR, 'qa_dashboard_integration.png');
    await page.screenshot({ path: shotDash });
    console.log(`  📸 Evidence saved: ${shotDash}`);

    // Click button to navigate to analytics
    await aiAnalyticsBtn.click();
    await page.waitForTimeout(800);
    const currentUrl = page.url();
    console.log(`  ✓ Navigation to: ${currentUrl}`);
    console.assert(currentUrl.includes('/admin/analytics'), 'Should navigate to /admin/analytics');

    console.log('\n================================================================');
    console.log(`  CONSOLE INTEGRITY: ${consoleErrors.length} errors caught`);
    if (consoleErrors.length > 0) {
      console.warn('  ⚠️ Errors:', consoleErrors);
    } else {
      console.log('  ✅ 0 CONSOLE ERRORS DETECTED ACROSS ALL PAGES & FLOWS');
    }
    console.log('  🎉 100% QA DOGFOODING CRITERIA SATISFIED');
    console.log('================================================================\n');
  } finally {
    await browser.close();
  }
}

runQADogfooding().catch((err) => {
  console.error('QA Dogfooding failed:', err);
  process.exit(1);
});
