import fs from 'fs';
import path from 'path';

const viPath = path.join(process.cwd(), 'src/i18n/vi.ts');
const enPath = path.join(process.cwd(), 'src/i18n/en.ts');

let vi = fs.readFileSync(viPath, 'utf8');
let en = fs.readFileSync(enPath, 'utf8');

const missingVi = {
  'agentRules.s7.i3.4': 'Assignee: strictly <code>dev-owner</code>.',
  'dispatch': 'Dispatch',
  'agent-rules': '.agent-rules'
};

const missingEn = {
  'dispatch': 'Dispatch',
  'aiProcess.tag': '01. AI Process',
  'aiProcess.titlePart1': 'Building with ',
  'aiProcess.titlePart2': 'AI Builder',
  'aiProcess.subtitle': 'From chaos to structured generation',
  'aiProcess.aiBuilder.title': 'AI as Builder',
  'aiProcess.aiBuilder.item1': 'Rapid prototyping',
  'aiProcess.aiBuilder.item2': 'Automated coding',
  'aiProcess.aiBuilder.item3': 'Content generation',
  'aiProcess.aiBuilder.item4': 'Design system application',
  'aiProcess.aiBuilder.item5': 'Component extraction',
  'aiProcess.humanDecision.title': 'Human as Architect',
  'aiProcess.humanDecision.item1.bold': 'Direction',
  'aiProcess.humanDecision.item1.text': 'Setting clear constraints and goals.',
  'aiProcess.humanDecision.item2.bold': 'Orchestration',
  'aiProcess.humanDecision.item2.text': 'Guiding AI through complex tasks.',
  'aiProcess.humanDecision.item3.bold': 'Validation',
  'aiProcess.humanDecision.item3.text': 'Reviewing outputs against standards.',
  'aiProcess.humanDecision.item4.bold': 'Refinement',
  'aiProcess.humanDecision.item4.text': 'Polishing details AI misses.',
  'aiProcess.humanDecision.item5.bold': 'Integration',
  'aiProcess.humanDecision.item5.text': 'Connecting components logically.',
  'aiProcess.quote.part1': '"AI accelerates building, but ',
  'aiProcess.quote.part2': 'human logic orchestrates the system."',
  'agent-rules': '.agent-rules',
  'fintechFit.tag': '02. Fintech Fit',
  'fintechFit.titlePart1': 'Designing for ',
  'fintechFit.titlePart2': 'Trust',
  'fintechFit.subtitle': 'Balancing innovation with security',
  'fintechFit.needs.title': 'User Needs',
  'fintechFit.needs.item1.bold': 'Security',
  'fintechFit.needs.item1.text': 'Feeling safe with their money.',
  'fintechFit.needs.item2.bold': 'Clarity',
  'fintechFit.needs.item2.text': 'Understanding complex financial terms.',
  'fintechFit.needs.item3.bold': 'Control',
  'fintechFit.needs.item3.text': 'Managing assets confidently.',
  'fintechFit.needs.item4.bold': 'Speed',
  'fintechFit.needs.item4.text': 'Executing transactions quickly.',
  'fintechFit.contribution.title': 'Design Contribution',
  'fintechFit.contribution.item1.bold': 'Friction',
  'fintechFit.contribution.item1.text': 'Adding healthy friction for safety.',
  'fintechFit.contribution.item2.bold': 'Transparency',
  'fintechFit.contribution.item2.text': 'Clear feedback on system states.',
  'fintechFit.contribution.item3.bold': 'Guidance',
  'fintechFit.contribution.item3.text': 'Intuitive flows for complex tasks.',
  'fintechFit.cta.title': "Let's work together",
  'fintechFit.cta.desc': 'I am always looking for new challenges.',
  'fintechFit.cta.email': 'hello@example.com',
  'fintechFit.cta.linkedin': 'LinkedIn',
  'handoff.tag': '03. Handoff',
  'handoff.titlePart1': 'Bridging the ',
  'handoff.titlePart2': 'Gap',
  'handoff.subtitle': 'From design to development',
  'handoff.system.title': 'Systematic Handoff',
  'handoff.system.item1.bold': 'Tokens',
  'handoff.system.item1.text': 'Design tokens for consistency.',
  'handoff.system.item2.bold': 'Components',
  'handoff.system.item2.text': 'Reusable UI components.',
  'handoff.system.item3.bold': 'Guidelines',
  'handoff.system.item3.text': 'Clear usage instructions.',
  'handoff.system.item4.bold': 'Assets',
  'handoff.system.item4.text': 'Optimized graphics and icons.',
  'handoff.handoff.title': 'Developer Experience',
  'handoff.handoff.item1.bold': 'Specs',
  'handoff.handoff.item1.text': 'Detailed measurements and states.',
  'handoff.handoff.item2.bold': 'Prototypes',
  'handoff.handoff.item2.text': 'Interactive demonstrations.',
  'handoff.handoff.item3.bold': 'Collaboration',
  'handoff.handoff.item3.text': 'Ongoing support during build.',
  'handoff.value.title': 'Value Delivered',
  'handoff.value.item1.title': 'Velocity',
  'handoff.value.item1.desc': 'Faster development cycles.',
  'handoff.value.item2.title': 'Quality',
  'handoff.value.item2.desc': 'Fewer visual bugs.',
  'handoff.value.item3.title': 'Alignment',
  'handoff.value.item3.desc': 'Shared understanding of goals.',
  'handoff.value.item4.title': 'Scalability',
  'handoff.value.item4.desc': 'Easier updates and maintenance.',
  'vlinkpay.hardestChallenge': 'The hardest challenge',
  'vlinkpay.flow.title': 'User Flow',
  'vlinkpay.flow.step1.title': 'Step 1: Initiate',
  'vlinkpay.flow.step1.desc': 'User starts the transaction process.',
  'vlinkpay.flow.step2.title': 'Step 2: Verify',
  'vlinkpay.flow.step2.desc': 'System authenticates the user.',
  'vlinkpay.flow.step3.title': 'Step 3: Confirm',
  'vlinkpay.flow.step3.desc': 'User reviews the details.',
  'vlinkpay.flow.step4.title': 'Step 4: Success',
  'vlinkpay.flow.step4.desc': 'Transaction is completed.',
  'vlinkpay.ux.title': 'UX Principles',
  'vlinkpay.mockup.alt': 'VLINKPAY Mockup'
};

