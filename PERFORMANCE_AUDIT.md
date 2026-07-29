# 📊 iOS Performance Audit Report

**Branch**: `perf/ios-devex-review`  
**Date**: 2026-07-29  
**Target**: iOS 18+ Safari (WebKit)  
**Device**: iPhone (iOS 24)

---

## Executive Summary

This audit identified **14 performance issues** across 4 severity levels affecting iOS Safari rendering performance. All critical and high-severity issues have been resolved in this branch.

### Key Results

| Metric | Before | After |
|---|---|---|
| **JS Bundle (total)** | ~2MB+ (incl. Three.js risk) | **736 KB** (25 chunks) |
| **Unused Images Removed** | — | **93 files, 54.3 MB freed** |
| **Three.js Dead Code** | 85 MB in node_modules | **Removed (0 MB)** |
| **Backdrop-blur instances (mobile)** | 30+ at 40-72px | **Reduced to 12px on touch** |
| **Background layers (mobile)** | 5 layers (parallax + blur + blend) | **1 layer (CSS gradient)** |
| **Star animations (mobile)** | 40 stars + 2 shooting stars | **15 stars, 0 shooting** |
| **Images with lazy loading** | 0 | **41 images** |

---

## Issues Found & Resolution Status

### 🔴 CRITICAL

| # | Issue | Status | Fix |
|---|---|---|---|
| 1 | 4x 3.3MB PNG backgrounds (`bg_*.png`) not referenced | ✅ Removed | Deleted as unused assets |
| 2 | 5-layer parallax compositing active on mobile | ✅ Fixed | Conditional unmount: only render UI layer on mobile |
| 3 | `blur(130px)` + `blur(150px)` infinite animation on mobile | ✅ Fixed | Replaced with CSS radial-gradient on mobile |
| 4 | 30+ `backdrop-filter: blur(40px+)` on iOS Safari | ✅ Fixed | Reduced to `blur(12px)` on touch devices via `@media (hover: none)` |

### 🟠 HIGH

| # | Issue | Status | Fix |
|---|---|---|---|
| 5 | 40 star animations with `box-shadow` in keyframes | ✅ Fixed | Reduced to 15 on mobile, removed box-shadow from keyframes |
| 6 | `filter: blur(20px)` in Framer Motion exit animations | ✅ Fixed | Removed blur, kept opacity+scale only |
| 7 | Three.js dead code (85MB, 0 imports) | ✅ Fixed | Removed all 5 packages from dependencies |
| 8 | EmberParticles: 20 particles on mobile | ✅ Fixed | Reduced to 8 on mobile |

### 🟡 MEDIUM

| # | Issue | Status | Fix |
|---|---|---|---|
| 9 | No image lazy loading (41 images) | ✅ Fixed | Added `loading="lazy" decoding="async"` |
| 10 | No LCP image priority hint | ✅ Fixed | Added `fetchpriority="high"` to hero-bg |
| 11 | `transition: all` on premium-card | ✅ Fixed | Changed to specific properties on mobile |
| 12 | No `prefers-reduced-motion` support | ✅ Fixed | Added global and per-component support |

### 🟢 LOW

| # | Issue | Status | Fix |
|---|---|---|---|
| 13 | No vendor chunk splitting | ✅ Fixed | Added manual chunks: react, framer-motion, zustand |
| 14 | SVG `<feGaussianBlur>` in RadarChart | 🔲 Deferred | Low impact, cosmetic only |

---

## Build Output (After Optimization)

```
dist/index.html                                   1.15 kB │ gzip:  0.52 kB
dist/assets/index-*.css                         164.24 kB │ gzip: 22.39 kB
dist/assets/vendor-react-*.js                   181.79 kB │ gzip: 57.19 kB
dist/assets/index-*.js                          195.11 kB │ gzip: 60.58 kB
dist/assets/vendor-motion-*.js                  142.11 kB │ gzip: 46.82 kB
dist/assets/vendor-state-*.js                     0.69 kB │ gzip:  0.42 kB
(+ 19 lazy-loaded page chunks)
```

**Total JS**: ~736 KB (gzip: ~250 KB)  
**Total CSS**: 164 KB (gzip: 22 KB)  
**Built in**: 1.33s

---

## Files Modified

### Components
- `src/components/DesktopWorkspace.tsx` — Mobile layer optimization
- `src/components/CelestialOverlay.tsx` — Reduced animations, prefers-reduced-motion
- `src/components/EmberParticles.tsx` — Mobile particle reduction
- `src/components/HeroIntro.tsx` — Removed blur exit, added fetchpriority
- `src/components/GameCharacterStats.tsx` — Mobile backdrop-blur reduction

### Pages (Lazy Loading)
- `src/pages/ProjectCryptomap.tsx`
- `src/pages/ProjectNailhub.tsx`
- `src/pages/ProjectNexora.tsx`
- `src/pages/ProjectVlinkpay.tsx`
- `src/pages/ProjectDispatch.tsx`
- `src/pages/ProjectAgentRules.tsx`

### Config
- `src/index.css` — Mobile-first CSS optimizations
- `package.json` — Removed Three.js dependencies
- `vite.config.ts` — Added vendor chunk splitting

### Removed (93 unused images, 54.3 MB)
- `public/images/case-study/bg_*.png` (4 files, 13.2 MB)
- `public/images/case-study/media__*.png` (49 files, ~25 MB)
- `public/images/case-study/cryptomap_*.png` (7 files, ~5 MB)
- Various duplicates and unused variants

---

## Next Steps (Manual Verification)

1. **Lighthouse Mobile Audit** — Run on deployed preview, target ≥ 70
2. **iOS Safari Real Device** — Test scroll, transitions, idle battery
3. **Image Format Optimization** — Convert remaining 33 used images to WebP/AVIF
4. **Zustand Selector Refactor** — Use atomic selectors to reduce re-renders
