import fs from 'node:fs';
import path from 'node:path';

const GENERATED_DIR = path.resolve('public/assets/kage/generated');
const FOREGROUND_DIR = path.resolve('public/assets/kage/foreground/png');

fs.mkdirSync(GENERATED_DIR, { recursive: true });
fs.mkdirSync(FOREGROUND_DIR, { recursive: true });

// Helper to write SVG as a clean asset (SVGs work everywhere in modern browsers, CSS background and img tags)
function writeSvg(filePath, svgContent) {
  fs.writeFileSync(filePath, svgContent.trim(), 'utf-8');
  console.log(`Created: ${filePath}`);
}

// 1. CARD 1: CryptoMap — Mekong River, Wooden Sampan, & Scorpio Constellation
const card1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <radialGradient id="skyGrad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#0d1b2a"/>
      <stop offset="45%" stop-color="#071018"/>
      <stop offset="85%" stop-color="#03080d"/>
      <stop offset="100%" stop-color="#010406"/>
    </radialGradient>
    <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff4422" stop-opacity="0.85"/>
      <stop offset="35%" stop-color="#ff7733" stop-opacity="0.4"/>
      <stop offset="70%" stop-color="#ffaa44" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#ff4422" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="antaresGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff2200" stop-opacity="1"/>
      <stop offset="40%" stop-color="#ff5522" stop-opacity="0.8"/>
      <stop offset="80%" stop-color="#ff8844" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#ff2200" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#051019"/>
      <stop offset="30%" stop-color="#081824"/>
      <stop offset="70%" stop-color="#040c14"/>
      <stop offset="100%" stop-color="#02060a"/>
    </linearGradient>
    <linearGradient id="sampanGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3d2314"/>
      <stop offset="50%" stop-color="#24140a"/>
      <stop offset="100%" stop-color="#120a05"/>
    </linearGradient>
    <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffcc44" stop-opacity="0.9"/>
      <stop offset="40%" stop-color="#ff8811" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#ff5500" stop-opacity="0"/>
    </radialGradient>
    <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
    <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Sky -->
  <rect width="1200" height="800" fill="url(#skyGrad)"/>

  <!-- Stars Background -->
  <g fill="#ffffff" opacity="0.75">
    <circle cx="120" cy="80" r="1.2" opacity="0.6"/>
    <circle cx="280" cy="140" r="1.5" opacity="0.8"/>
    <circle cx="450" cy="60" r="1" opacity="0.5"/>
    <circle cx="720" cy="110" r="1.8" opacity="0.9"/>
    <circle cx="890" cy="75" r="1.3" opacity="0.7"/>
    <circle cx="1050" cy="130" r="1.6" opacity="0.8"/>
    <circle cx="180" cy="220" r="1" opacity="0.4"/>
    <circle cx="340" cy="280" r="1.4" opacity="0.6"/>
    <circle cx="610" cy="210" r="1.2" opacity="0.7"/>
    <circle cx="980" cy="240" r="1.5" opacity="0.6"/>
  </g>

  <!-- Scorpio Constellation (Chòm sao Thiên Yết) -->
  <g id="scorpioConstellation" stroke="#66d9ff" stroke-width="1.8" stroke-opacity="0.65" filter="url(#starGlow)">
    <!-- Claws & Head -->
    <line x1="680" y1="120" x2="720" y2="150"/>
    <line x1="720" y1="150" x2="750" y2="190"/>
    <line x1="720" y1="150" x2="680" y2="210"/>
    <line x1="680" y1="210" x2="640" y2="260"/>
    <!-- Heart (Antares) to Body -->
    <line x1="640" y1="260" x2="655" y2="320"/>
    <line x1="655" y1="320" x2="680" y2="370"/>
    <line x1="680" y1="370" x2="720" y2="420"/>
    <line x1="720" y1="420" x2="770" y2="455"/>
    <line x1="770" y1="455" x2="830" y2="470"/>
    <!-- Stinger & Tail -->
    <line x1="830" y1="470" x2="890" y2="455"/>
    <line x1="890" y1="455" x2="930" y2="415"/>
    <line x1="930" y1="415" x2="945" y2="365"/>
    <line x1="945" y1="365" x2="930" y2="340"/>

    <!-- Stars Nodes -->
    <g fill="#aae5ff" stroke="none">
      <circle cx="680" cy="120" r="3.5"/>
      <circle cx="720" cy="150" r="4.5"/>
      <circle cx="750" cy="190" r="3.5"/>
      <circle cx="680" cy="210" r="4"/>
      <circle cx="655" cy="320" r="3.5"/>
      <circle cx="680" cy="370" r="4"/>
      <circle cx="720" cy="420" r="4"/>
      <circle cx="770" cy="455" r="4.5"/>
      <circle cx="830" cy="470" r="4"/>
      <circle cx="890" cy="455" r="4.5"/>
      <circle cx="930" cy="415" r="5"/>
      <circle cx="945" cy="365" r="5.5"/>
      <circle cx="930" cy="340" r="4"/>
    </g>
  </g>

  <!-- Antares Ruby Star (Tâm Bọ Cạp) -->
  <circle cx="640" cy="260" r="50" fill="url(#antaresGlow)"/>
  <circle cx="640" cy="260" r="8" fill="#ff4422"/>
  <circle cx="640" cy="260" r="3.5" fill="#ffffff"/>

  <!-- Distant Mangrove / Water Coconut Horizon -->
  <path d="M0 480 Q150 460 350 475 T750 465 T1200 480 L1200 520 L0 520 Z" fill="#030c12" opacity="0.9"/>
  <!-- Distant Palms Silhouettes -->
  <g fill="#02080c" opacity="0.95">
    <path d="M120 480 C110 440 100 400 80 380 C110 390 140 385 170 380 C140 410 130 445 125 480 Z"/>
    <path d="M160 480 C165 435 180 395 210 370 C200 400 220 405 245 400 C215 425 190 450 170 480 Z"/>
    <path d="M480 475 C475 430 465 390 440 365 C470 380 500 375 525 365 C500 400 490 435 485 475 Z"/>
    <path d="M980 480 C970 425 955 385 925 360 C960 375 995 370 1030 360 C995 400 985 440 980 480 Z"/>
  </g>

  <!-- Mekong River Water Surface -->
  <rect y="480" width="1200" height="320" fill="url(#waterGrad)"/>

  <!-- River Water Ripples & Reflections -->
  <g stroke="#1a4258" stroke-width="1.5" opacity="0.4" fill="none">
    <ellipse cx="600" cy="530" rx="400" ry="12"/>
    <ellipse cx="700" cy="570" rx="350" ry="15"/>
    <ellipse cx="500" cy="620" rx="480" ry="20"/>
    <ellipse cx="650" cy="680" rx="550" ry="25"/>
    <ellipse cx="580" cy="740" rx="580" ry="30"/>
  </g>

  <!-- Antares & Sky Reflection on River -->
  <ellipse cx="640" cy="540" rx="80" ry="8" fill="#ff4422" opacity="0.18" filter="url(#blurFilter)"/>
  <ellipse cx="640" cy="600" rx="120" ry="14" fill="#ff4422" opacity="0.12" filter="url(#blurFilter)"/>

  <!-- Traditional Wooden Sampan Boat (Xuồng Ba Lá) in Foreground -->
  <g id="sampanGroup" transform="translate(180, 520)">
    <!-- Boat Shadow -->
    <ellipse cx="220" cy="130" rx="240" ry="35" fill="#000000" opacity="0.6" filter="url(#blurFilter)"/>
    <!-- Hull Base -->
    <path d="M20 90 Q220 150 440 85 Q460 75 480 50 Q430 115 220 125 Q30 115 0 50 Q10 75 20 90 Z" fill="url(#sampanGrad)" stroke="#52311c" stroke-width="2"/>
    <!-- Hull Interior / Ribs -->
    <path d="M40 70 Q220 105 420 68 Q400 95 220 102 Q60 95 40 70 Z" fill="#1b0e07"/>
    <line x1="120" y1="80" x2="125" y2="98" stroke="#3d2314" stroke-width="3"/>
    <line x1="220" y1="87" x2="220" y2="102" stroke="#3d2314" stroke-width="4"/>
    <line x1="330" y1="78" x2="325" y2="96" stroke="#3d2314" stroke-width="3"/>
    <!-- Wooden Oar (Mái chèo gỗ) -->
    <path d="M80 30 L260 130 L280 145 L255 140 L100 45 Z" fill="#5c3820"/>
    <!-- Lantern on Bow of Sampan -->
    <circle cx="450" cy="40" r="35" fill="url(#lanternGlow)"/>
    <path d="M445 25 L455 25 L458 45 L442 45 Z" fill="#ffeedd" opacity="0.9"/>
    <rect x="444" y="20" width="12" height="5" rx="2" fill="#2b1a0e"/>
    <rect x="442" y="45" width="16" height="6" rx="2" fill="#2b1a0e"/>
    <circle cx="450" cy="35" r="4" fill="#ffffff"/>
  </g>

  <!-- Floating Lotus Lanterns (Hoa Đăng Sen) on River -->
  <g transform="translate(780, 610)">
    <circle cx="0" cy="0" r="45" fill="url(#lanternGlow)"/>
    <!-- Lotus Petals -->
    <path d="M-25 5 C-20 -15 0 -25 0 -25 C0 -25 20 -15 25 5 C15 12 -15 12 -25 5 Z" fill="#e03a6a" opacity="0.85"/>
    <path d="M-18 5 C-12 -10 0 -20 0 -20 C0 -20 12 -10 18 5 Z" fill="#ff77a8" opacity="0.95"/>
    <!-- Golden Flame Center -->
    <circle cx="0" cy="-5" r="6" fill="#ffea77"/>
    <circle cx="0" cy="-5" r="3" fill="#ffffff"/>
  </g>

  <g transform="translate(960, 680) scale(0.75)">
    <circle cx="0" cy="0" r="45" fill="url(#lanternGlow)"/>
    <path d="M-25 5 C-20 -15 0 -25 0 -25 C0 -25 20 -15 25 5 C15 12 -15 12 -25 5 Z" fill="#e03a6a" opacity="0.85"/>
    <path d="M-18 5 C-12 -10 0 -20 0 -20 C0 -20 12 -10 18 5 Z" fill="#ff77a8" opacity="0.95"/>
    <circle cx="0" cy="-5" r="6" fill="#ffea77"/>
  </g>

  <!-- Floating Water Hyacinth (Lục bình tím) -->
  <g transform="translate(100, 680)">
    <!-- Hyacinth Leaves -->
    <path d="M20 30 C-10 10 -20 40 10 50 C30 55 50 40 20 30 Z" fill="#143d22"/>
    <path d="M60 25 C40 5 20 35 50 48 C70 52 85 35 60 25 Z" fill="#1b4d2b"/>
    <!-- Hyacinth Purple Flower -->
    <circle cx="45" cy="15" r="10" fill="#9d5bd2" opacity="0.9"/>
    <circle cx="45" cy="15" r="4" fill="#ffd700"/>
  </g>
