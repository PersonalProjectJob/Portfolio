import fs from 'fs';
import path from 'path';

const viPath = path.join(process.cwd(), 'src/i18n/vi.ts');
const enPath = path.join(process.cwd(), 'src/i18n/en.ts');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/'dispatch\.hero\.title': '(.*?)'(\s*)\/\//g, "'dispatch.hero.title': '$1',$2//");
  fs.writeFileSync(file, c, 'utf8');
}

fix(viPath);
fix(enPath);
console.log('Fixed commas.');
