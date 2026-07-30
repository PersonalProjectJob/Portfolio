const fs = require('fs');
let c = fs.readFileSync('src/i18n/en.ts', 'utf8');
c = c.replace(/'nailhub\.nextProject': 'Next Project'\s*\n\s*\/\//, "'nailhub.nextProject': 'Next Project',\n  //");
fs.writeFileSync('src/i18n/en.ts', c, 'utf8');
