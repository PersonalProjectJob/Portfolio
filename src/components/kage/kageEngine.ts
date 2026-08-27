// =====================================================================
// MEKONG LOTUS — Three.js WebGL World Engine & Continuous Camera Rig
// Aesthetic: Luminous Mekong Sapphire & Antares Ruby
// =====================================================================

import * as THREE from 'three';
import {
  texWaterNormal,
  texLotusLeaf,
  texSkyMekong,
  texSoftGaussianGlow,
  texMist,
  mulberry32,
  clamp,
  lerp,
  damp,
  TAU,
} from './kageTextures';

export interface KageEngineInstance {
  setScrollProgress: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  onResize: () => void;
  destroy: () => void;
}

// 1. Centralized Visual Configuration
export const CONFIG = {
  colors: {
    mekongDeep: 0x071426,
    mekongMid: 0x0b2036,
    mekongHighlight: 0x123e61,
    nightBlack: 0x03070c,
    mist: 0x9bb1bb,
    lotusDeep: 0x72142c,
    lotusRuby: 0xc51d50,
    lotusEmissive: 0xff3377,
    lotusHighlight: 0xff779d,
  },
  camera: {
    fov: 40,
    near: 0.1,
    far: 500,
  },
};

export function initKageEngine(
  canvas: HTMLCanvasElement,
  onLoaded?: () => void,
  onProgress?: (progress: number) => void
): KageEngineInstance {
  // 1. Renderer Setup
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    powerPreference: 'high-performance',
    antialias: false,
    alpha: false,
    stencil: false,
    depth: true,
  });
  renderer.setPixelRatio(dpr);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.colors.nightBlack);
  scene.fog = new THREE.FogExp2(CONFIG.colors.mekongDeep, 0.011);

  const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    canvas.clientWidth / canvas.clientHeight,
    CONFIG.camera.near,
    CONFIG.camera.far
  );

  onProgress?.(15);

  // 2. Procedural Textures & Shaders
  const tWater = texWaterNormal(1024, 1024);
  const tLeaf = texLotusLeaf(512, 512);
  const tSky = texSkyMekong(2048, 1024);
  const tRubyGlow = texSoftGaussianGlow('rgba(255, 51, 119, 1)', 'rgba(197, 29, 80, 0)');
  const tAmberGlow = texSoftGaussianGlow('rgba(255, 170, 51, 1)', 'rgba(255, 100, 20, 0)');
  const tMist = texMist(512, 512);

  function wrapTex(c: HTMLCanvasElement, repX = 1, repY = 1): THREE.CanvasTexture {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repX, repY);
    return t;
  }

  const waterNorm = wrapTex(tWater.normal, 12, 12);
  const waterMap = wrapTex(tWater.map, 12, 12);
  const leafMap = new THREE.CanvasTexture(tLeaf);
  const skyTex = new THREE.CanvasTexture(tSky);
  const rubyGlowTex = new THREE.CanvasTexture(tRubyGlow);
  const amberGlowTex = new THREE.CanvasTexture(tAmberGlow);
  const mistTex = wrapTex(tMist, 2, 2);

  onProgress?.(35);

  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  // 3. Sky Dome & Celestial Horizon
  const skyGeo = new THREE.CylinderGeometry(220, 220, 160, 32, 1, true);
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTex,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  skyMesh.position.y = 45;
  worldGroup.add(skyMesh);

  // Celestial Crescent Moon
  const moonGeo = new THREE.PlaneGeometry(28, 28);
  const moonMat = new THREE.MeshBasicMaterial({
    map: amberGlowTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: 0x90ccff,
  });
  const moon = new THREE.Mesh(moonGeo, moonMat);
  moon.position.set(-65, 75, -140);
  worldGroup.add(moon);

  // 4. Liquid Water Surface (Sông Hậu Sapphire)
  const waterGeo = new THREE.PlaneGeometry(280, 280, 48, 48);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x061424,
    map: waterMap,
    normalMap: waterNorm,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughness: 0.08,
    metalness: 0.86,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.y = 0;
  worldGroup.add(waterMesh);

  // Subtle Atmospheric River Mist Plane
  const mistGeo = new THREE.PlaneGeometry(240, 240);
  mistGeo.rotateX(-Math.PI / 2);
  const riverMistMat = new THREE.MeshBasicMaterial({
    map: mistTex,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    color: CONFIG.colors.mist,
  });
  const mistMesh = new THREE.Mesh(mistGeo, riverMistMat);
  mistMesh.position.y = 0.4;
  worldGroup.add(mistMesh);

  onProgress?.(55);

  // 5. Hero Ruby Lotus (18 Ceremonial Dimensional Petals)
  function buildHeroRubyLotus() {
    const lotus = new THREE.Group();

    // Floating Lotus Base Leaf
    const padGeo = new THREE.CylinderGeometry(4.8, 4.8, 0.15, 32);
    const padMat = new THREE.MeshStandardMaterial({
      map: leafMap,
      roughness: 0.35,
      metalness: 0.4,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.08;
    lotus.add(pad);

    // Central Golden Seed Pod
    const podGeo = new THREE.CylinderGeometry(1.4, 0.9, 0.8, 16);
    const podMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.8,
    });
    const pod = new THREE.Mesh(podGeo, podMat);
    pod.position.y = 0.48;
    lotus.add(pod);

    // Glowing Candle Flame Core
    const flameGeo = new THREE.SphereGeometry(0.48, 16, 16);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffea66,
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 1.05;
    lotus.add(flame);

    // Additive Ruby Core Halo
    const haloGeo = new THREE.PlaneGeometry(4.2, 4.2);
    const haloMat = new THREE.MeshBasicMaterial({
      map: rubyGlowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 1.15;
    lotus.add(halo);

    // Local Lotus Ruby Point Light
    const rubyLight = new THREE.PointLight(CONFIG.colors.lotusEmissive, 3.8, 35);
    rubyLight.position.y = 1.2;
    lotus.add(rubyLight);

    // Petal Materials
    const innerPetalMat = new THREE.MeshStandardMaterial({
      color: CONFIG.colors.lotusDeep,
      emissive: new THREE.Color(CONFIG.colors.lotusEmissive),
      emissiveIntensity: 0.85,
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.96,
    });

    const midPetalMat = new THREE.MeshStandardMaterial({
      color: CONFIG.colors.lotusRuby,
      emissive: new THREE.Color(CONFIG.colors.lotusEmissive),
      emissiveIntensity: 0.65,
      roughness: 0.4,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.94,
    });

    const outerPetalMat = new THREE.MeshStandardMaterial({
      color: CONFIG.colors.lotusDeep,
      emissive: new THREE.Color(CONFIG.colors.lotusRuby),
      emissiveIntensity: 0.45,
      roughness: 0.45,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });

    // 18 Visible Petals: 6 Inner, 6 Middle, 6 Outer
    const innerPivots: THREE.Group[] = [];
    const midPivots: THREE.Group[] = [];
    const outerPivots: THREE.Group[] = [];

    // Inner Layer (6 Petals)
    const inGeo = new THREE.ConeGeometry(1.2, 3.8, 4);
    inGeo.scale(0.85, 1.0, 0.22);
    inGeo.translate(0, 1.9, 0);

    for (let i = 0; i < 6; i++) {
      const pivot = new THREE.Group();
      pivot.position.set(0, 0.4, 0);
      pivot.rotation.y = (i / 6) * TAU;

      const pMesh = new THREE.Mesh(inGeo, innerPetalMat);
      pMesh.position.set(0, 0, 1.0);
      pMesh.rotation.x = 0.2;
      pivot.add(pMesh);

      lotus.add(pivot);
      innerPivots.push(pivot);
    }

    // Middle Layer (6 Petals)
    const midGeo = new THREE.ConeGeometry(1.5, 4.6, 4);
    midGeo.scale(0.9, 1.0, 0.22);
    midGeo.translate(0, 2.3, 0);

    for (let i = 0; i < 6; i++) {
      const pivot = new THREE.Group();
      pivot.position.set(0, 0.35, 0);
      pivot.rotation.y = (i / 6) * TAU + Math.PI / 6;

      const pMesh = new THREE.Mesh(midGeo, midPetalMat);
      pMesh.position.set(0, 0, 1.6);
      pMesh.rotation.x = 0.32;
      pivot.add(pMesh);

      lotus.add(pivot);
      midPivots.push(pivot);
    }

    // Outer Layer (6 Petals)
    const outGeo = new THREE.ConeGeometry(1.8, 5.4, 4);
    outGeo.scale(0.95, 1.0, 0.2);
    outGeo.translate(0, 2.7, 0);

    for (let i = 0; i < 6; i++) {
      const pivot = new THREE.Group();
      pivot.position.set(0, 0.28, 0);
      pivot.rotation.y = (i / 6) * TAU + Math.PI / 12;

      const pMesh = new THREE.Mesh(outGeo, outerPetalMat);
      pMesh.position.set(0, 0, 2.3);
      pMesh.rotation.x = 0.45;
      pivot.add(pMesh);

      lotus.add(pivot);
      outerPivots.push(pivot);
    }

    lotus.position.set(0, 0.1, 0);
    return {
      group: lotus,
      halo,
      rubyLight,
      innerPetalMat,
      midPetalMat,
      outerPetalMat,
      innerPivots,
      midPivots,
      outerPivots,
    };
  }

  const heroLotus = buildHeroRubyLotus();
  worldGroup.add(heroLotus.group);

  onProgress?.(70);

  // 6. Instanced Lotus Field (Leaves & Secondary Lotuses)
  const LEAF_COUNT = 42;
  const instLeafGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.1, 24);
  const instLeafMat = new THREE.MeshStandardMaterial({
    map: leafMap,
    roughness: 0.45,
    metalness: 0.3,
  });
  const leafFieldMesh = new THREE.InstancedMesh(instLeafGeo, instLeafMat, LEAF_COUNT);
  const leafDummy = new THREE.Object3D();
  const rndLeaf = mulberry32(7719);

  const leafPositions: { pos: THREE.Vector3; scale: number; rotY: number }[] = [];
  for (let i = 0; i < LEAF_COUNT; i++) {
    const angle = rndLeaf() * TAU;
    const dist = 7 + rndLeaf() * 65;
    const x = Math.cos(angle) * dist;
    const z = -dist * 0.7 + (rndLeaf() - 0.5) * 30;
    const scale = 0.6 + rndLeaf() * 0.8;
    const rotY = rndLeaf() * TAU;

    leafDummy.position.set(x, 0.05, z);
    leafDummy.scale.set(scale, 1, scale);
    leafDummy.rotation.set((rndLeaf() - 0.5) * 0.08, rotY, (rndLeaf() - 0.5) * 0.08);
    leafDummy.updateMatrix();
    leafFieldMesh.setMatrixAt(i, leafDummy.matrix);

    leafPositions.push({ pos: new THREE.Vector3(x, 0.05, z), scale, rotY });
  }
  leafFieldMesh.instanceMatrix.needsUpdate = true;
  worldGroup.add(leafFieldMesh);

  // Secondary Distant Lotus Group (12 Flowers)
  const SEC_LOTUS_COUNT = 12;
  const secLotusGeo = new THREE.ConeGeometry(1.2, 2.8, 5);
  secLotusGeo.scale(0.9, 1, 0.9);
  const secLotusMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.lotusDeep,
    emissive: new THREE.Color(CONFIG.colors.lotusRuby),
    emissiveIntensity: 0.4,
    roughness: 0.5,
  });
  const secLotusMesh = new THREE.InstancedMesh(secLotusGeo, secLotusMat, SEC_LOTUS_COUNT);
  const secDummy = new THREE.Object3D();
  const rndSec = mulberry32(3102);

  for (let i = 0; i < SEC_LOTUS_COUNT; i++) {
    const angle = rndSec() * TAU;
    const dist = 14 + rndSec() * 55;
    const x = Math.cos(angle) * dist;
    const z = -dist * 0.8 + (rndSec() - 0.5) * 25;
    const s = 0.5 + rndSec() * 0.6;

    secDummy.position.set(x, 0.35 * s, z);
    secDummy.scale.set(s, s, s);
    secDummy.rotation.y = rndSec() * TAU;
    secDummy.updateMatrix();
    secLotusMesh.setMatrixAt(i, secDummy.matrix);
  }
  secLotusMesh.instanceMatrix.needsUpdate = true;
  worldGroup.add(secLotusMesh);

  // 7. Sparse Floating Atmospheric Particles (Starlight / Firefly Dust)
  const DUST_COUNT = 48;
  const dustGeo = new THREE.PlaneGeometry(1.2, 1.2);
  const dustMat = new THREE.MeshBasicMaterial({
    map: amberGlowTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: 0x99ddff,
  });
  const dustMesh = new THREE.InstancedMesh(dustGeo, dustMat, DUST_COUNT);
  const dustDummy = new THREE.Object3D();
  const dustData: { pos: THREE.Vector3; speed: number; phase: number }[] = [];
  const rndDust = mulberry32(8841);

  for (let i = 0; i < DUST_COUNT; i++) {
    const bp = new THREE.Vector3(
      (rndDust() - 0.5) * 60,
      0.6 + rndDust() * 6.5,
      (rndDust() - 0.5) * 85
    );
    dustData.push({
      pos: bp,
      speed: 0.6 + rndDust() * 1.4,
      phase: rndDust() * TAU,
    });
  }
  worldGroup.add(dustMesh);

  // 8. Lighting System
  const ambLight = new THREE.AmbientLight(CONFIG.colors.mekongMid, 2.6);
  scene.add(ambLight);

  const moonLight = new THREE.DirectionalLight(0x90ccff, 2.2);
  moonLight.position.set(-65, 75, -140);
  scene.add(moonLight);

  onProgress?.(85);

  // 9. Continuous Catmull-Rom Camera Spline (Chapters 01 - 05)
  // Chapter 01 (Awakening 0%→18%): Low water level, distant small ruby light
  // Chapter 02 (The River 18%→38%): Gliding forward over dark sapphire water
  // Chapter 03 (Lotus Climax 38%→62%): Approach hero ruby lotus, occupying 35-55% viewport
  // Chapter 04 (Lotus Field 62%→84%): Traveling through instanced lotus field
  // Chapter 05 (Afterglow 84%→100%): Rising vertically into serene overview
  const waypoints = [
    new THREE.Vector3(0, 1.1, 42),       // Ch 1: Awakening (low to water)
    new THREE.Vector3(3.2, 1.8, 22),     // Ch 2: The River (gliding forward)
    new THREE.Vector3(-1.4, 2.4, 6.5),   // Ch 3: Lotus Climax (intimate hero view)
    new THREE.Vector3(4.5, 4.2, -14),    // Ch 4: Lotus Field (passing through leaves)
    new THREE.Vector3(0, 16.5, 4),       // Ch 5: Afterglow (rising vertical overview)
  ];

  const lookPoints = [
    new THREE.Vector3(0, 1.6, 0),        // Look towards hero lotus
    new THREE.Vector3(0, 1.8, 0),        // Look towards hero lotus
    new THREE.Vector3(0, 1.9, 0),        // Focused on hero lotus core
    new THREE.Vector3(0, 2.2, -28),      // Look deep into lotus field
    new THREE.Vector3(0, 0, -12),        // Wide top-down contemplative view
  ];

  const cameraCurve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.25);
  const lookCurve = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.25);

  // 10. Post-Processing Setup
  const rtScene = new THREE.WebGLRenderTarget(canvas.clientWidth * dpr, canvas.clientHeight * dpr, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    type: THREE.HalfFloatType,
  });

  const postScene = new THREE.Scene();
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const postMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: rtScene.texture },
      uTime: { value: 0 },
      uVignette: { value: 0.28 },
      uAberration: { value: 0.001 },
      uGrain: { value: 0.03 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform float uVignette;
      uniform float uAberration;
      uniform float uGrain;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      vec3 aces(vec3 x) {
        float a = 2.51;
        float b = 0.03;
        float c = 2.43;
        float d = 0.59;
        float e = 0.14;
        return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
      }

      void main() {
        vec2 uv = vUv;
        vec2 dir = uv - 0.5;
        float dist = length(dir);

        // Subtle chromatic aberration
        vec2 ca = dir * (uAberration * dist);
        float r = texture2D(tDiffuse, uv + ca).r;
        float g = texture2D(tDiffuse, uv).g;
        float b = texture2D(tDiffuse, uv - ca).b;
        vec3 col = vec3(r, g, b);

        // ACES Filmic Tone Mapping (Lifted shadows)
        col = aces(col * 1.02);

        // Restrained Vignette
        float vig = 1.0 - smoothstep(0.45, 1.4, dist * uVignette * 2.2);
        col *= vig;

        // Subtle Film Grain
        float grain = (hash(uv + fract(uTime * 0.01)) - 0.5) * uGrain;
        col += grain;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    depthWrite: false,
    depthTest: false,
  });

  const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
  postScene.add(postQuad);

  onProgress?.(100);
  onLoaded?.();

  // 11. State & Render Loop
  let curScroll = 0;
  let targetScroll = 0;
  let pointerX = 0;
  let pointerY = 0;
  let curPointerX = 0;
  let curPointerY = 0;
  let isDead = false;
  let lastTime = performance.now();
  let rafId = 0;

  function render(time: number) {
    if (isDead) return;
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;
    const tSec = time * 0.001;

    // Smooth Scroll Damping (60 FPS feel)
    curScroll = damp(curScroll, targetScroll, 4.2, dt);
    curPointerX = damp(curPointerX, pointerX, 4.5, dt);
    curPointerY = damp(curPointerY, pointerY, 4.5, dt);

    const s = clamp(curScroll, 0, 0.999);

    // Continuous Camera Spline
    const camPos = cameraCurve.getPoint(s);
    const lookPos = lookCurve.getPoint(s);

    // Subtle parallax response
    camPos.x += curPointerX * 0.75;
    camPos.y += curPointerY * 0.4;

    camera.position.copy(camPos);
    camera.lookAt(lookPos);

    // Liquid Water Wave Animation (Sông Hậu Flow)
    waterNorm.offset.x = tSec * 0.012;
    waterNorm.offset.y = tSec * 0.007;

    // Hero Ruby Lotus Choreography
    // Awakening (0%): emissive 0.5, petalOpen 0.0
    // Mid (40%): emissive 1.2, petalOpen 0.65
    // Peak (50%): emissive 1.4, petalOpen 0.85
    // Exit (80%+): emissive 0.9, petalOpen 1.0
    let bloom = 0;
    let emissivePower = 0.5;

    if (s < 0.2) {
      bloom = (s / 0.2) * 0.25;
      emissivePower = lerp(0.5, 0.8, s / 0.2);
    } else if (s < 0.55) {
      const p = (s - 0.2) / 0.35;
      bloom = lerp(0.25, 0.9, p);
      emissivePower = lerp(0.8, 1.4, p);
    } else {
      const p = (s - 0.55) / 0.45;
      bloom = lerp(0.9, 1.0, p);
      emissivePower = lerp(1.4, 0.85, p);
    }

    // Lotus Rotation (Subtle 0° -> 8°)
    heroLotus.group.rotation.y = lerp(0, 0.14, s) + curPointerX * 0.08;
    heroLotus.group.position.y = 0.1 + Math.sin(tSec * 1.5) * 0.06;
    heroLotus.halo.lookAt(camera.position);

    // Dynamic emissive intensity
    heroLotus.innerPetalMat.emissiveIntensity = emissivePower * 0.95;
    heroLotus.midPetalMat.emissiveIntensity = emissivePower * 0.75;
    heroLotus.outerPetalMat.emissiveIntensity = emissivePower * 0.55;
    heroLotus.rubyLight.intensity = emissivePower * 3.2;

    // Unfold Inner Petals
    const inAngle = 0.2 + 0.5 * bloom;
    heroLotus.innerPivots.forEach((p) => {
      const m = p.children[0] as THREE.Mesh;
      if (m) m.rotation.x = inAngle;
    });

    // Unfold Middle Petals
    const midAngle = 0.32 + 0.75 * bloom;
    heroLotus.midPivots.forEach((p) => {
      const m = p.children[0] as THREE.Mesh;
      if (m) m.rotation.x = midAngle;
    });

    // Unfold Outer Petals
    const outAngle = 0.45 + 0.95 * bloom;
    heroLotus.outerPivots.forEach((p) => {
      const m = p.children[0] as THREE.Mesh;
      if (m) m.rotation.x = outAngle;
    });

    // Atmospheric Starlight / Dust Drift
    for (let i = 0; i < DUST_COUNT; i++) {
      const dd = dustData[i];
      dd.phase += dt * dd.speed;
      dustDummy.position.set(
        dd.pos.x + Math.sin(dd.phase * 0.8) * 1.4,
        dd.pos.y + Math.sin(dd.phase * 0.6) * 0.6,
        dd.pos.z + Math.cos(dd.phase * 0.7) * 1.4
      );
      const ds = 0.6 + 0.4 * Math.sin(dd.phase * 2.0);
      dustDummy.scale.set(ds, ds, ds);
      dustDummy.lookAt(camera.position);
      dustDummy.updateMatrix();
      dustMesh.setMatrixAt(i, dustDummy.matrix);
    }
    dustMesh.instanceMatrix.needsUpdate = true;

    // Render pass
    postMat.uniforms.uTime.value = tSec;
    renderer.setRenderTarget(rtScene);
    renderer.render(scene, camera);

    renderer.setRenderTarget(null);
    renderer.render(postScene, postCamera);

    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);

  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    const curDpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(curDpr);
    renderer.setSize(w, h, false);
    rtScene.setSize(w * curDpr, h * curDpr);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  return {
    setScrollProgress(p: number) {
      targetScroll = p;
    },
    setPointer(x: number, y: number) {
      pointerX = x;
      pointerY = y;
    },
    onResize,
    destroy() {
      isDead = true;
      cancelAnimationFrame(rafId);
      renderer.dispose();
      rtScene.dispose();
      scene.clear();
      postScene.clear();
    },
  };
}
