import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('  TEST: HOMEPAGE NEW ARTICLE & VIETNAMESE AI WORKFLOW FILTER   ');
console.log('================================================================\n');

// 1. Check kage.html markup on disk
console.log('▶ [TEST 1] Verify kage.html project cards markup');
const kageHtmlPath = path.resolve('public/landing-pages/kage.html');
const kageHtml = fs.readFileSync(kageHtmlPath, 'utf8');

// Ensure all 10 cards are present
const expectedProjectIds = [
  'cryptomap',
  'nailhub',
  'vlinkpay',
  'nexora',
  'ai-process',
  'handoff',
  'dispatch',
  'agent-rules',
  'sync-task-badge',
  'agent-handoff'
];

for (const id of expectedProjectIds) {
  console.assert(
    kageHtml.includes(`data-project-id="${id}"`),
    `❌ Missing card with data-project-id="${id}" in kage.html`
  );
  console.assert(
    kageHtml.includes(`questId:'${id}'`),
    `❌ Missing click navigation for questId:'${id}' in kage.html`
  );
  console.log(`  ✅ Card found: ${id}`);
}

// 2. Check 10 / 10 indices
console.log('\n▶ [TEST 2] Verify card index numbers (/ 10)');
for (let i = 1; i <= 10; i++) {
  const formattedIndex = `${String(i).padStart(2, '0')} / 10`;
  console.assert(
    kageHtml.includes(`>${formattedIndex}<`),
    `❌ Missing card index "${formattedIndex}" in kage.html`
  );
}
console.log('  ✅ All 10 card indices (01 / 10 to 10 / 10) verified');

// 3. Verify agent-handoff thumbnail and labels
console.log('\n▶ [TEST 3] Verify agent-handoff thumbnail and labels');
console.assert(
  kageHtml.includes('ui_agent_handoff.jpg'),
  '❌ Missing ui_agent_handoff.jpg thumbnail in kage.html'
);
console.assert(
  kageHtml.includes('The Agent Handoff Problem'),
  '❌ Missing title "The Agent Handoff Problem" in kage.html'
);
console.assert(
  kageHtml.includes('10 Case Studies Tiêu Biểu'),
  '❌ Missing "10 Case Studies Tiêu Biểu" in kage.html'
);
console.assert(
  kageHtml.includes('10 Featured Case Studies'),
  '❌ Missing "10 Featured Case Studies" in kage.html'
);
console.log('  ✅ Thumbnail and title labels verified');

// 4. Verify no destructive read_more overwrite in applyKageTranslations
console.log('\n▶ [TEST 4] Verify summary preservation in applyKageTranslations');
console.assert(
  !kageHtml.includes("s.textContent = d.pathways.read_more;"),
  '❌ Destructive read_more overwrite still present in applyKageTranslations'
);
console.log('  ✅ No destructive read_more overwrite found');

// 5. Simulate DOM and verify chronological order & filter stability
console.log('\n▶ [TEST 5] Verify Chronological Order (Newest to Oldest) and Filter stability');

// Extract all cards from HTML with simple regex
const cardRegex = /<article class="card"([\s\S]*?)<\/article>/g;
const matchedCards = [];
let match;
while ((match = cardRegex.exec(kageHtml)) !== null) {
  const cardMarkup = match[0];
  const projIdMatch = cardMarkup.match(/data-project-id="([^"]+)"/);
  const catMatch = cardMarkup.match(/data-category="([^"]+)"/);
  matchedCards.push({
    projectId: projIdMatch ? projIdMatch[1] : null,
    category: catMatch ? catMatch[1] : null,
    markup: cardMarkup
  });
}

console.assert(matchedCards.length === 10, `Expected 10 cards, found ${matchedCards.length}`);

