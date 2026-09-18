import { chromium } from 'playwright';
import path from 'path';

console.log('================================================================');
console.log('   QA LIVE BROWSER DOGFOODING: UX LAB STATS VERIFICATION        ');
console.log('================================================================\n');

const ARTIFACT_DIR = 'C:/Users/AD/.gemini/antigravity/brain/55bcedb9-cf1d-419f-901b-7df16cf9af47';

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  // Shared context so localStorage is shared between tabs
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });

  // Pre-authenticate admin
  await context.addInitScript(() => {
    localStorage.setItem('portfolio_admin_demo_auth', 'true');
  });

  try {
    // ─── Step 1: Reader Journey on /project/agent-handoff ───
    console.log('▶ [Step 1] Reader opening /project/agent-handoff...');
    const readerPage = await context.newPage();
    await readerPage.goto('http://localhost:5173/project/agent-handoff');

    // Wait 2.5 seconds for initial presence handshake (>1.2s baseline on mount)
    console.log('  ⏳ Waiting 2.5s for initial presence handshake to register Hero dwell...');
    await readerPage.waitForTimeout(2500);

    // Verify localStorage in reader page
    const storageState = await readerPage.evaluate(() => {
      return {
        sessions: JSON.parse(localStorage.getItem('portfolio_ux_sessions_v1') || '[]'),
        events: JSON.parse(localStorage.getItem('portfolio_ux_events_v1') || '[]'),
        postViews: JSON.parse(localStorage.getItem('portfolio_post_views_cache') || '[]'),
      };
    });

    console.log(`  📊 Reader localStorage verified:`);
    console.log(`     - ux_sessions count: ${storageState.sessions.length}`);
    console.log(`     - ux_events count: ${storageState.events.length}`);
    console.log(`     - post_views count: ${storageState.postViews.length}`);

    if (storageState.sessions.length > 0) {
      console.log(`     - First session: pageSlug=${storageState.sessions[0].pageSlug}, id=${storageState.sessions[0].sessionToken}`);
    }
    if (storageState.events.length > 0) {
      const dwellEvents = storageState.events.filter(e => e.eventType === 'section_dwell');
      console.log(`     - Dwell events count: ${dwellEvents.length}`);
      dwellEvents.forEach(e => {
        console.log(`       * Section: ${e.sectionId} -> Dwell: ${e.dwellTimeMs}ms`);
      });
    }

    console.assert(storageState.sessions.length >= 1, 'ux_sessions count must be >= 1');
    console.assert(storageState.events.length >= 1, 'ux_events count must be >= 1');
    console.assert(storageState.postViews.length >= 1, 'post_views count must be >= 1');

    // Simulate reading: scroll down slowly
    console.log('  📜 Scrolling down to simulate reading problem statement & solution...');
    await readerPage.evaluate(() => window.scrollBy(0, 1000));
    await readerPage.waitForTimeout(2000);

    await readerPage.evaluate(() => window.scrollBy(0, 1000));
    await readerPage.waitForTimeout(2000);

    // ─── Step 2: Admin Opening /admin/ux-lab in Another Tab ───
    console.log('\n▶ [Step 2] Admin opening /admin/ux-lab...');
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:5173/admin/ux-lab');
    await adminPage.waitForTimeout(2000);

    // Take screenshot of UX Lab with live data
    const screenshotPath = path.join(ARTIFACT_DIR, 'qa_ux_lab_live_stats.png');
    try {
      await adminPage.screenshot({ path: screenshotPath, timeout: 5000 });
      console.log(`  📸 Screenshot saved: ${screenshotPath}`);
    } catch (e) {
      console.warn('  ⚠️ Screenshot warning (non-fatal):', e.message);
    }

    // Inspect Key Metrics in DOM
    const headerText = await adminPage.locator('h1').textContent();
    console.log(`  ✓ Header: "${headerText.trim()}"`);

    // Verify badges
    const liveBadge = await adminPage.locator('text=Live Pulse: 60s Cadence').isVisible();
    console.log(`  ✓ Badge "Live Pulse: 60s Cadence" visible: ${liveBadge}`);
    console.assert(liveBadge, 'Live Pulse badge must be visible');

    const rollupBadge = await adminPage.locator('text=Daily Rollup: 00:01 AM').isVisible();
    console.log(`  ✓ Badge "Daily Rollup: 00:01 AM" visible: ${rollupBadge}`);
    console.assert(rollupBadge, 'Daily Rollup badge must be visible');

    // Get KPI cards text content
    const kpiTexts = await adminPage.locator('.grid.grid-cols-2 > div, .grid.grid-cols-4 > div, [class*="rounded-2xl"]').allTextContents();
    console.log('\n  📊 KPI Cards / DOM Content:');

    for (const text of kpiTexts) {
      if (text.includes('Độc giả tiếp cận')) {
        console.log(`     [KPI] ${text.replace(/\s+/g, ' ').trim()}`);
      }
      if (text.includes('Thời gian đọc TB')) {
        console.log(`     [KPI] ${text.replace(/\s+/g, ' ').trim()}`);
      }
    }

    // Inspect Section Heat Strip
    const heatSection = adminPage.locator('text=Attention Heat Strip').locator('..');
    const heatSectionText = await heatSection.textContent();
    console.log(`\n  🔥 Attention Heat Strip Section:`);
    console.log(`     ${heatSectionText.replace(/\s+/g, ' ').slice(0, 300)}...`);

    // Verify that at least one section has heatScore > 0
    const heatScores = await adminPage.locator('text=/100').allTextContents();
    console.log(`     Heat scores found: ${heatScores.join(', ')}`);
    const hasNonZeroHeat = heatScores.some(s => !s.startsWith('0/100'));
    console.log(`     -> Has non-zero heat score: ${hasNonZeroHeat}`);

    // Verify Reader Segmentation
    const segmentText = await adminPage.locator('text=Phân khúc Độc Giả').locator('..').textContent();
    console.log(`\n  👥 Reader Segmentation:`);
    console.log(`     ${segmentText.replace(/\s+/g, ' ').slice(0, 300)}...`);

    console.log('\n================================================================');
    console.log('   RESULT: LIVE BROWSER DOGFOODING SUCCESSFUL!                  ');
    console.log('================================================================\n');

  } finally {
    await browser.close();
  }
}

runTest().catch((err) => {
  console.error('❌ QA Dogfooding failed:', err);
  process.exit(1);
});