</svg>`;

// 2. CARD 2: NailHub — Glowing Lotus Flower Lantern Court on Mekong River
const card2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <radialGradient id="courtSky" cx="50%" cy="20%" r="80%">
      <stop offset="0%" stop-color="#140b24"/>
      <stop offset="50%" stop-color="#090514"/>
      <stop offset="100%" stop-color="#020106"/>
    </radialGradient>
    <radialGradient id="lotusGlowMain" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff4488" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="#ff7733" stop-opacity="0.5"/>
      <stop offset="70%" stop-color="#ffaa00" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#ff4488" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="warmAmber" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffea77" stop-opacity="1"/>
      <stop offset="40%" stop-color="#ff9911" stop-opacity="0.6"/>
      <stop offset="80%" stop-color="#ff4400" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#ff2200" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur2" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="15"/>
    </filter>
  </defs>

  <rect width="1200" height="800" fill="url(#courtSky)"/>

  <!-- Riverside Wooden Pier / Stilt Veranda -->
  <g fill="#180e08" stroke="#331c10" stroke-width="2">
    <!-- Veranda Pillars -->
    <rect x="80" y="240" width="28" height="400" rx="4"/>
    <rect x="320" y="220" width="28" height="420" rx="4"/>
    <rect x="560" y="250" width="24" height="390" rx="4"/>
    <rect x="800" y="230" width="28" height="410" rx="4"/>
    <rect x="1040" y="260" width="28" height="380" rx="4"/>
    <!-- Cross Beams & Wooden Railings with Vietnamese Balusters -->
    <rect x="40" y="380" width="1120" height="22" rx="3"/>
    <rect x="40" y="440" width="1120" height="18" rx="3"/>
    <!-- Balusters -->
    <g fill="#24140c">
      <rect x="150" y="402" width="12" height="38" rx="2"/>
      <rect x="190" y="402" width="12" height="38" rx="2"/>
      <rect x="230" y="402" width="12" height="38" rx="2"/>
      <rect x="270" y="402" width="12" height="38" rx="2"/>
      <rect x="390" y="402" width="12" height="38" rx="2"/>
      <rect x="430" y="402" width="12" height="38" rx="2"/>
      <rect x="470" y="402" width="12" height="38" rx="2"/>
      <rect x="510" y="402" width="12" height="38" rx="2"/>
      <rect x="630" y="402" width="12" height="38" rx="2"/>
      <rect x="670" y="402" width="12" height="38" rx="2"/>
      <rect x="710" y="402" width="12" height="38" rx="2"/>
      <rect x="750" y="402" width="12" height="38" rx="2"/>
    </g>
  </g>

  <!-- Hanging Silk Lanterns (Đèn Lồng Lụa Hội An / Nam Bộ) -->
  <g transform="translate(200, 180)">
    <line x1="0" y1="-80" x2="0" y2="0" stroke="#442211" stroke-width="2"/>
    <circle cx="0" cy="35" r="70" fill="url(#warmAmber)"/>
    <!-- Silk Lantern Oval -->
    <ellipse cx="0" cy="35" rx="32" ry="48" fill="#e03020" stroke="#ffcc44" stroke-width="1.5"/>
    <ellipse cx="0" cy="35" rx="18" ry="48" fill="#ff5522" opacity="0.6"/>
    <!-- Tassel (Tua rua lụa vàng) -->
    <line x1="0" y1="83" x2="0" y2="130" stroke="#ffbb33" stroke-width="4"/>
  </g>

  <g transform="translate(680, 150)">
    <line x1="0" y1="-80" x2="0" y2="0" stroke="#442211" stroke-width="2"/>
    <circle cx="0" cy="35" r="75" fill="url(#warmAmber)"/>
    <ellipse cx="0" cy="35" rx="36" ry="54" fill="#ffaa00" stroke="#ffee66" stroke-width="1.5"/>
    <line x1="0" y1="89" x2="0" y2="140" stroke="#ffdd55" stroke-width="4"/>
  </g>

  <!-- River with Massive Field of Floating Lotus Lanterns -->
  <rect y="480" width="1200" height="320" fill="#040b12"/>

  <!-- Master Giant Lotus Lantern in Foreground Center -->
  <g transform="translate(600, 620)">
    <circle cx="0" cy="0" r="160" fill="url(#lotusGlowMain)" filter="url(#blur2)"/>
    <!-- Outer Lotus Petals -->
    <path d="M-90 10 C-80 -60 0 -90 0 -90 C0 -90 80 -60 90 10 C50 35 -50 35 -90 10 Z" fill="#b81b4c"/>
    <path d="M-65 10 C-55 -45 0 -75 0 -75 C0 -75 55 -45 65 10 Z" fill="#e83672"/>
    <path d="M-40 10 C-30 -30 0 -55 0 -55 C0 -55 30 -30 40 10 Z" fill="#ff6ea3"/>
    <!-- Inner Candle / Flame -->
    <ellipse cx="0" cy="-10" rx="14" ry="24" fill="#ffea55"/>
    <ellipse cx="0" cy="-10" rx="7" ry="14" fill="#ffffff"/>
    <!-- Water Ripple Reflection -->
    <ellipse cx="0" cy="40" rx="140" ry="18" fill="#ff3377" opacity="0.3" filter="url(#blur2)"/>
  </g>

  <!-- Field of Smaller Lotus Lanterns -->
  <g transform="translate(240, 580) scale(0.6)">
    <circle cx="0" cy="0" r="100" fill="url(#lotusGlowMain)"/>
    <path d="M-60 10 C-50 -45 0 -70 0 -70 C0 -70 50 -45 60 10 Z" fill="#e83672"/>
    <circle cx="0" cy="-10" r="12" fill="#ffea55"/>
  </g>
  <g transform="translate(920, 590) scale(0.55)">
    <circle cx="0" cy="0" r="100" fill="url(#lotusGlowMain)"/>
    <path d="M-60 10 C-50 -45 0 -70 0 -70 C0 -70 50 -45 60 10 Z" fill="#e83672"/>
    <circle cx="0" cy="-10" r="12" fill="#ffea55"/>
  </g>
  <g transform="translate(420, 680) scale(0.8)">
    <circle cx="0" cy="0" r="120" fill="url(#lotusGlowMain)"/>
    <path d="M-70 10 C-60 -50 0 -80 0 -80 C0 -80 60 -50 70 10 Z" fill="#e83672"/>
    <circle cx="0" cy="-10" r="14" fill="#ffea55"/>
  </g>
  <g transform="translate(820, 710) scale(0.75)">
    <circle cx="0" cy="0" r="120" fill="url(#lotusGlowMain)"/>
    <path d="M-70 10 C-60 -50 0 -80 0 -80 C0 -80 60 -50 70 10 Z" fill="#e83672"/>
    <circle cx="0" cy="-10" r="14" fill="#ffea55"/>
  </g>
</svg>`;

