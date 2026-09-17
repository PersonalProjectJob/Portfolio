import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log('  TEST: GA4 PROJECT STATS TELEMETRY & DIMENSION VERIFICATION   ');
console.log('================================================================\n');

let passCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`▶ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`▶ [FAIL] ${name}`);
    console.error(`  Error: ${err.message}`);
  }
}

const analyticsPath = path.resolve('src/utils/analytics.ts');
const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');

const caseStudyLayoutPath = path.resolve('src/components/layout/CaseStudyLayout.tsx');
const caseStudyLayoutContent = fs.readFileSync(caseStudyLayoutPath, 'utf8');

const kageLandingPagePath = path.resolve('src/components/kage/KageLandingPage.tsx');
const kageLandingPageContent = fs.readFileSync(kageLandingPagePath, 'utf8');

const appPath = path.resolve('src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const storePath = path.resolve('src/store/useStore.ts');
const storeContent = fs.readFileSync(storePath, 'utf8');

runTest('1. PROJECT_NAME_MAP exists and contains all 10 canonical projects', () => {
  assert(analyticsContent.includes('export const PROJECT_NAME_MAP: Record<string, string> = {'), 'PROJECT_NAME_MAP not found');
  const expectedProjects = [
    'agent-handoff',
    'nexora',
    'dispatch',
    'agent-rules',
    'sync-task-badge',
    'cryptomap',
    'handoff',
    'ai-process',
    'vlinkpay',
    'nailhub'
  ];
  for (const pid of expectedProjects) {
    assert(analyticsContent.includes(`'${pid}':`), `Missing project in PROJECT_NAME_MAP: ${pid}`);
  }
  // Ensure Kage is NOT included in PROJECT_NAME_MAP
  assert(!analyticsContent.includes("'kage':"), 'Kage should not be in PROJECT_NAME_MAP');
  assert(analyticsContent.includes("'agent-handoff': 'Agent Handoff'"), 'agent-handoff mapping incorrect');
});

runTest('2. trackProjectView emits project_name in both project_view and select_content', () => {
  assert(analyticsContent.includes("trackEvent('project_view'"), 'project_view event not found');
  assert(analyticsContent.includes('project_name: projectName'), 'project_name missing from trackProjectView');
  assert(analyticsContent.includes("trackEvent('select_content'"), 'select_content event not found in trackProjectView');
});

runTest('3. Handoff article actions emit project_id and project_name', () => {
  const actions = [
    'trackHandoffPdfView',
    'trackHandoffPdfDownload',
    'trackHandoffShareClick',
    'trackHandoffImageZoom',
    'trackHandoffDrillToggle',
    'trackHandoffAssumptionExpand'
  ];
  for (const action of actions) {
    const actionBlock = analyticsContent.slice(analyticsContent.indexOf(`export function ${action}`));
    const nextFunction = actionBlock.indexOf('export function', 20);
    const code = nextFunction > 0 ? actionBlock.slice(0, nextFunction) : actionBlock;
    assert(code.includes("project_id: 'agent-handoff'"), `${action} missing project_id`);
    assert(code.includes("project_name: 'Agent Handoff'"), `${action} missing project_name`);
  }
});

runTest('4. CaseStudyLayout tracks project view on mount with trailing-slash defense', () => {
  assert(caseStudyLayoutContent.includes("trackProjectView(currentProjectId, projectName, activeLandingVariant, 'page_view')"), 'CaseStudyLayout mount tracking missing');
  assert(caseStudyLayoutContent.includes(".replace(/\\/$/, '')"), 'CaseStudyLayout missing trailing slash defense');
  assert(caseStudyLayoutContent.includes("currentProjectId !== 'kage'"), 'CaseStudyLayout should exclude kage');
});

runTest('5. KageLandingPage card click sends trackProjectView with project_name', () => {
  assert(kageLandingPageContent.includes("if (event.data.type === 'NAVIGATE_QUEST' && event.data.questId)"), 'NAVIGATE_QUEST handler missing');
  assert(kageLandingPageContent.includes("const projectName = PROJECT_NAME_MAP[questId] || questId;"), 'projectName resolution missing in KageLandingPage');
  assert(kageLandingPageContent.includes("trackProjectView(questId, projectName, 'B', 'kage_card_click');"), 'trackProjectView missing in KageLandingPage');
});

runTest('6. App.tsx passes currentProjectName to trackPageView', () => {
  assert(appContent.includes("PROJECT_NAME_MAP[questId]"), 'PROJECT_NAME_MAP lookup missing in App.tsx');
  assert(appContent.includes("trackPageView(window.location.pathname, activeLandingVariant, useStore.getState().language, currentProjectName);"), 'trackPageView call missing currentProjectName parameter');
  assert(appContent.includes("gameState !== 'CASE_STUDY_KAGE'"), 'Kage should be excluded from project name in App.tsx');
});

runTest('7. useStore handleQuestSelect emits select_content & project_view with project_name', () => {
  assert(storeContent.includes("const projectName = project?.graphMetadata?.shortName ?? PROJECT_NAME_MAP[questId] ?? questId;"), 'projectName fallback missing in useStore');
  assert(storeContent.includes('trackEvent("select_content"'), 'select_content missing in useStore');
  assert(storeContent.includes('trackEvent("project_view"'), 'project_view missing in useStore');
});

console.log('\n================================================================');
console.log(`  RESULT: ${passCount}/${totalCount} TEST SUITES PASSED (${Math.round((passCount/totalCount)*100)}%)`);
console.log('================================================================');

if (passCount !== totalCount) {
  process.exit(1);
}