const nailhubDynamicKeys = {
  'nailhub.role.owner.label': 'Salon owner',
  'nailhub.role.owner.title': 'Hire and grow the team',
  'nailhub.role.owner.need': 'Post a role, explain the opportunity and review suitable technicians.',
  'nailhub.role.owner.outcome': 'A qualified conversation starts',
  'nailhub.role.owner.steps.0': 'Post need',
  'nailhub.role.owner.steps.1': 'Add requirements',
  'nailhub.role.owner.steps.2': 'Review candidates',
  'nailhub.role.owner.steps.3': 'Contact',
  'nailhub.role.owner.steps.4': 'Manage status',
  
  'nailhub.role.technician.label': 'Nail technician',
  'nailhub.role.technician.title': 'Find the right opportunity',
  'nailhub.role.technician.need': 'Search by role and location, evaluate the salon and make contact.',
  'nailhub.role.technician.outcome': 'A relevant application is sent',
  'nailhub.role.technician.steps.0': 'Search roles',
  'nailhub.role.technician.steps.1': 'Filter location',
  'nailhub.role.technician.steps.2': 'Review salon',
  'nailhub.role.technician.steps.3': 'Apply / contact',
  'nailhub.role.technician.steps.4': 'Track status',

  'nailhub.role.buyer.label': 'Buyer / operator',
  'nailhub.role.buyer.title': 'Discover a salon opportunity',
  'nailhub.role.buyer.need': 'Compare transfer listings, inspect the business and contact the owner.',
  'nailhub.role.buyer.outcome': 'A serious inquiry is created',
  'nailhub.role.buyer.steps.0': 'Browse salons',
  'nailhub.role.buyer.steps.1': 'Filter market',
  'nailhub.role.buyer.steps.2': 'Review listing',
  'nailhub.role.buyer.steps.3': 'Contact owner',
  'nailhub.role.buyer.steps.4': 'Manage inquiry',

  'nailhub.system.item.0': 'System item 1',
  'nailhub.system.item.1': 'System item 2',
  'nailhub.system.item.2': 'System item 3',
  'nailhub.system.item.3': 'System item 4',
  'nailhub.system.item.4': 'System item 5',
  'nailhub.system.item.5': 'System item 6',
  'nailhub.system.item.6': 'System item 7',
  'nailhub.system.item.7': 'System item 8',
  'nailhub.system.item.8': 'System item 9',

  'nailhub.decision.0.label': 'Intent before inventory',
  'nailhub.decision.0.title': 'Search begins with a real-world goal',
  'nailhub.decision.0.description': 'Listing type and location filters narrow the marketplace before users spend time comparing individual cards.',

  'nailhub.decision.1.label': 'Scannable evaluation',
  'nailhub.decision.1.title': 'Each card answers the next decision',
  'nailhub.decision.1.description': 'Role, location, compensation, imagery and engagement cues are ordered to support fast comparison without hiding detail.',

  'nailhub.decision.2.label': 'Continuity across roles',
  'nailhub.decision.2.title': 'Discovery connects to management',
  'nailhub.decision.2.description': 'Authentication, detail, contact and listing management remain part of one role-aware system instead of isolated screens.',

  'nailhub.evidence.item.0.title': 'Evidence 1',
  'nailhub.evidence.item.0.desc': 'Description 1',
  'nailhub.evidence.item.1.title': 'Evidence 2',
  'nailhub.evidence.item.1.desc': 'Description 2',
  'nailhub.evidence.item.2.title': 'Evidence 3',
  'nailhub.evidence.item.2.desc': 'Description 3',
  'nailhub.evidence.item.3.title': 'Evidence 4',
  'nailhub.evidence.item.3.desc': 'Description 4'
};

function inject(fileStr, obj) {
  let entries = [];
  for (let key in obj) {
    if (!fileStr.includes(`'${key}'`)) {
      entries.push(`  '${key}': '${obj[key].replace(/'/g, "\\'")}',`);
    }
  }
  if (entries.length > 0) {
    let toInsert = '\n  // --- Automatically Added ---\n' + entries.join('\n') + '\n';
    let lastBrace = fileStr.lastIndexOf('}');
    fileStr = fileStr.slice(0, lastBrace) + toInsert + fileStr.slice(lastBrace);
  }
  return fileStr;
}

vi = inject(vi, missingVi);
vi = inject(vi, nailhubDynamicKeys); // In real app we should translate to VI, but for now we fallback or insert

en = inject(en, missingEn);
en = inject(en, nailhubDynamicKeys);

fs.writeFileSync(viPath, vi, 'utf8');
fs.writeFileSync(enPath, en, 'utf8');
console.log('Done injecting keys.');
