import type { ProjectNodeGroup, NodeAnchor, ProjectEdge } from "../components/project-graph/projectGraph.types";

export interface ProjectGraphMetadata {
  shortName: string;
  zone: ProjectNodeGroup;
  order: number;
  parentId?: string;
  edgeType?: ProjectEdge["type"];
  slot?: string;
  positionOverride?: { x: number; y: number };
  noteAnchor?: NodeAnchor;
  noteOffset?: { x: number; y: number };
  eyebrow?: string;
}

export interface ProjectData {
  id: string;
  title: string;
  category: string;
  tags?: string[];
  role: string;
  context: string;
  solution: string[];
  results: { label: string; value: string }[];
  x?: number; // legacy
  y?: number; // legacy
  graphMetadata?: ProjectGraphMetadata;
}

export const CV_PROJECTS: ProjectData[] = [
  {
    id: 'agent-handoff',
    title: 'cv.agent-handoff.title',
    category: 'cv.agent-handoff.category',
    tags: ['#Multi-Agent', '#Harness', '#Distributed Systems'],
    role: 'cv.agent-handoff.role',
    context: 'cv.agent-handoff.context',
    solution: [
      'cv.agent-handoff.solution.0',
      'cv.agent-handoff.solution.1',
      'cv.agent-handoff.solution.2',
      'cv.agent-handoff.solution.3'
    ],
    results: [
      { label: 'cv.agent-handoff.result.0.label', value: 'cv.agent-handoff.result.0.value' },
      { label: 'cv.agent-handoff.result.1.label', value: 'cv.agent-handoff.result.1.value' }
    ],
    graphMetadata: {
      shortName: 'Agent Handoff',
      zone: 'automation',
      parentId: 'sync-task-badge',
      edgeType: 'automation-sequence',
      order: 4,
      eyebrow: 'Automation 04',
      positionOverride: { x: 0.28, y: 0.38 },
      noteAnchor: 'top'
    }
  },
  {
    id: 'nexora',
    title: 'cv.nexora.title',
    category: 'cv.nexora.category',
    tags: ['#Hardware UI', '#Industrial IoT', '#Telemetry'],
    role: 'cv.nexora.role',
    context: 'cv.nexora.context',
    solution: [
      'cv.nexora.solution.0',
      'cv.nexora.solution.1',
      'cv.nexora.solution.2',
      'cv.nexora.solution.3'
    ],
    results: [
      { label: 'cv.nexora.result.0.label', value: 'cv.nexora.result.0.value' },
      { label: 'cv.nexora.result.1.label', value: 'cv.nexora.result.1.value' }
    ],
    graphMetadata: {
      shortName: 'NEXORA',
      zone: 'product',
      parentId: 'profile',
      edgeType: 'primary-flow',
      order: 1,
      eyebrow: 'Hardware & Interface',
      positionOverride: { x: 0.52, y: 0.41 }, // Body 1
      noteAnchor: 'right'
    }
  },
  {
    id: 'dispatch',
    title: 'cv.dispatch.title',
    category: 'cv.dispatch.category',
    tags: ['#AI Dispatch', '#Task Queue', '#Automation'],
    role: 'cv.dispatch.role',
    context: 'cv.dispatch.context',
    solution: [
      'cv.dispatch.solution.0',
      'cv.dispatch.solution.1',
      'cv.dispatch.solution.2',
      'cv.dispatch.solution.3'
    ],
    results: [
      { label: 'cv.dispatch.result.0.label', value: 'cv.dispatch.result.0.value' },
      { label: 'cv.dispatch.result.1.label', value: 'cv.dispatch.result.1.value' }
    ],
    graphMetadata: {
      shortName: 'Dispatch',
      zone: 'automation',
      parentId: 'vlinkpay',
      edgeType: 'automation-sequence',
      order: 1,
      eyebrow: 'Automation 01',
      positionOverride: { x: 0.19, y: 0.81 },
      noteAnchor: 'bottom'
    }
  },
  {
    id: 'agent-rules',
    title: 'cv.agent-rules.title',
    category: 'cv.agent-rules.category',
    tags: ['#AI Governance', '#Policy Engine', '#Quality Gates'],
    role: 'cv.agent-rules.role',
    context: 'cv.agent-rules.context',
    solution: [
      'cv.agent-rules.solution.0',
      'cv.agent-rules.solution.1',
      'cv.agent-rules.solution.2',
      'cv.agent-rules.solution.3'
    ],
    results: [
      { label: 'cv.agent-rules.result.0.label', value: 'cv.agent-rules.result.0.value' },
      { label: 'cv.agent-rules.result.1.label', value: 'cv.agent-rules.result.1.value' }
    ],
    graphMetadata: {
      shortName: 'Agent Rules',
      zone: 'automation',
      parentId: 'dispatch',
      edgeType: 'automation-sequence',
      order: 2,
      eyebrow: 'Automation 02',
      positionOverride: { x: 0.10, y: 0.66 },
      noteAnchor: 'left'
    }
  },
  {
    id: 'sync-task-badge',
    title: 'cv.sync-task-badge.title',
    category: 'cv.sync-task-badge.category',
    tags: ['#Telemetry', '#Telegram Bot', '#Real-time Sync'],
    role: 'cv.sync-task-badge.role',
    context: 'cv.sync-task-badge.context',
    solution: [
      'cv.sync-task-badge.solution.0',
      'cv.sync-task-badge.solution.1',
      'cv.sync-task-badge.solution.2',
      'cv.sync-task-badge.solution.3'
    ],
    results: [
      { label: 'cv.sync-task-badge.result.0.label', value: 'cv.sync-task-badge.result.0.value' },
      { label: 'cv.sync-task-badge.result.1.label', value: 'cv.sync-task-badge.result.1.value' }
    ],
    graphMetadata: {
      shortName: 'Status Report',
      zone: 'automation',
      parentId: 'agent-rules',
      edgeType: 'automation-sequence',
      order: 3,
      eyebrow: 'Automation 03',
      positionOverride: { x: 0.18, y: 0.49 },
      noteAnchor: 'top'
    }
  },
  {
    id: 'cryptomap',
    title: 'cv.cryptomap.title',
    category: 'cv.cryptomap.category',
    tags: ['#Web3 Analytics', '#Interactive Map', '#Fintech'],
    role: 'cv.cryptomap.role',
    context: 'cv.cryptomap.context',
    solution: [
      'cv.cryptomap.solution.0',
      'cv.cryptomap.solution.1',
      'cv.cryptomap.solution.2',
      'cv.cryptomap.solution.3'
    ],
    results: [
      { label: 'cv.cryptomap.result.0.label', value: 'cv.cryptomap.result.0.value' },
      { label: 'cv.cryptomap.result.1.label', value: 'cv.cryptomap.result.1.value' }
    ],
    graphMetadata: {
      shortName: 'CryptoMap360',
      zone: 'product',
      parentId: 'nexora',
      edgeType: 'primary-flow',
      order: 2,
      eyebrow: 'Web3 Product',
      positionOverride: { x: 0.51, y: 0.55 }, // Body 2
      noteAnchor: 'right'
    }
  },
  {
    id: 'handoff',
    title: 'cv.handoff.title',
    category: 'cv.handoff.category',
    tags: ['#Process & Tooling', '#Design Tokens', '#Figma to Code'],
    role: 'cv.handoff.role',
    context: 'cv.handoff.context',
    solution: [
      'cv.handoff.solution.0',
      'cv.handoff.solution.1',
      'cv.handoff.solution.2',
      'cv.handoff.solution.3'
    ],
    results: [
      { label: 'cv.handoff.result.0.label', value: 'cv.handoff.result.0.value' },
      { label: 'cv.handoff.result.1.label', value: 'cv.handoff.result.1.value' }
    ],
    graphMetadata: {
      shortName: 'Handoff',
      zone: 'process',
      order: 2,
      eyebrow: 'Process',
      positionOverride: { x: 0.75, y: 0.13 }, // Right claw
      noteAnchor: 'right'
    }
  },
  {
    id: 'ai-process',
    title: 'cv.ai-process.title',
    category: 'cv.ai-process.category',
    tags: ['#AI & Methodologies', '#MVP Prototyping', '#AI Workflow'],
    role: 'cv.ai-process.role',
    context: 'cv.ai-process.context',
    solution: [
      'cv.ai-process.solution.0',
      'cv.ai-process.solution.1',
      'cv.ai-process.solution.2'
    ],
    results: [
      { label: 'cv.ai-process.result.0.label', value: 'cv.ai-process.result.0.value' },
      { label: 'cv.ai-process.result.1.label', value: 'cv.ai-process.result.1.value' }
    ],
    graphMetadata: {
      shortName: 'AI Process',
      zone: 'process',
      order: 1,
      eyebrow: 'AI Integration',
      positionOverride: { x: 0.25, y: 0.13 }, // Left claw
      noteAnchor: 'left'
    }
  },
  {
    id: 'vlinkpay',
    title: 'cv.vlinkpay.title',
    category: 'cv.vlinkpay.category',
    tags: ['#Fintech', '#Payment Gateway', '#Mobile App'],
    role: 'cv.vlinkpay.role',
    context: 'cv.vlinkpay.context',
    solution: [
      'cv.vlinkpay.solution.0',
      'cv.vlinkpay.solution.1',
      'cv.vlinkpay.solution.2',
      'cv.vlinkpay.solution.3'
    ],
    results: [
      { label: 'cv.vlinkpay.result.0.label', value: 'cv.vlinkpay.result.0.value' },
      { label: 'cv.vlinkpay.result.1.label', value: 'cv.vlinkpay.result.1.value' }
    ],
    graphMetadata: {
      shortName: 'VLINKPAY',
      zone: 'product',
      parentId: 'nailhub',
      edgeType: 'primary-flow',
      order: 4,
      eyebrow: 'Fintech Platform',
      positionOverride: { x: 0.36, y: 0.78 }, // Body 4 / Tail base
      noteAnchor: 'left'
    }
  },
  {
    id: 'nailhub',
    title: 'cv.nailhub.title',
    category: 'cv.nailhub.category',
    tags: ['#B2B SaaS', '#POS Platform', '#Salon Operations'],
    role: 'cv.nailhub.role',
    context: 'cv.nailhub.context',
    solution: [
      'cv.nailhub.solution.0',
      'cv.nailhub.solution.1',
      'cv.nailhub.solution.2',
      'cv.nailhub.solution.3'
    ],
    results: [
      { label: 'cv.nailhub.result.0.label', value: 'cv.nailhub.result.0.value' },
      { label: 'cv.nailhub.result.1.label', value: 'cv.nailhub.result.1.value' }
    ],
    graphMetadata: {
      shortName: 'NailHub',
      zone: 'product',
      parentId: 'cryptomap',
      edgeType: 'primary-flow',
      order: 3,
      eyebrow: 'B2B SaaS',
      positionOverride: { x: 0.46, y: 0.68 }, // Body 3
      noteAnchor: 'right'
    }
  }
];
