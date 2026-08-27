---
name: vietnamize-kage-webgl
description: >
  Audit and transform an existing Kage / ThreeUI scroll-driven Three.js experience
  from a Japanese Kyoto temple environment into a coherent Vietnam-themed WebGL
  world while preserving the existing landing-page structure, scroll storytelling,
  camera system, DOM content architecture, responsiveness, accessibility, and
  performance characteristics. Use this skill when modifying KageEngine,
  Three.js scene construction, procedural architecture, environment assets,
  foreground cutouts, particles, fog, lighting, or cultural motifs.
---

# Vietnamize Kage WebGL World

## 1. Mission

Transform ONLY the environmental / WebGL storytelling layer of the existing Kage-based website from Japanese visual language into a distinctly Vietnamese environment.

The existing Kage implementation is the technical foundation.
Do NOT rebuild the landing page from scratch.

Preserve unless technically necessary:
* existing HTML / React section structure;
* DOM content hierarchy;
* chapter navigation;
* scroll progression;
* scroll conductor;
* semantic markup;
* typography system;
* interaction model;
* responsive breakpoints;
* reduced-motion behavior;
* loading/fallback architecture;
* canvas stacking and foreground-layer strategy.

The main task is to replace the Japanese world with a Vietnamese world.

---

# 2. Core principle

Kage is not a collection of independent scenes.
Treat it as:
```text
ONE persistent Three.js world
+
ONE continuous scroll-controlled camera
+
multiple authored chapter compositions
+
DOM content above the WebGL canvas
+
optional foreground WebP/PNG layers
```

---

# 3. Cultural mapping

| Existing Japanese element   | Vietnamese replacement                               |
| --------------------------- | ---------------------------------------------------- |
| Torii                       | Tam quan / traditional Vietnamese temple gate        |
| Japanese shrine/temple      | Traditional Vietnamese temple or pagoda architecture |
| Japanese stone lantern      | Vietnamese lantern / architectural practical light   |
| Shoji glow                  | Warm light from wooden Vietnamese temple interior    |
| Sakura                      | Lotus petals only where physically plausible         |
| Maple leaves                | Bamboo leaves / tropical foliage                     |
| Japanese pine               | Bamboo / native tree silhouettes                     |
| Japanese guardian           | Vietnamese Nghê                                      |
| Vermilion moon motif        | Moon OR subtle Đông Sơn disc motif                   |
| Japanese garden             | Lotus pond / stone courtyard / bamboo path           |
| Japanese mountain temple    | Misty Vietnamese sacred landscape                    |
| Japanese patterns           | Đông Sơn-inspired geometric patterns                 |
| Japanese foreground cutout  | Bamboo, lotus, rock, Vietnamese roof silhouettes     |
| Japanese roof silhouette    | Vietnamese curved tiled roof                         |
| Japanese red shrine palette | Wood, aged lacquer, tile, stone, bronze accents      |

---

# 4. Vietnam World Direction: "Vietnamese Heritage Night Journey"

Primary environmental language:
* Traditional Vietnamese temple architecture (Tam Quan gate, curved Vietnamese tiled roofs, wood columns, stone courtyards)
* Lotus pond, bamboo clusters, stone paving
* Humid tropical misty atmosphere, low haze, warm lantern light
* Đông Sơn geometric motifs & Vietnamese Nghê guardian sculptures

---

# 5. Chapter Transformation

* **Chapter 00 (Hero)**: Misty Vietnamese landscape, distant curved roof silhouette, bamboo foreground, subtle moon, warm glowing lanterns.
* **Chapter 01 (Threshold)**: Tam Quan gate with curved tile eaves and 3 arched portals, stone steps, Nghê statues, warm practical lanterns.
* **Chapter 02 (Garden / Water)**: Lotus pond, reflective water plane with normal-map ripples, bamboo grove, mist.
* **Chapter 03 (Sacred Architecture)**: Vietnamese temple/pagoda pavilion with raised curved roof corners, deep eaves, dark ceramic tiles, aged wood columns.
* **Chapter 04 (Cultural Detail)**: Đông Sơn bronze disc motif / Vietnamese Nghê stone carving in warm ambient lighting.
* **Final Chapter (Afterlight)**: Distant temple silhouette, mist, water reflections, warm fading lanterns.
