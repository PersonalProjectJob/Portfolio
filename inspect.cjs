const puppeteer = require("puppeteer");
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto("http://localhost:4173/project/cryptomap", { waitUntil: "networkidle0" });
  
  const footerInfo = await page.evaluate(() => {
    const navButtons = document.querySelector(".flex.flex-col.sm\\:flex-row.items-center.justify-between.gap-4.mt-10");
    const contactMe = document.querySelector(".mt-10.flex.flex-col.sm\\:flex-row.items-center.justify-center.gap-4.text-sm");
    
    return {
      navButtonsHTML: navButtons ? navButtons.innerHTML : null,
      navButtonsVisible: navButtons ? navButtons.offsetHeight > 0 : false,
      contactMeHTML: contactMe ? contactMe.innerHTML : null,
      contactMeVisible: contactMe ? contactMe.offsetHeight > 0 : false,
    };
  });
  
  console.log(JSON.stringify(footerInfo, null, 2));
  await browser.close();
})();
