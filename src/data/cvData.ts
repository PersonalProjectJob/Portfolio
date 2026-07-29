export interface ProjectData {
  id: string;
  title: string;
  category: string;
  role: string;
  context: string;
  solution: string[];
  results: { label: string; value: string }[];
  x: number;
  y: number;
}

export const CV_PROJECTS: ProjectData[] = [
  {
    id: 'cryptomap',
    title: 'cv.cryptomap.title',
    category: 'cv.cryptomap.category',
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
    x: 200, y: 350
  },
  {
    id: 'nailhub',
    title: 'cv.nailhub.title',
    category: 'cv.nailhub.category',
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
    x: 200, y: 550
  },
  {
    id: 'vlinkpay',
    title: 'cv.vlinkpay.title',
    category: 'cv.vlinkpay.category',
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
    x: 500, y: 350
  },
  {
    id: 'nexora',
    title: 'cv.nexora.title',
    category: 'cv.nexora.category',
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
    x: 500, y: 550
  },
  {
    id: 'ai-process',
    title: 'cv.ai-process.title',
    category: 'cv.ai-process.category',
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
    x: 720, y: 350
  },
  {
    id: 'handoff',
    title: 'cv.handoff.title',
    category: 'cv.handoff.category',
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
    x: 720, y: 550
  },
  {
    id: 'fintech-fit',
    title: 'cv.fintech-fit.title',
    category: 'cv.fintech-fit.category',
    role: 'cv.fintech-fit.role',
    context: 'cv.fintech-fit.context',
    solution: [
      'cv.fintech-fit.solution.0',
      'cv.fintech-fit.solution.1',
      'cv.fintech-fit.solution.2'
    ],
    results: [
      { label: 'cv.fintech-fit.result.0.label', value: 'cv.fintech-fit.result.0.value' },
      { label: 'cv.fintech-fit.result.1.label', value: 'cv.fintech-fit.result.1.value' }
    ],
    x: 900, y: 400
  },
  {
    id: 'dispatch',
    title: 'cv.dispatch.title',
    category: 'cv.dispatch.category',
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
    x: 350, y: 150
  },
  {
    id: 'agent-rules',
    title: 'cv.agent-rules.title',
    category: 'cv.agent-rules.category',
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
    x: 550, y: 150
  }
];
