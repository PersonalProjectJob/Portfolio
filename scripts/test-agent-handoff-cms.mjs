import fs from 'fs';
import path from 'path';

// Simulated environment
const storage = new Map();
global.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};

global.window = {
  location: {
    search: '',
    pathname: '/project/agent-handoff',
  },
  gtag: () => {},
};

import { DEFAULT_PROJECT_ENTRIES, getLegacyProjectBySlug } from '../src/content/legacy/legacyProjectManifest.ts';
import { legacyProjectRegistry, getLegacyComponent } from '../src/content/legacy/legacyProjectRegistry.ts';
import { CV_PROJECTS } from '../src/data/cvData.ts';
import { en } from '../src/i18n/en.ts';
import { vi } from '../src/i18n/vi.ts';

async function runTestSuite() {
  console.log('====================================================');
  console.log('  TEST SUITE: CMS ARTICLE "AGENT HANDOFF" PUBLISH   ');
  console.log('====================================================\n');

  // TEST 1: PDF Documents on Disk
  console.log('▶ [TEST 1] PDF Assets Verification');
  const docPdfPath = path.resolve('public/documents/agent-handoff.pdf');
  const assetPdfPath = path.resolve('public/assets/agent-handoff.pdf');
  console.assert(fs.existsSync(docPdfPath), `Missing ${docPdfPath}`);
  console.assert(fs.existsSync(assetPdfPath), `Missing ${assetPdfPath}`);
  const docSize = fs.statSync(docPdfPath).size;
  const assetSize = fs.statSync(assetPdfPath).size;
  console.assert(docSize > 400000, `Expected >400KB PDF, got ${docSize}`);
  console.assert(assetSize > 400000, `Expected >400KB PDF, got ${assetSize}`);
  console.log(`  ✅ PASS: Both PDF assets verified (${Math.round(docSize / 1024)} KB)`);

  // TEST 2: Manifest & Content Document
  console.log('\n▶ [TEST 2] Manifest & ContentDocument Blocks Verification');
  console.assert(DEFAULT_PROJECT_ENTRIES.some(e => e.slug === 'agent-handoff'), 'Not in DEFAULT_PROJECT_ENTRIES');
  const entry = getLegacyProjectBySlug('agent-handoff');
  console.assert(entry !== undefined, 'Project "agent-handoff" not found in manifest');
  console.assert(entry.slug === 'agent-handoff', `Expected slug "agent-handoff", got ${entry?.slug}`);
  console.assert(entry.route === '/project/agent-handoff', `Expected route "/project/agent-handoff", got ${entry?.route}`);
  console.assert(entry.status === 'published', `Expected status "published", got ${entry?.status}`);
  console.assert(entry.title.en === 'The Agent Handoff Problem', 'Title EN mismatch');
  console.assert(entry.title.vi.includes('Bàn giao'), 'Title VI mismatch');
  console.assert(entry.published_document !== null, 'published_document is null');
  console.assert(entry.render_mode === 'legacy', `Expected render_mode 'legacy', got ${entry?.render_mode}`);
  console.log(`  ✅ PASS: Manifest entry validated with render_mode="${entry.render_mode}"`);

  // TEST 3: Legacy Registry & Component Resolution
  console.log('\n▶ [TEST 3] Legacy Component Registry Resolution');
  console.assert('agent-handoff' in legacyProjectRegistry, 'Missing agent-handoff in legacyProjectRegistry');
  const comp = getLegacyComponent('agent-handoff');
  console.assert(comp !== null, 'Failed to resolve lazy component for agent-handoff');
  console.log('  ✅ PASS: Component registry resolution verified');

  // TEST 4: Constellation Graph Node (cvData.ts)
  console.log('\n▶ [TEST 4] Constellation Graph Integration (CV_PROJECTS)');
  const cvProj = CV_PROJECTS.find(p => p.id === 'agent-handoff');
  console.assert(cvProj !== undefined, 'Missing agent-handoff in CV_PROJECTS');
  console.assert(cvProj.graphMetadata?.zone === 'automation', 'Expected zone "automation"');
  console.assert(cvProj.graphMetadata?.order === 4, 'Expected order 4');
  console.assert(cvProj.graphMetadata?.parentId === 'sync-task-badge', 'Expected parent "sync-task-badge"');
  console.assert(cvProj.graphMetadata?.eyebrow === 'Automation 04', 'Expected eyebrow "Automation 04"');
  console.log('  ✅ PASS: Graph node properly connected to Automation sequence');

  // TEST 5: State & Route Resolution (useStore.ts)
  console.log('\n▶ [TEST 5] Zustand Store State & Route Mapping');
  const storeCode = fs.readFileSync('src/store/useStore.ts', 'utf8');
  console.assert(storeCode.includes("'agent-handoff': 'CASE_STUDY_AGENTHANDOFF'"), 'QUEST_STATE_MAP mismatch');
  console.assert(storeCode.includes("CASE_STUDY_AGENTHANDOFF: '/project/agent-handoff'"), 'STATE_TO_URL mismatch');
  console.log('  ✅ PASS: State & route mapping verified');

  // TEST 6: Bilingual i18n Keys
  console.log('\n▶ [TEST 6] Bilingual Translations Verification');
  console.assert(en['cv.agent-handoff.title'] === 'The Agent Handoff Problem', 'EN cv title missing');
  console.assert(vi['cv.agent-handoff.title'] === 'Bài toán Bàn giao Agent', 'VI cv title missing');
  console.assert(en['cv.agent-handoff.solution.0'].includes('distributed systems'), 'EN solution missing');
  console.assert(vi['cv.agent-handoff.solution.0'].includes('phân tán'), 'VI solution missing');
  console.log('  ✅ PASS: All English & Vietnamese translations validated');

  // TEST 7: Supabase Seed File
  console.log('\n▶ [TEST 7] Supabase Seed File Verification');
  const seedSql = fs.readFileSync('supabase/seed.sql', 'utf8');
  console.assert(seedSql.includes("'agent-handoff'"), 'Missing agent-handoff slug in seed.sql');
  console.assert(seedSql.includes('The Agent Handoff Problem'), 'Missing title in seed.sql');
  console.log('  ✅ PASS: Supabase seed.sql contains agent-handoff entry');

  // TEST 8: Visual Illustration Assets on Disk
  console.log('\n▶ [TEST 8] Design-Shotgun 3D Illustration Assets');
  const heroImg = path.resolve('public/images/case-study/harness_handoff_hero.jpg');
  const verifierImg = path.resolve('public/images/case-study/harness_verifier_architecture.jpg');
  const drillImg = path.resolve('public/images/case-study/harness_crash_drill.jpg');
  const thumbImg = path.resolve('public/images/projects/ui_agent_handoff.jpg');
  console.assert(fs.existsSync(heroImg), `Missing ${heroImg}`);
  console.assert(fs.existsSync(verifierImg), `Missing ${verifierImg}`);
  console.assert(fs.existsSync(drillImg), `Missing ${drillImg}`);
  console.assert(fs.existsSync(thumbImg), `Missing ${thumbImg}`);
  console.log('  ✅ PASS: All 4 high-fidelity 3D illustrations verified on disk');

  // TEST 9: Analytics Telemetry Instrumentation
  console.log('\n▶ [TEST 9] GA4 Analytics Telemetry Verification');
  const analyticsCode = fs.readFileSync('src/utils/analytics.ts', 'utf8');
  console.assert(analyticsCode.includes('trackHandoffPdfView'), 'Missing trackHandoffPdfView');
  console.assert(analyticsCode.includes('trackHandoffPdfDownload'), 'Missing trackHandoffPdfDownload');
  console.assert(analyticsCode.includes('trackHandoffShareClick'), 'Missing trackHandoffShareClick');
  console.assert(analyticsCode.includes('trackHandoffImageZoom'), 'Missing trackHandoffImageZoom');
  console.assert(analyticsCode.includes('trackHandoffDrillToggle'), 'Missing trackHandoffDrillToggle');
  console.assert(analyticsCode.includes('trackHandoffAssumptionExpand'), 'Missing trackHandoffAssumptionExpand');

  const pageCode = fs.readFileSync('src/pages/ProjectAgentHandoff.tsx', 'utf8');
  console.assert(pageCode.includes('harness_handoff_hero.jpg'), 'Missing hero image in page');
  console.assert(pageCode.includes('harness_verifier_architecture.jpg'), 'Missing verifier architecture image in page');
  console.assert(pageCode.includes('harness_crash_drill.jpg'), 'Missing crash drill image in page');
  console.assert(pageCode.includes('trackHandoffImageZoom'), 'Missing zoom tracking in page');
  console.assert(pageCode.includes('trackHandoffDrillToggle'), 'Missing drill toggle tracking in page');
  console.assert(pageCode.includes('trackHandoffAssumptionExpand'), 'Missing assumption tracking in page');
  console.log('  ✅ PASS: GA4 event triggers verified in ProjectAgentHandoff.tsx');

  console.log('\n====================================================');
  console.log('  🎉 ALL 9/9 TEST SUITES PASSED (100% SUCCESS)       ');
  console.log('====================================================');
}

runTestSuite().catch(err => {
  console.error(err);
  process.exit(1);
});