// 3. CARD 3: NEXORA — Traditional Vietnamese Riverside Pavilion & Antares Moon
const card3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <radialGradient id="moonSky" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#1c0a10"/>
      <stop offset="40%" stop-color="#0c0509"/>
      <stop offset="85%" stop-color="#040204"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <radialGradient id="bloodMoon" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#ffeedd"/>
      <stop offset="25%" stop-color="#ff7744"/>
      <stop offset="65%" stop-color="#cc2211"/>
      <stop offset="100%" stop-color="#770a05"/>
    </radialGradient>
    <radialGradient id="bloodMoonHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff3311" stop-opacity="0.8"/>
      <stop offset="45%" stop-color="#cc1100" stop-opacity="0.35"/>
      <stop offset="80%" stop-color="#770000" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#330000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a1c12"/>
      <stop offset="100%" stop-color="#140804"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="800" fill="url(#moonSky)"/>

  <!-- Glowing Blood Moon & Antares -->
  <circle cx="780" cy="240" r="220" fill="url(#bloodMoonHalo)"/>
  <circle cx="780" cy="240" r="110" fill="url(#bloodMoon)"/>

  <!-- Lunar Maria / Basins Detail -->
  <ellipse cx="740" cy="210" rx="35" ry="25" fill="#881105" opacity="0.5"/>
  <ellipse cx="800" cy="260" rx="45" ry="30" fill="#660a02" opacity="0.45"/>
  <ellipse cx="760" cy="290" rx="30" ry="20" fill="#770d04" opacity="0.4"/>

  <!-- Traditional Vietnamese Waterfront Pavilion (Thủy Đình Nam Bộ) Silhouetted against Moon -->
  <g id="thuyDinh" transform="translate(180, 160)">
    <!-- Lower Roof (Mái hạ ngói âm dương cong vút) -->
    <path d="M0 320 Q240 280 480 320 Q510 305 520 285 Q390 270 240 270 Q90 270 -40 285 Q-30 305 0 320 Z" fill="url(#roofGrad)" stroke="#522414" stroke-width="2"/>
    <!-- Upper Roof (Mái thượng với bờ nóc triều rồng / phượng hoàng) -->
    <path d="M60 210 Q240 180 420 210 Q445 195 455 175 Q345 165 240 165 Q135 165 25 175 Q35 195 60 210 Z" fill="url(#roofGrad)" stroke="#522414" stroke-width="2"/>
    <!-- Dragon / Boat Prow Finials (Đao mái cong vút) -->
    <path d="M-40 285 Q-55 260 -70 245 Q-55 265 -30 275 Z" fill="#d49a3a"/>
    <path d="M520 285 Q535 260 550 245 Q535 265 510 275 Z" fill="#d49a3a"/>
    <path d="M25 175 Q15 155 0 140 Q15 160 35 170 Z" fill="#d49a3a"/>
    <path d="M455 175 Q465 155 480 140 Q465 160 445 170 Z" fill="#d49a3a"/>

    <!-- Pavilion Lim Wooden Columns -->
    <g fill="#1a0b06">
      <rect x="40" y="315" width="22" height="240" rx="3"/>
      <rect x="150" y="315" width="20" height="240" rx="3"/>
      <rect x="310" y="315" width="20" height="240" rx="3"/>
      <rect x="420" y="315" width="22" height="240" rx="3"/>
      <!-- Veranda Wooden Deck on Stilts -->
      <rect x="-30" y="520" width="540" height="35" rx="4" fill="#241008"/>
      <!-- Stilts into Water -->
      <rect x="30" y="555" width="18" height="90" fill="#120603"/>
      <rect x="150" y="555" width="18" height="90" fill="#120603"/>
      <rect x="310" y="555" width="18" height="90" fill="#120603"/>
      <rect x="430" y="555" width="18" height="90" fill="#120603"/>
    </g>

    <!-- Warm Glowing Lanterns inside Pavilion -->
    <circle cx="240" cy="380" r="45" fill="#ffaa33" opacity="0.35"/>
    <rect x="232" y="360" width="16" height="28" rx="4" fill="#ffeeaa"/>
  </g>

  <!-- Water Surface & Blood Moon Reflection -->
  <rect y="580" width="1200" height="220" fill="#060205"/>
  <ellipse cx="780" cy="640" rx="140" ry="25" fill="#cc2211" opacity="0.35"/>
  <ellipse cx="780" cy="710" rx="180" ry="35" fill="#ff4422" opacity="0.2"/>

  <!-- Water Coconut Palm Silhouettes Framing the Right -->
  <g fill="#020102" opacity="0.95">
    <path d="M1120 580 C1110 480 1090 380 1020 300 C1080 320 1140 310 1200 300 C1150 360 1130 460 1120 580 Z"/>
    <path d="M1180 580 C1170 500 1160 420 1120 360 C1160 380 1200 375 1240 360 C1200 410 1190 490 1180 580 Z"/>
  </g>
