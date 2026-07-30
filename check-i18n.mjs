import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/pages');
const componentsDir = path.join(process.cwd(), 'src/components');
const viPath = path.join(process.cwd(), 'src/i18n/vi.ts');
const enPath = path.join(process.cwd(), 'src/i18n/en.ts');

function readFiles(dir, fileList = []) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        readFiles(filePath, fileList);
      } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const allFiles = [...readFiles(pagesDir), ...readFiles(componentsDir)];

// We will use a regex to find t('key'), t("key"), t(`key`)
// Also we need to find literal quotes around {t...} e.g. "{t('key')}"

const tRegex = /t\(\s*['"`](.*?)['"`]\s*\)/g;
const literalQuotesRegex = /(["'])\{t\(['"`].*?['"`]\)\}\1/g;

const viContent = fs.readFileSync(viPath, 'utf-8');
const enContent = fs.readFileSync(enPath, 'utf-8');

const keysExtracted = new Set();
const filesWithLiteralQuotes = [];
const dynamicKeysFound = new Set();

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    const key = match[1];
    if (key.includes('${')) {
      dynamicKeysFound.add(key);
    } else {
      keysExtracted.add(key);
    }
  }
  
  if (literalQuotesRegex.test(content)) {
    filesWithLiteralQuotes.push(file);
  }
}

console.log('Dynamic keys found:', Array.from(dynamicKeysFound));
console.log('Files with literal quotes:', filesWithLiteralQuotes);

// To check if a key exists, we can just see if it's in the file content.
// Since it's a TS object, checking for `'key':` or `"key":` or just `key:`
function hasKey(content, key) {
  const regex = new RegExp(`['"\`]?${key.replace(/\./g, '\\.')}['"\`]?\\s*:`);
  return regex.test(content);
}

const missingInVi = [];
const missingInEn = [];

for (const key of keysExtracted) {
  if (!hasKey(viContent, key)) {
    missingInVi.push(key);
  }
  if (!hasKey(enContent, key)) {
    missingInEn.push(key);
  }
}

console.log('Missing in VI:', missingInVi);
console.log('Missing in EN:', missingInEn);
