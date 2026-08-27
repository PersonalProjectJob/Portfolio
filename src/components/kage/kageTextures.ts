// =====================================================================
// MEKONG LOTUS — Procedural Shaders & Texture Generator
// Color System: Luminous Mekong Sapphire & Antares Ruby
// =====================================================================

export const TAU = Math.PI * 2;

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function damp(cur: number, target: number, lambda: number, dt: number): number {
  return lerp(cur, target, 1 - Math.exp(-lambda * dt));
}

export function sat(v: number): number {
  return clamp(v, 0, 1);
}

// Deterministic PRNG
export function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 2D Simplex/Value Noise for Procedural Water & Foliage
export function noise2D(seed: number) {
  const rnd = mulberry32(seed);
  const p = new Uint8Array(512);
  const perm = new Uint8Array(256);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = perm[i];
    perm[i] = perm[j];
    perm[j] = t;
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

  return function (x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);

    const a = p[X] + Y;
    const aa = p[a];
    const ab = p[a + 1];
    const b = p[X + 1] + Y;
    const ba = p[b];
    const bb = p[b + 1];

    function grad(hash: number, gx: number, gy: number): number {
      const h = hash & 7;
      const u = h < 4 ? gx : gy;
      const v = h < 4 ? gy : gx;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return (lerp(x1, x2, v) + 1) * 0.5;
  };
}

// Fractal Brownian Motion (FBM)
export function fbm(
  n: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves = 4,
  lacunarity = 2.0,
  gain = 0.5
): number {
  let amp = 1.0;
  let freq = 1.0;
  let total = 0;
  let maxAmp = 0;
  for (let i = 0; i < octaves; i++) {
    total += n(x * freq, y * freq) * amp;
    maxAmp += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return total / maxAmp;
}

export function cvs(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Multi-Octave Water Ripple Normal Map Generator for Sông Hậu Liquid Surface
export function texWaterNormal(W = 1024, H = 1024): { map: HTMLCanvasElement; normal: HTMLCanvasElement } {
  const c = cvs(W, H);
  const ctx = c.getContext('2d')!;
  const normCvs = cvs(W, H);
  const normCtx = normCvs.getContext('2d')!;

  const n1 = noise2D(8821);
  const n2 = noise2D(3194);
  const heightData = new Float32Array(W * H);

  // Generate seamless wave height map
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = (x / W) * 8.0;
      const ny = (y / H) * 8.0;

      // Layered sine + Perlin wave harmonics
      const wave1 = Math.sin(nx * 3.14 + ny * 2.1) * 0.25;
      const wave2 = Math.sin(nx * 1.8 - ny * 3.8) * 0.20;
      const perlin = fbm(n1, nx, ny, 4, 2.1, 0.5) * 0.45;
      const detail = fbm(n2, nx * 2.4, ny * 2.4, 3, 2.0, 0.5) * 0.15;

      const h = clamp((wave1 + wave2 + perlin + detail + 1.0) * 0.5, 0, 1);
      heightData[y * W + x] = h;
    }
  }

  // Render height map
  const imgData = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const val = Math.floor(heightData[i] * 255);
    const idx = i * 4;
    imgData.data[idx] = val;
    imgData.data[idx + 1] = val;
    imgData.data[idx + 2] = val;
    imgData.data[idx + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Compute Sobel normal map
  const normImg = normCtx.createImageData(W, H);
  const strength = 4.2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const left = heightData[y * W + ((x - 1 + W) % W)];
      const right = heightData[y * W + ((x + 1) % W)];
      const up = heightData[((y - 1 + H) % H) * W + x];
      const down = heightData[((y + 1) % H) * W + x];

      const dx = (left - right) * strength;
      const dy = (up - down) * strength;
      const dz = 1.0;

      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const nx = (dx / len) * 0.5 + 0.5;
      const ny = (dy / len) * 0.5 + 0.5;
      const nz = (dz / len) * 0.5 + 0.5;

      const idx = (y * W + x) * 4;
      normImg.data[idx] = Math.floor(nx * 255);
      normImg.data[idx + 1] = Math.floor(ny * 255);
      normImg.data[idx + 2] = Math.floor(nz * 255);
      normImg.data[idx + 3] = 255;
    }
  }
  normCtx.putImageData(normImg, 0, 0);

  return { map: c, normal: normCvs };
}

