import fs from 'node:fs';
import path from 'node:path';

const BRAIN_DIR = 'C:/Users/AD/.gemini/antigravity/brain/232b351e-eefe-4b8c-b1ad-d76aa5ff8f2e';
const GEN_DIR = path.resolve('public/assets/kage/generated');
const FG_DIR = path.resolve('public/assets/kage/foreground/png');

fs.mkdirSync(GEN_DIR, { recursive: true });
fs.mkdirSync(FG_DIR, { recursive: true });

// Copy Cards & Peek Visuals
fs.copyFileSync(
  path.join(BRAIN_DIR, 'cantho_ninhkieu_scorpio_1787727610371.jpg'),
  path.join(GEN_DIR, 'kage-approach.jpg')
);
fs.copyFileSync(
  path.join(BRAIN_DIR, 'mekong_lotus_lanterns_1787727660207.jpg'),
  path.join(GEN_DIR, 'kage-lantern-court.jpg')
);
fs.copyFileSync(
  path.join(BRAIN_DIR, 'binhthuy_ancient_house_1787727632423.jpg'),
  path.join(GEN_DIR, 'kage-moonwater.jpg')
);
fs.copyFileSync(
  path.join(BRAIN_DIR, 'mekong_sampan_scorpio_1787727681086.jpg'),
  path.join(GEN_DIR, 'kage-sanmon-preview.jpg')
);

// Also copy to .webp alias for backwards compatibility if needed
fs.copyFileSync(
  path.join(BRAIN_DIR, 'cantho_ninhkieu_scorpio_1787727610371.jpg'),
  path.join(GEN_DIR, 'kage-approach.webp')
);
fs.copyFileSync(
  path.join(BRAIN_DIR, 'mekong_lotus_lanterns_1787727660207.jpg'),
  path.join(GEN_DIR, 'kage-lantern-court.webp')
);
fs.copyFileSync(
  path.join(BRAIN_DIR, 'binhthuy_ancient_house_1787727632423.jpg'),
  path.join(GEN_DIR, 'kage-moonwater.webp')
);
fs.copyFileSync(
  path.join(BRAIN_DIR, 'mekong_sampan_scorpio_1787727681086.jpg'),
  path.join(GEN_DIR, 'kage-sanmon-preview.webp')
);

// Foreground cutouts
fs.copyFileSync(
  path.join(BRAIN_DIR, 'vietnam_lotus_hyacinth_cutout_1787727711884.jpg'),
  path.join(FG_DIR, 'sakura-branch.webp')
);
fs.copyFileSync(
  path.join(BRAIN_DIR, 'vietnam_lotus_hyacinth_cutout_1787727711884.jpg'),
  path.join(FG_DIR, 'maple-leaves.webp')
);

console.log('✅ All Cinema-grade Can Tho & Binh Thuy assets deployed successfully!');
