import { chromium } from 'playwright';
import path from 'node:path';

console.log('================================================================');
console.log('   DEVEX REVIEW: WEBGL RUNTIME INTEGRITY & STRESS TEST          ');
console.log('================================================================\n');

async function runDevexAudit() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader']
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

  // ─── Scenario 1: Standard Desktop Load (1440x900) ───
  console.log('▶ [SCENARIO 1] Direct Load at Desktop 1440x900');
  const context1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page1 = await context1.newPage();
  const logs1 = [];
  page1.on('console', msg => logs1.push(`[${msg.type()}] ${msg.text()}`));
  page1.on('pageerror', err => logs1.push(`[pageerror] ${err.message}`));

  const targetUrl = 'file:///' + path.resolve('public/landing-pages/kage.html').replace(/\\/g, '/');
  await page1.goto(targetUrl, { waitUntil: 'load' });
  await page1.waitForTimeout(1500);

  const fboErrors1 = logs1.filter(l => l.includes('GL_INVALID_FRAMEBUFFER_OPERATION') || l.includes('Attachment has zero size'));
  assert(fboErrors1.length === 0, `Scenario 1: Expected 0 WebGL FBO errors, got ${fboErrors1.length}`);
  await context1.close();

  // ─── Scenario 2: Mobile Viewport Load (390x844 - iPhone 14) ───
  console.log('\n▶ [SCENARIO 2] Direct Load at Mobile Viewport 390x844');
  const context2 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 3 });
  const page2 = await context2.newPage();
  const logs2 = [];
  page2.on('console', msg => logs2.push(`[${msg.type()}] ${msg.text()}`));
  page2.on('pageerror', err => logs2.push(`[pageerror] ${err.message}`));

  await page2.goto(targetUrl, { waitUntil: 'load' });
  await page2.waitForTimeout(1500);

  const fboErrors2 = logs2.filter(l => l.includes('GL_INVALID_FRAMEBUFFER_OPERATION') || l.includes('Attachment has zero size'));
  assert(fboErrors2.length === 0, `Scenario 2: Expected 0 WebGL FBO errors on mobile, got ${fboErrors2.length}`);
  await context2.close();

  // ─── Scenario 3: Extreme Stress - Zero-Size Viewport & Rapid Resize ───
  console.log('\n▶ [SCENARIO 3] Zero-Dimension Initial Iframe & Extreme Resize Fluctuations');
  const context3 = await browser.newContext({ viewport: { width: 800, height: 600 } });
  const page3 = await context3.newPage();
  const logs3 = [];
  page3.on('console', msg => logs3.push(`[${msg.type()}] ${msg.text()}`));
  page3.on('pageerror', err => logs3.push(`[pageerror] ${err.message}`));

  // Host page simulating dynamic iframe injection with zero initial size
  const htmlHost = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;">
        <div id="wrapper" style="width:0px;height:0px;overflow:hidden;">
          <iframe id="kageFrame" src="${targetUrl}" style="width:100%;height:100%;border:none;"></iframe>
        </div>
      </body>
    </html>
  `;
  await page3.setContent(htmlHost);
  await page3.waitForTimeout(1000);

  // Resize wrapper from 0px -> 1440px
  await page3.evaluate(() => {
    const wrap = document.getElementById('wrapper');
    wrap.style.width = '1440px';
    wrap.style.height = '900px';
    window.dispatchEvent(new Event('resize'));
  });
  await page3.waitForTimeout(1500);

  // Collapse wrapper back to 0px
  await page3.evaluate(() => {
    const wrap = document.getElementById('wrapper');
    wrap.style.width = '0px';
    wrap.style.height = '0px';
    window.dispatchEvent(new Event('resize'));
  });
  await page3.waitForTimeout(500);

  // Re-expand wrapper
  await page3.evaluate(() => {
    const wrap = document.getElementById('wrapper');
    wrap.style.width = '1920px';
    wrap.style.height = '1080px';
    window.dispatchEvent(new Event('resize'));
  });
  await page3.waitForTimeout(1500);

  const fboErrors3 = logs3.filter(l => l.includes('GL_INVALID_FRAMEBUFFER_OPERATION') || l.includes('Attachment has zero size'));
  assert(fboErrors3.length === 0, `Scenario 3: Expected 0 WebGL FBO errors under extreme resizing/zero-size collapse, got ${fboErrors3.length}`);
  await context3.close();

  await browser.close();
  console.log(`\n🎉 DEVEX AUDIT VERDICT: PASS (${passedTests}/${totalTests} SCENARIOS 100% CLEAN, ZERO WEBGL ERRORS)`);
}

runDevexAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});