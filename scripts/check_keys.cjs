const fs = require('fs');
const path = require('path');

function extractKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match t('key') or t("key") or t(`key`)
  const regex = /t\(['"`]([^'"`]+)['"`]\)/g;
  const keys = new Set();
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

const viContent = fs.readFileSync('src/i18n/vi.ts', 'utf8');
const enContent = fs.readFileSync('src/i18n/en.ts', 'utf8');

const pages = [
  'src/pages/ProjectDispatch.tsx',
  'src/pages/ProjectCryptomap.tsx',
  'src/pages/ProjectAgentRules.tsx',
  'src/pages/ProjectNexora.tsx',
  'src/pages/ProjectGenie.tsx',
  'src/pages/ProjectNailhub.tsx'
];

let totalMissing = 0;

pages.forEach(page => {
  if (fs.existsSync(page)) {
    const keys = extractKeys(page);
    const missingVi = [];
    const missingEn = [];
    
    for (const key of keys) {
      if (!viContent.includes(`'${key}':`) && !viContent.includes(`"${key}":`)) {
        missingVi.push(key);
      }
      if (!enContent.includes(`'${key}':`) && !enContent.includes(`"${key}":`)) {
        missingEn.push(key);
      }
    }
    
    if (missingVi.length > 0 || missingEn.length > 0) {
      console.log(`\n=== Missing keys in ${page} ===`);
      if (missingVi.length > 0) console.log('Missing in VI:', missingVi);
      if (missingEn.length > 0) console.log('Missing in EN:', missingEn);
      totalMissing += missingVi.length;
    }
  }
});

console.log(`\nTotal missing keys: ${totalMissing}`);