</svg>`;

// 4. PEEK WINDOW: Cinematic Preview of Mekong River, Sampan & Scorpio
const peekSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="pSky" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#0f1f33"/>
      <stop offset="50%" stop-color="#07101c"/>
      <stop offset="100%" stop-color="#020509"/>
    </radialGradient>
    <radialGradient id="pAntares" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff3311" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#ff7733" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ff3311" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="url(#pSky)"/>
  <!-- Scorpio Constellation -->
  <g stroke="#66d9ff" stroke-width="1.8" stroke-opacity="0.75" fill="none">
    <line x1="450" y1="80" x2="480" y2="110"/>
    <line x1="480" y1="110" x2="510" y2="145"/>
    <line x1="480" y1="110" x2="445" y2="160"/>
    <line x1="445" y1="160" x2="410" y2="200"/>
    <line x1="410" y1="200" x2="430" y2="250"/>
    <line x1="430" y1="250" x2="460" y2="290"/>
    <line x1="460" y1="290" x2="510" y2="320"/>
    <line x1="510" y1="320" x2="570" y2="330"/>
    <line x1="570" y1="330" x2="620" y2="310"/>
    <line x1="620" y1="310" x2="650" y2="270"/>
    <line x1="650" y1="270" x2="660" y2="230"/>
    <line x1="660" y1="230" x2="645" y2="210"/>
  </g>
  <circle cx="410" cy="200" r="40" fill="url(#pAntares)"/>
  <circle cx="410" cy="200" r="6" fill="#ff4422"/>
  <circle cx="410" cy="200" r="2.5" fill="#ffffff"/>

  <!-- Water & Sampan -->
  <rect y="380" width="800" height="220" fill="#05101a"/>
  <!-- Sampan Silhouette with Lotus Lantern -->
  <g transform="translate(240, 410)">
    <path d="M10 50 Q160 90 320 45 Q335 35 350 20 Q310 65 160 75 Q20 65 0 20 Q5 35 10 50 Z" fill="#24140c"/>
    <circle cx="330" cy="15" r="25" fill="#ff9922" opacity="0.6"/>
    <circle cx="330" cy="15" r="4" fill="#ffffff"/>
  </g>
</svg>`;

