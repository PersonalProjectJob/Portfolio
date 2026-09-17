# First-Party UX Telemetry & Data-Informed UX Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a first-party, privacy-friendly, zero-cost, ultra-lightweight (< 3KB) UX Telemetry & Analytics Engine that measures granular reader engagement across portfolio case studies (Section Dwell Time, Scroll Depth, Rage/Dead Clicks, Reader Persona Segmentation) and delivers an **Admin UX Lab** (`/admin/ux-lab`) featuring Attention Heat Strips, Drop-off Reading Funnels, and AI UX Design Critiques.

**Architecture:** Client-side non-blocking collector (`IntersectionObserver` + Pointer events) buffering events in `localStorage` and flushing via `navigator.sendBeacon`, aggregated through `uxAnalyticsRepository.ts`, surfaced via an Apple HIG / Glassmorphism Admin UX Lab, and analyzed by an offline heuristic `aiUxCritiqueService.ts`.

**Tech Stack:** TypeScript, React 18, Tailwind CSS, Lucide Icons, Framer Motion, standard Web APIs (`IntersectionObserver`, `sendBeacon`), Node.js test runners.

---

## Global Constraints

- Bundle impact must remain under 3KB gzipped for the public client bundle (Zero 3rd party tracker bloat).
- Zero PII (Personal Identifiable Information): No IPs, no keystrokes, completely GDPR compliant.
- No layout thrashing: All viewport measurements use `IntersectionObserver` with passive listeners.
- Offline-first & zero-cost: Runs seamlessly in `localStorage` fallback without mandatory external SaaS subscriptions.
- Visual standards: Apple HIG Glassmorphism, dark/light theme parity, high-contrast accessible typography.
- Quality Gates: 0 `oxlint` errors, 0 `tsc -b` errors, successful `vite build`, and 100% PASS on automated test suites.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/uxTelemetry/types.ts` | Data types for sessions, section dwell time, rage clicks, dead clicks, reader segments. |
| `src/lib/uxTelemetry/collector.ts` | Non-blocking IntersectionObserver for section dwell time, rage click detector (3+ rapid clicks in 700ms within 30px), dead click detector. |
| `src/lib/uxTelemetry/dispatcher.ts` | Event buffer queue, periodic debounce flush (5s), and unload beacon dispatcher with localStorage persistence. |
| `src/lib/uxTelemetry/index.ts` | Public API facade (`initUxTelemetry`, `observeSection`, `recordUxEvent`, `getUxSessionId`, `destroyUxTelemetry`). |
| `src/cms/repositories/uxAnalyticsRepository.ts` | Aggregates raw UX telemetry into section dwell heat, reading drop-off funnel, reader segmentation (skimmer, scanner, deep_reader), and friction alerts. |
| `src/cms/services/aiUxCritiqueService.ts` | Offline heuristic AI generating 3 concrete UX critiques & actionable design recommendations based on empirical telemetry. |
| `src/components/layout/CaseStudyLayout.tsx` | Instruments case studies with section boundary observers (`data-ux-section`), dwell tracker, and telemetry lifecycle. |
| `src/routes/ProjectAgentHandoff.tsx` | Adds explicit `data-ux-section` tags across Hero, Problem, Architecture, Protocols, and Impact sections. |
| `src/admin/routes/AdminUxLab.tsx` | High-fidelity Glassmorphism UX Lab with Case Study selector, Attention Heat Strip, Reading Funnel chart, Friction Radar list, and AI Critique modal. |
| `src/admin/AdminApp.tsx` | Wires `/admin/ux-lab` route, sidebar navigation item with `Activity` icon and `UX Lab` badge. |
| `src/admin/routes/AdminDashboard.tsx` | Adds Quick Action link navigating directly to UX Lab. |
| `scripts/test-ux-telemetry-collector.mjs` | Automated unit test suite verifying collector algorithms (dwell time, rage click detection, session creation). |
| `scripts/test-ux-analytics-repository.mjs` | Automated integration test suite verifying data aggregation, heat strips, reading funnels, and AI critique. |
| `scripts/test-qa-ux-telemetry.mjs` | Playwright browser test validating live telemetry collection, rage click triggering, and Admin UX Lab rendering. |

---

### Task 1: Core UX Telemetry Engine (`src/lib/uxTelemetry/`)

**Files:**
- Create: `src/lib/uxTelemetry/types.ts`
- Create: `src/lib/uxTelemetry/collector.ts`
- Create: `src/lib/uxTelemetry/dispatcher.ts`
- Create: `src/lib/uxTelemetry/index.ts`
- Test: `scripts/test-ux-telemetry-collector.mjs`

**Interfaces:**
- Produces: `UxSession`, `UxSectionDwell`, `UxFrictionEvent`, `initUxTelemetry()`, `observeSection()`, `destroyUxTelemetry()`, `getStoredUxSessions()`, `getStoredUxEvents()`, `resetUxTelemetry()`

- [ ] **Step 1: Write the failing unit test for UX Telemetry collector**
  - Create `scripts/test-ux-telemetry-collector.mjs` checking type exports, rage click detection, dwell time calculation, and local storage buffering.
- [ ] **Step 2: Run test to confirm failure**
  - `node scripts/test-ux-telemetry-collector.mjs` fails (module not found).
- [ ] **Step 3: Implement `types.ts`, `collector.ts`, `dispatcher.ts`, `index.ts`**
  - Implement non-blocking `IntersectionObserver` tracking section enter/exit timestamps.
  - Implement rage click detection: 3+ clicks within 700ms and 30px radius.
  - Implement dead click detection: clicks on non-interactive elements without selection change.
  - Implement buffer flush to `localStorage` (key: `portfolio_ux_events_v1`, `portfolio_ux_sessions_v1`) capped at 1000 events.
- [ ] **Step 4: Run unit test to confirm pass**
  - `node scripts/test-ux-telemetry-collector.mjs` passes 100%.

---

### Task 2: UX Analytics Repository & AI UX Critique Service

**Files:**
- Create: `src/cms/repositories/uxAnalyticsRepository.ts`
- Create: `src/cms/services/aiUxCritiqueService.ts`
- Test: `scripts/test-ux-analytics-repository.mjs`

**Interfaces:**
- Consumes: `UxSession`, `UxSectionDwell`, `UxFrictionEvent` from `src/lib/uxTelemetry/types.ts`
- Produces:
  - `getUxProjectSummary(projectSlug, timeRange): UxProjectSummary`
  - `getSectionHeatMap(projectSlug): SectionHeatPoint[]`
  - `getUxReadingFunnel(projectSlug): UxFunnelStep[]`
  - `getFrictionAlerts(projectSlug): UxFrictionAlert[]`
  - `generateAiUxCritique(summary: UxProjectSummary): AiUxCritique`

- [ ] **Step 1: Write failing integration test**
  - Create `scripts/test-ux-analytics-repository.mjs` asserting correct computation of completion rates, dwell percentiles, heat scores (0-100), and AI critique heuristics.
- [ ] **Step 2: Run test to confirm failure**
  - `node scripts/test-ux-analytics-repository.mjs` fails.
- [ ] **Step 3: Implement `uxAnalyticsRepository.ts` and `aiUxCritiqueService.ts`**
  - Compute completion rate (% sessions reaching final section).
  - Compute normalized attention heat (hot / warm / cold) per section based on dwell time relative to content length.
  - Segment readers: Skimmer (<30s total or <5s/section), Scanner (30-90s, high scroll velocity), Deep Reader (>90s, balanced dwell).
  - Generate AI UX Critique: 3 actionable design cards (`Engagement Hook`, `Friction Point`, `Recommended Design Polish`).
- [ ] **Step 4: Run integration test to confirm pass**
  - `node scripts/test-ux-analytics-repository.mjs` passes 100%.

---

### Task 3: Case Study & Landing Page Instrumentation

**Files:**
- Modify: `src/components/layout/CaseStudyLayout.tsx`
- Modify: `src/routes/ProjectAgentHandoff.tsx`
- Modify: `src/components/kage/KageLandingPage.tsx`
- Test: `scripts/test-ux-instrumentation.mjs`

**Interfaces:**
- Consumes: `initUxTelemetry()`, `observeSection()`, `destroyUxTelemetry()`

- [ ] **Step 1: Write instrumentation test**
  - Create `scripts/test-ux-instrumentation.mjs` verifying DOM elements carry required `data-ux-section` attributes and lifecycle hooks are bound.
- [ ] **Step 2: Update `CaseStudyLayout.tsx`**
  - Mount `initUxTelemetry({ pageSlug })` on component mount, observe all child elements containing `data-ux-section`, and tear down on unmount.
- [ ] **Step 3: Update `ProjectAgentHandoff.tsx`**
  - Add section markers: `hero`, `problem_statement`, `system_architecture`, `interaction_protocol`, `impact_metrics`.
- [ ] **Step 4: Update `KageLandingPage.tsx`**
  - Instrument chapter views (`chapter_00_hero`, `chapter_01_identity`, `chapter_02_mosaic_projects`, `chapter_03_craft_matrix`, `chapter_04_contact_hub`).
- [ ] **Step 5: Run instrumentation test**
  - `node scripts/test-ux-instrumentation.mjs` passes.

---

### Task 4: Admin UX Lab UI & Route Integration

**Files:**
- Create: `src/admin/routes/AdminUxLab.tsx`
- Modify: `src/admin/AdminApp.tsx`
- Modify: `src/admin/routes/AdminDashboard.tsx`

**Interfaces:**
- Consumes: `uxAnalyticsRepository.ts`, `aiUxCritiqueService.ts`

- [ ] **Step 1: Build `AdminUxLab.tsx`**
  - Header: Breadcrumb, Live UX Telemetry badge, Case Study selector dropdown, Time-range filter (`24h`, `7d`, `30d`, `all`), Export Report button, Safe Reset data button.
  - KPI Overview Grid: Total UX Readers, Avg Dwell Time, Completion Rate, Reader Segmentation Bar (Skimmer / Scanner / Deep Reader), Total Friction Alerts.
  - Attention Heat Strip: Visual horizontal/vertical ruler showing section intensity (gradient from cyan to emerald to amber to rose) with hover inspection of dwell seconds.
  - Reading Drop-off Funnel: Visual step-down bars showing retention at each milestone.
  - Friction Radar List: Real-time table of detected Rage Clicks & Dead Clicks with target element and context.
  - AI UX Critique Section: 3 strategic design cards with actionable recommendations and 1-click Markdown Critique Modal.
- [ ] **Step 2: Wire Route into `AdminApp.tsx`**
  - Add `AdminRoute = ... | 'ux-lab'`.
  - Add navigation item in Sidebar with `Activity` icon and `UX Lab` pill badge.
  - Render `<AdminUxLab />` when route is active.
- [ ] **Step 3: Update `AdminDashboard.tsx`**
  - Add Quick Action card: `UX Lab & Heatmaps`.
- [ ] **Step 4: Verify Type-safety & Build**
  - `oxlint` (0 errors), `tsc -b` (0 errors), `vite build` (PASS).

---

### Task 5: End-to-End Browser Dogfooding & Verification

**Files:**
- Create: `scripts/test-qa-ux-telemetry.mjs`

- [ ] **Step 1: Run automated Playwright headless dogfooding**
  - Simulate user reading `agent-handoff`: slow scroll through Problem, pausing on Architecture, rapid double-clicks to trigger Rage Click.
  - Navigate to `/admin/ux-lab`: verify Heat Strip renders, Drop-off funnel renders, Rage Click shows up in Friction list.
  - Open AI UX Critique modal and copy report.
  - Assert 0 console errors.
- [ ] **Step 2: Run harness verification**
  - `node C:\Users\AD\Documents\GitHub\skill-repo-vlink\harness/bin/harness-verify.mjs` (VERDICT: PASS).
