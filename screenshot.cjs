const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto("http://localhost:4173/project/cryptomap", { waitUntil: "networkidle0" });
  await page.screenshot({ path: "cryptomap_screenshot.png", fullPage: true });
  await browser.close();
})();
