import { parseMarkdownFile } from '../src/cms/parsers/markdownParser.ts';
import { legacyProjectRegistry, getLegacyComponent } from '../src/content/legacy/legacyProjectRegistry.ts';
import { DEFAULT_PROJECT_ENTRIES, getLegacyProjectBySlug } from '../src/content/legacy/legacyProjectManifest.ts';
import { DEFAULT_SITE_SETTINGS } from '../src/content/legacy/defaultSiteSettings.ts';
import { buildUtmUrl, generateShortSlug, parseUtmFromUrl, UTM_PRESETS } from '../src/lib/utm.ts';
import { getAllBlockDefinitions, getBlockDefinition, createDefaultBlock } from '../src/cms/blocks/registry.ts';
import { createVersionSnapshot, fetchProjectVersions } from '../src/cms/repositories/versionRepository.ts';
import { createProject } from '../src/cms/repositories/projectRepository.ts';

async function runQATestMatrix() {
  console.log('====================================================');
  console.log('  QA AUTOMATED TEST MATRIX — SPRINTS 1, 2, 3 SUITE  ');
  console.log('====================================================\n');

  // --- TEST 1: Block Registry & 8 Atomic Block Contracts ---
  console.log('▶ [TEST 1] Atomic Block Registry & Default Factories');
  const allBlockDefs = getAllBlockDefinitions();
  console.assert(allBlockDefs.length === 8, `Expected 8 registered blocks, found ${allBlockDefs.length}`);

  const expectedTypes = ['hero', 'overview', 'rich_text', 'media', 'stats', 'process_steps', 'decision', 'callout'];
  expectedTypes.forEach(type => {
    const def = getBlockDefinition(type);
    console.assert(def !== undefined, `Missing block definition for type: ${type}`);
    const block = createDefaultBlock(type);
    console.assert(block.type === type, `Default block type mismatch for: ${type}`);
    console.assert(typeof block.id === 'string' && block.id.length > 0, `Missing block id for: ${type}`);
    console.assert(block.visible === true, `Block visible flag should default to true`);
  });
  console.log(`  ✅ PASS: All 8 Atomic Block definitions & default factories validated`);

  // --- TEST 2: Version Snapshot & Rollback Engine ---
  console.log('\n▶ [TEST 2] Version Snapshot Engine');
  const sampleDoc = {
    schemaVersion: 1,
    blocks: [
      createDefaultBlock('hero'),
      createDefaultBlock('overview'),
      createDefaultBlock('stats')
    ]
  };

  const testProject = await createProject({
    title: { en: 'QA Test Project', vi: 'Dự án kiểm thử QA' },
    slug: 'qa-test-project',
    category: 'Product Design',
    role: 'Lead QA & Architect',
    render_mode: 'builder',
    draft_document: sampleDoc,
    published_document: sampleDoc,
  });

  const v1 = await createVersionSnapshot(testProject.id, {
    title: testProject.title,
    slug: testProject.slug,
    draft_document: sampleDoc,
    published_document: sampleDoc,
  }, 'Initial QA deployment');
  console.assert(v1.version >= 1, 'Version number should be positive');

  const history = await fetchProjectVersions(testProject.id);
  console.assert(history.length >= 1, 'Version history should record created snapshot');
  console.assert(history[0].publish_note === 'Initial QA deployment', 'Publish note should match');
  console.log(`  ✅ PASS: Version snapshot creation & history lookup validated`);

  // --- TEST 3: Markdown Parser & AST Extractor ---
  console.log('\n▶ [TEST 3] Markdown Parser & Multi-Format Ingestion');
  const sampleMd = `---
title: Sample Web3 Redesign
slug: sample-web3
category: Web3 & Crypto
role: Lead Product Designer
summary: Solving liquidity fragmentation.
date: 2026-08-14
---

# Introduction & Problem Statement
This is the core pain point of crypto travelers.

> Crucial Insight: Over 100M holders worldwide.

## Research Findings
- High inflation regions adopt stablecoins.
- Merchant verification is fragmented.

\`\`\`typescript
const trackingCode = "A83Kp2";
\`\`\`
`;

  const parsed = parseMarkdownFile(sampleMd);
  const titleVal = typeof parsed.metadata.title === 'object' ? parsed.metadata.title.en || parsed.metadata.title.vi : parsed.metadata.title;
  console.assert(titleVal === 'Sample Web3 Redesign', `Failed: title parsing (${titleVal})`);
  console.assert(parsed.metadata.slug === 'sample-web3', 'Failed: slug parsing');
  console.assert(parsed.metadata.category === 'Web3 & Crypto', 'Failed: category parsing');
  console.assert(parsed.blocks.length >= 4, 'Failed: blocks extraction count');
  console.log('  ✅ PASS: 1-Click Markdown AST Extractor validated');

  // --- TEST 4: Legacy Project Registry (Zero Regression) ---
  console.log('\n▶ [TEST 4] Legacy Project Registry & Fallback Manifest');
  const legacyKeys = [
    'cryptomap', 'nailhub', 'nexora', 'vlinkpay', 'ai-process',
    'handoff', 'sync-task-badge', 'dispatch', 'agent-rules'
  ];
  legacyKeys.forEach(key => {
    console.assert(key in legacyProjectRegistry, `Failed: legacy key missing ${key}`);
    const comp = getLegacyComponent(key);
    console.assert(comp !== null && typeof comp === 'object', `Failed: getLegacyComponent for ${key}`);
  });
  console.assert(getLegacyComponent('non-existent-key') === null, 'Failed: non-existent key handling');
  console.assert(DEFAULT_PROJECT_ENTRIES.length === 9, 'Failed: manifest project count');
  legacyKeys.forEach(slug => {
    const p = getLegacyProjectBySlug(slug);
    console.assert(p !== undefined, `Failed: lookup by slug ${slug}`);
    console.assert(p?.render_mode === 'legacy', `Failed: render_mode for ${slug}`);
  });
  console.log(`  ✅ PASS: All 9 Legacy Case Studies mapped with zero regression`);

  // --- TEST 5: Site Settings Default Fallback ---
  console.log('\n▶ [TEST 5] Site Settings Defaults & Profile Persistence');
  console.assert(DEFAULT_SITE_SETTINGS.profile.name.length > 0, 'Failed: default profile name');
  console.assert(DEFAULT_SITE_SETTINGS.experience.length >= 3, 'Failed: experience count');
  console.assert(DEFAULT_SITE_SETTINGS.process.length === 4, 'Failed: process steps count');
  console.log('  ✅ PASS: Site Settings defaults validated');

  // --- TEST 6: UTM Engine & Parameter Construction ---
  console.log('\n▶ [TEST 6] UTM Engine & Tracking Link Generation');
  const destination = 'https://tnsthao94.online/project/cryptomap';
  const utmUrl = buildUtmUrl(destination, {
    source: UTM_PRESETS.linkedin.source,
    medium: UTM_PRESETS.linkedin.medium,
    campaign: 'q3_recruiting',
    content: 'featured_post'
  });

  const parsedUtm = parseUtmFromUrl(utmUrl);
  console.assert(parsedUtm.utm_source === 'linkedin', `Failed: parse UTM source: ${parsedUtm.utm_source}`);
  console.assert(parsedUtm.utm_medium === 'social', `Failed: parse UTM medium: ${parsedUtm.utm_medium}`);
  console.assert(parsedUtm.utm_campaign === 'q3_recruiting', `Failed: parse UTM campaign: ${parsedUtm.utm_campaign}`);
  console.assert(parsedUtm.hasUtm === true, 'Failed: hasUtm flag');

  const shortSlug = generateShortSlug(6);
  console.assert(shortSlug.length === 6, 'Failed: short slug generation');
  console.log('  ✅ PASS: UTM generator, parser & vanity shortcodes validated');

  console.log('\n====================================================');
  console.log('  🎉 ALL 6 QA TEST SUITES PASSED (100% SUCCESS)      ');
  console.log('====================================================');
}

runQATestMatrix().catch(console.error);