// Write all generated card artworks
writeSvg(path.join(GENERATED_DIR, 'kage-approach.svg'), card1Svg);
writeSvg(path.join(GENERATED_DIR, 'kage-lantern-court.svg'), card2Svg);
writeSvg(path.join(GENERATED_DIR, 'kage-moonwater.svg'), card3Svg);
writeSvg(path.join(GENERATED_DIR, 'kage-sanmon-preview.svg'), peekSvg);

// Also write WebP compatible copies if needed or update CSS to use SVG
writeSvg(path.join(GENERATED_DIR, 'kage-approach.webp'), card1Svg);
writeSvg(path.join(GENERATED_DIR, 'kage-lantern-court.webp'), card2Svg);
writeSvg(path.join(GENERATED_DIR, 'kage-moonwater.webp'), card3Svg);
writeSvg(path.join(GENERATED_DIR, 'kage-sanmon-preview.webp'), peekSvg);

// -------------------------------------------------------------
// 5. FOREGROUND CUTOUTS (Replacing Japanese Sakura, Maple, Torii, & Stones)
// -------------------------------------------------------------

// 5a. Lotus Flower Branch & River Flora (Replacing sakura-branch.webp)
const lotusBranchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="lotusPink" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#ff77a8"/>
      <stop offset="85%" stop-color="#d4145a"/>
      <stop offset="100%" stop-color="#8a0b38"/>
    </radialGradient>
    <linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2d5a37"/>
      <stop offset="100%" stop-color="#0f2615"/>
    </linearGradient>
  </defs>
  <!-- Bamboo & Lotus Stems curving from top-left -->
  <path d="M0 80 Q160 120 300 240 Q400 330 450 480" stroke="url(#stemGrad)" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M120 110 Q220 180 280 290" stroke="url(#stemGrad)" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M260 210 Q340 220 400 200" stroke="url(#stemGrad)" stroke-width="6" fill="none" stroke-linecap="round"/>

  <!-- Master Lotus Bloom 1 (Nở rộ) -->
  <g transform="translate(300, 240)">
    <!-- Back Petals -->
    <path d="M-50 -10 C-40 -80 0 -110 0 -110 C0 -110 40 -80 50 -10 Z" fill="#a01042"/>
    <path d="M-70 10 C-70 -50 -20 -90 -20 -90 C-20 -90 30 -50 30 10 Z" fill="#c41a54"/>
    <path d="M-30 10 C-30 -50 20 -90 20 -90 C20 -90 70 -50 70 10 Z" fill="#c41a54"/>
    <!-- Front Petals with Gradient -->
    <path d="M-45 20 C-40 -40 0 -75 0 -75 C0 -75 40 -40 45 20 Z" fill="url(#lotusPink)"/>
    <path d="M-60 25 C-50 -20 -15 -55 -15 -55 C-15 -55 20 -20 30 25 Z" fill="url(#lotusPink)"/>
    <path d="M-30 25 C-20 -20 15 -55 15 -55 C15 -55 50 -20 60 25 Z" fill="url(#lotusPink)"/>
    <!-- Yellow Stamen Center -->
    <circle cx="0" cy="-5" r="14" fill="#ffd700"/>
    <circle cx="0" cy="-5" r="6" fill="#ffffff"/>
  </g>

  <!-- Lotus Bud 2 (Búp sen hồng) -->
  <g transform="translate(400, 200)">
    <path d="M-25 20 C-20 -30 0 -60 0 -60 C0 -60 20 -30 25 20 Z" fill="url(#lotusPink)"/>
  </g>

  <!-- Delicate Green Lotus Leaves -->
  <g transform="translate(180, 160)">
    <path d="M0 0 C-40 -20 -60 20 -30 40 C0 60 40 40 20 10 Z" fill="#245930"/>
  </g>
</svg>`;

// 5b. Water Hyacinth Purple Flowers & Leaves (Replacing maple-leaves.webp)
const hyacinthLeavesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="hyacinthPurple" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#d6a8ff"/>
      <stop offset="70%" stop-color="#8a3bcc"/>
      <stop offset="100%" stop-color="#4a1577"/>
    </radialGradient>
  </defs>
  <!-- Cluster of Water Hyacinth (Lục bình tím) -->
  <g transform="translate(300, 300)">
    <!-- Glossy Green Leaves -->
    <path d="M-120 40 C-180 -20 -150 -120 -80 -90 C-10 -60 -40 20 -120 40 Z" fill="#1b4d2b" stroke="#0e2b18" stroke-width="3"/>
    <path d="M40 50 C120 -10 160 -90 90 -110 C20 -130 -10 -40 40 50 Z" fill="#236639" stroke="#0e2b18" stroke-width="3"/>
    <path d="M-40 80 C-80 150 20 180 60 120 C100 60 0 10 -40 80 Z" fill="#143d22"/>

    <!-- Purple Flower Spikes -->
    <g transform="translate(-20, -50)">
      <!-- 6 Petals -->
      <path d="M0 0 C-30 -20 -40 -60 0 -75 C40 -60 30 -20 0 0 Z" fill="url(#hyacinthPurple)"/>
      <path d="M-15 -10 C-55 -25 -70 5 -50 30 C-30 55 -5 20 -15 -10 Z" fill="url(#hyacinthPurple)"/>
      <path d="M15 -10 C55 -25 70 5 50 30 C30 55 5 20 15 -10 Z" fill="url(#hyacinthPurple)"/>
      <path d="M-10 15 C-40 45 -20 80 0 75 C20 80 40 45 10 15 Z" fill="url(#hyacinthPurple)"/>
      <!-- Top Petal Blue & Yellow Eye (Đốm vàng mắt phượng đặc trưng hoa lục bình) -->
      <ellipse cx="0" cy="-45" rx="12" ry="16" fill="#3388ff"/>
      <circle cx="0" cy="-45" r="6" fill="#ffd700"/>
    </g>
  </g>
</svg>`;

// 5c. Mekong Hurricane Oil Lamp on Wooden Post (Replacing stone-lantern.webp)
const lanternSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="500" height="700">
  <defs>
    <radialGradient id="lampFlame" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#ffea66"/>
      <stop offset="60%" stop-color="#ff7711"/>
      <stop offset="100%" stop-color="#ff3300" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="lampGlowHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff9922" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#ff5500" stop-opacity="0.35"/>
      <stop offset="85%" stop-color="#cc2200" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ff5500" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Weathered Wood Post -->
  <path d="M230 380 L230 700 L270 700 L270 380 Z" fill="#2b1a10" stroke="#170c06" stroke-width="3"/>
  <rect x="210" y="370" width="80" height="20" rx="4" fill="#3d2618"/>

  <!-- Glowing Hurricane Lamp (Đèn bão miền Tây) -->
  <g transform="translate(250, 240)">
    <!-- Light Glow Halo -->
    <circle cx="0" cy="20" r="180" fill="url(#lampGlowHalo)"/>
    <!-- Lamp Metal Base -->
    <rect x="-40" y="80" width="80" height="30" rx="6" fill="#1b120c" stroke="#523824" stroke-width="2"/>
    <ellipse cx="0" cy="80" rx="35" ry="12" fill="#2d1e15"/>
    <!-- Glass Chimney -->
    <path d="M-28 75 C-45 40 -35 -10 -20 -35 L20 -35 C35 -10 45 40 28 75 Z" fill="#fffaee" fill-opacity="0.35" stroke="#ffe099" stroke-width="1.5"/>
    <!-- Flame Inside -->
    <ellipse cx="0" cy="25" rx="14" ry="26" fill="url(#lampFlame)"/>
    <ellipse cx="0" cy="25" rx="6" ry="14" fill="#ffffff"/>
    <!-- Metal Top Cap & Handle -->
    <path d="M-25 -35 L25 -35 L18 -60 L-18 -60 Z" fill="#1b120c" stroke="#523824" stroke-width="2"/>
    <path d="M-35 20 C-65 -40 0 -90 0 -90 C0 -90 65 -40 35 20" fill="none" stroke="#6b4c33" stroke-width="4"/>
  </g>
</svg>`;

// 5d. Vietnamese Wooden River Pier & Bamboo Fence (Replacing temple-wall.webp)
const riverPierSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="pierWood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3d2417"/>
      <stop offset="50%" stop-color="#24140b"/>
      <stop offset="100%" stop-color="#0f0703"/>
    </linearGradient>
  </defs>
  <!-- Heavy Wooden Pier Decking -->
  <g fill="url(#pierWood)" stroke="#1a0c06" stroke-width="3">
    <rect x="0" y="320" width="800" height="45" rx="4"/>
    <rect x="0" y="375" width="800" height="35" rx="3"/>
    <!-- Vertical Stilt Posts -->
    <rect x="60" y="360" width="45" height="240" rx="4"/>
    <rect x="240" y="360" width="45" height="240" rx="4"/>
    <rect x="440" y="360" width="45" height="240" rx="4"/>
    <rect x="640" y="360" width="45" height="240" rx="4"/>
    <!-- Bamboo Cross Weave / Fence -->
    <g stroke="#5c4026" stroke-width="8" stroke-linecap="round">
      <line x1="20" y1="180" x2="780" y2="180"/>
      <line x1="20" y1="240" x2="780" y2="240"/>
      <!-- Vertical Bamboo Stems -->
      <line x1="80" y1="120" x2="80" y2="320"/>
      <line x1="140" y1="110" x2="140" y2="320"/>
      <line x1="200" y1="130" x2="200" y2="320"/>
      <line x1="260" y1="115" x2="260" y2="320"/>
      <line x1="320" y1="125" x2="320" y2="320"/>
      <line x1="380" y1="110" x2="380" y2="320"/>
      <line x1="440" y1="130" x2="440" y2="320"/>
      <line x1="500" y1="115" x2="500" y2="320"/>
      <line x1="560" y1="125" x2="560" y2="320"/>
      <line x1="620" y1="110" x2="620" y2="320"/>
      <line x1="680" y1="130" x2="680" y2="320"/>
      <line x1="740" y1="115" x2="740" y2="320"/>
    </g>
  </g>
</svg>`;

// 5e. Water Coconut Palms & Bamboo (Replacing pine-tree.webp)
const coconutPalmsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <defs>
    <linearGradient id="palmLeaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1b4d2b"/>
      <stop offset="60%" stop-color="#0e2e18"/>
      <stop offset="100%" stop-color="#05140a"/>
    </linearGradient>
  </defs>
  <!-- Water Coconut Palm Fronds (Dừa nước miền Tây) -->
  <g transform="translate(300, 750)">
    <!-- Palm Frond 1 (Left) -->
    <path d="M0 0 C-60 -250 -220 -480 -280 -620 C-220 -520 -150 -320 0 0 Z" fill="url(#palmLeaf)"/>
    <!-- Frond Leaflets -->
    <path d="M-150 -350 L-260 -420 L-170 -380 L-280 -450 L-190 -410 L-290 -500" stroke="#1b4d2b" stroke-width="6" fill="none"/>
    <!-- Palm Frond 2 (Center High) -->
    <path d="M0 0 C-30 -300 -60 -560 -40 -720 C20 -580 40 -340 0 0 Z" fill="url(#palmLeaf)"/>
    <!-- Palm Frond 3 (Right) -->
    <path d="M0 0 C80 -260 220 -460 290 -590 C220 -480 140 -290 0 0 Z" fill="url(#palmLeaf)"/>
    <path d="M150 -340 L250 -400 L170 -370 L270 -440 L190 -400 L280 -480" stroke="#1b4d2b" stroke-width="6" fill="none"/>
  </g>
</svg>`;

// 5f. Traditional Wooden Sampan Boat (Replacing shrine-ruins.webp)
const sampanCutoutSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="sampanHull" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4a2c1a"/>
      <stop offset="50%" stop-color="#2c180d"/>
      <stop offset="100%" stop-color="#120803"/>
    </linearGradient>
  </defs>
  <!-- Traditional Vietnamese Wooden Sampan (Xuồng Ba Lá Nam Bộ) -->
  <g transform="translate(100, 180)">
    <!-- Hull Exterior -->
    <path d="M30 140 Q300 220 570 130 Q600 110 630 80 Q560 170 300 185 Q40 170 0 80 Q15 115 30 140 Z" fill="url(#sampanHull)" stroke="#6b4028" stroke-width="3"/>
    <!-- Hull Ribs & Planks -->
    <path d="M60 115 Q300 160 540 110 Q515 145 300 155 Q85 145 60 115 Z" fill="#170c06"/>
    <!-- Ribs -->
    <line x1="160" y1="130" x2="165" y2="150" stroke="#4a2c1a" stroke-width="4"/>
    <line x1="300" y1="138" x2="300" y2="155" stroke="#4a2c1a" stroke-width="5"/>
    <line x1="440" y1="126" x2="435" y2="148" stroke="#4a2c1a" stroke-width="4"/>
    <!-- Conical Hat (Nón lá) resting in sampan -->
    <path d="M260 120 L310 85 L360 120 Z" fill="#d9b373" stroke="#b08b4a" stroke-width="1.5"/>
  </g>
</svg>`;

// Write all foreground cutouts
writeSvg(path.join(FOREGROUND_DIR, 'sakura-branch.webp'), lotusBranchSvg);
writeSvg(path.join(FOREGROUND_DIR, 'maple-leaves.webp'), hyacinthLeavesSvg);
writeSvg(path.join(FOREGROUND_DIR, 'stone-lantern.webp'), lanternSvg);
writeSvg(path.join(FOREGROUND_DIR, 'temple-wall.webp'), riverPierSvg);
writeSvg(path.join(FOREGROUND_DIR, 'pine-tree.webp'), coconutPalmsSvg);
writeSvg(path.join(FOREGROUND_DIR, 'shrine-ruins.webp'), sampanCutoutSvg);

console.log('✅ Successfully generated all Vietnamese Mekong Delta & Scorpio assets!');