// Organic Lotus Leaf Texture (Radial Veins & Emerald-Teal Sheen)
export function texLotusLeaf(W = 512, H = 512): HTMLCanvasElement {
  const c = cvs(W, H);
  const ctx = c.getContext('2d')!;

  const cx = W * 0.5;
  const cy = H * 0.5;
  const maxR = W * 0.48;

  // Background deep aquatic tone
  ctx.fillStyle = '#07161b';
  ctx.fillRect(0, 0, W, H);

  // Radial dark teal gradient
  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, maxR);
  grad.addColorStop(0, '#1c4748');
  grad.addColorStop(0.5, '#123438');
  grad.addColorStop(0.85, '#0c262a');
  grad.addColorStop(1, '#07161b');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, TAU);
  ctx.fill();

  // Radial Veins
  const VEIN_COUNT = 24;
  ctx.strokeStyle = 'rgba(70, 160, 165, 0.45)';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < VEIN_COUNT; i++) {
    const angle = (i / VEIN_COUNT) * TAU;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const endX = cx + Math.cos(angle) * maxR;
    const endY = cy + Math.sin(angle) * maxR;
    ctx.quadraticCurveTo(
      cx + Math.cos(angle + 0.08) * (maxR * 0.6),
      cy + Math.sin(angle + 0.08) * (maxR * 0.6),
      endX,
      endY
    );
    ctx.stroke();
  }

  // Outer golden-cyan rim glow
  ctx.strokeStyle = 'rgba(85, 221, 255, 0.25)';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR - 2, 0, TAU);
  ctx.stroke();

  return c;
}

// Luminous Mekong Night Sky & Starlight Texture
export function texSkyMekong(W = 2048, H = 1024): HTMLCanvasElement {
  const c = cvs(W, H);
  const ctx = c.getContext('2d')!;

  // Deep sapphire to midnight gradient
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#040b14');
  g.addColorStop(0.4, '#071426');
  g.addColorStop(0.75, '#0b2036');
  g.addColorStop(1, '#061320');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Milky Way Nebula Dust
  const n = noise2D(9042);
  const nebImg = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = (x / W) * 6.0;
      const ny = (y / H) * 3.0;
      const val = fbm(n, nx, ny, 4, 2.0, 0.5);
      const intensity = Math.pow(val, 2.2);

      const idx = (y * W + x) * 4;
      nebImg.data[idx] = Math.floor(intensity * 35);
      nebImg.data[idx + 1] = Math.floor(intensity * 75);
      nebImg.data[idx + 2] = Math.floor(intensity * 120);
      nebImg.data[idx + 3] = Math.floor(intensity * 70);
    }
  }

  const nebCvs = cvs(W, H);
  const nebCtx = nebCvs.getContext('2d')!;
  nebCtx.putImageData(nebImg, 0, 0);

  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(nebCvs, 0, 0);
  ctx.globalCompositeOperation = 'source-over';

  // Stars
  const rnd = mulberry32(1994);
  for (let i = 0; i < 680; i++) {
    const sx = rnd() * W;
    const sy = rnd() * H * 0.85;
    const r = 0.4 + rnd() * rnd() * 1.8;
    const alpha = (0.15 + rnd() * 0.7) * (1 - sy / H);

    ctx.fillStyle = `rgba(215, 240, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, TAU);
    ctx.fill();
  }

  return c;
}

// Buttery Smooth Gaussian Radial Glow for Halos and Particles
export function texSoftGaussianGlow(color = 'rgba(255, 120, 160, 1)', outerAlpha = 'rgba(255, 51, 119, 0)'): HTMLCanvasElement {
  const S = 256;
  const c = cvs(S, S);
  const ctx = c.getContext('2d')!;
  const center = S / 2;

  const g = ctx.createRadialGradient(center, center, 0, center, center, center * 0.95);
  g.addColorStop(0, color);
  g.addColorStop(0.3, color.replace('1)', '0.65)'));
  g.addColorStop(0.6, color.replace('1)', '0.22)'));
  g.addColorStop(0.85, color.replace('1)', '0.06)'));
  g.addColorStop(1, outerAlpha);

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return c;
}

// Soft Atmospheric Mist Texture
export function texMist(W = 512, H = 512): HTMLCanvasElement {
  const c = cvs(W, H);
  const ctx = c.getContext('2d')!;
  const n = noise2D(4321);

  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const val = fbm(n, (x / W) * 4.0, (y / H) * 4.0, 3, 2.0, 0.5);
      const idx = (y * W + x) * 4;
      const alpha = Math.floor(val * 180);
      img.data[idx] = 155;
      img.data[idx + 1] = 177;
      img.data[idx + 2] = 187;
      img.data[idx + 3] = alpha;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