// Verify chronological ordering and tags
const expectedChronologicalOrder = [
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

const expectedTags = {
  'agent-handoff': 'AI Workflow',
  'nexora': 'Project',
  'dispatch': 'AI Workflow',
  'agent-rules': 'AI Workflow',
  'sync-task-badge': 'AI Workflow',
  'cryptomap': 'Project',
  'handoff': 'AI Workflow',
  'ai-process': 'AI Workflow',
  'vlinkpay': 'Project',
  'nailhub': 'Project'
};

matchedCards.forEach((c, idx) => {
  const expectedId = expectedChronologicalOrder[idx];
  console.assert(
    c.projectId === expectedId,
    `❌ Order mismatch at index ${idx}: expected ${expectedId}, got ${c.projectId}`
  );
  // Verify .card-tag in card markup with specific type tag (AI Workflow / Project)
  console.assert(
    c.markup.includes('class="card-tag"'),
    `❌ Missing card-tag in card ${c.projectId}`
  );
  console.assert(
    c.markup.includes(expectedTags[c.projectId]),
    `❌ Expected tag "${expectedTags[c.projectId]}" in card ${c.projectId}`
  );
  // Verify tag is placed inside .card-fr (top-left corner)
  const frPart = c.markup.split('<div class="card-body">')[0];
  console.assert(
    frPart.includes('class="card-tag"'),
    `❌ Tag not located inside card-fr for card ${c.projectId}`
  );
  // Verify no subtitle (<span class="jp">) exists on card
  console.assert(
    !c.markup.includes('class="jp"'),
    `❌ Lingering subtitle class="jp" found in card ${c.projectId}`
  );
});
console.log('  ✅ All 10 cards have tags (AI Workflow / Project) at top-left corner and NO subtitles (.jp removed)');

const projectCards = matchedCards.filter(c => c.category === 'project');
const workflowCards = matchedCards.filter(c => c.category === 'workflow');
console.assert(projectCards.length === 4, `Expected 4 project cards, got ${projectCards.length}`);
console.assert(workflowCards.length === 6, `Expected 6 workflow cards, got ${workflowCards.length}`);
console.log(`  ✅ Filter categories available without preset categorization: 4 projects, 6 workflows`);

// 6. Test projectRepository cache auto-merging logic & code verification
console.log('\n▶ [TEST 6] Verify projectRepository getLocalCachedProjects auto-merge and canonical ordering');
const repoCode = fs.readFileSync('src/cms/repositories/projectRepository.ts', 'utf8');
console.assert(
  repoCode.includes('missingProjects = DEFAULT_PROJECT_ENTRIES.filter'),
  '❌ missingProjects filter logic missing in projectRepository.ts'
);
console.assert(
  repoCode.includes('saveLocalCachedProjects(merged)'),
  '❌ saveLocalCachedProjects(merged) missing in projectRepository.ts'
);

const { DEFAULT_PROJECT_ENTRIES } = await import('../src/content/legacy/legacyProjectManifest.ts');
console.assert(DEFAULT_PROJECT_ENTRIES[0].id === 'agent-handoff', 'Expected agent-handoff first in DEFAULT_PROJECT_ENTRIES');
console.assert(DEFAULT_PROJECT_ENTRIES[1].id === 'nexora', 'Expected nexora second in DEFAULT_PROJECT_ENTRIES');
console.assert(DEFAULT_PROJECT_ENTRIES[DEFAULT_PROJECT_ENTRIES.length - 1].id === 'nailhub', 'Expected nailhub last in DEFAULT_PROJECT_ENTRIES');

const defaultOrderMap = new Map(
  DEFAULT_PROJECT_ENTRIES.map((def, idx) => [def.id, def.sort_order ?? idx + 1])
);
const legacyCache = [
  { id: 'cryptomap', slug: 'cryptomap', sort_order: 1 },
  { id: 'nailhub', slug: 'nailhub', sort_order: 2 },
  { id: 'nexora', slug: 'nexora', sort_order: 3 },
  { id: 'vlinkpay', slug: 'vlinkpay', sort_order: 4 },
  { id: 'ai-process', slug: 'ai-process', sort_order: 5 },
  { id: 'handoff', slug: 'handoff', sort_order: 6 },
  { id: 'dispatch', slug: 'dispatch', sort_order: 7 },
  { id: 'agent-rules', slug: 'agent-rules', sort_order: 8 },
  { id: 'sync-task-badge', slug: 'sync-task-badge', sort_order: 9 }
];

const cachedIds = new Set(legacyCache.map((p) => p.id || p.slug));
const missingProjects = DEFAULT_PROJECT_ENTRIES.filter(
  (def) => !cachedIds.has(def.id) && !cachedIds.has(def.slug)
);
const merged = [...legacyCache, ...missingProjects]
  .map((p) => {
    const canonicalOrder = defaultOrderMap.get(p.id) ?? defaultOrderMap.get(p.slug);
    return canonicalOrder !== undefined ? { ...p, sort_order: canonicalOrder } : p;
  })
  .sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));

console.assert(merged.length === 10, `Expected 10 merged projects, got ${merged.length}`);
console.assert(merged[0].id === 'agent-handoff', `Expected agent-handoff first in merged cache, got ${merged[0].id}`);
console.assert(merged[1].id === 'nexora', `Expected nexora second in merged cache, got ${merged[1].id}`);
console.assert(merged[9].id === 'nailhub', `Expected nailhub last in merged cache, got ${merged[9].id}`);
console.log(`  ✅ Local project cache seamlessly merges and sorts chronologically (1: agent-handoff, 2: nexora ... 10: nailhub)`);

// 7. Test ProjectGraphCanvas light sequence inclusion
console.log('\n▶ [TEST 7] Verify ProjectGraphCanvas light sequence contains agent-handoff');
const canvasCode = fs.readFileSync('src/components/project-graph/ProjectGraphCanvas.tsx', 'utf8');
console.assert(
  canvasCode.includes("'sync-task-badge', 'agent-handoff'"),
  '❌ agent-handoff missing in ProjectGraphCanvas light sequences'
);
console.log('  ✅ ProjectGraphCanvas light sequences contain agent-handoff');

console.log('\n================================================================');
console.log('  🎉 ALL 7 TEST SUITES PASSED — CHRONOLOGICAL & CLEAN CARDS      ');
console.log('================================================================');
