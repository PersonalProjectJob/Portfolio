export type NodeType = 'wireframe' | 'flowchart' | 'component' | 'note';

export interface PortfolioNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content?: string;
  imageUrl?: string;
}

export interface NodeRationale {
  painpoint?: string;
  decision?: string;
  metrics?: string;
  notes?: string;
}

export interface ProjectData {
  id: string;
  title: string;
  nodes: PortfolioNode[];
  rationale: Record<string, NodeRationale>;
}

export const mockProjects: ProjectData[] = [
  {
    id: 'proj_1',
    title: 'Fintech App Redesign',
    nodes: [
      { id: 'node_1', type: 'note', x: 0, y: 0, width: 300, height: 200, title: 'Problem Statement', content: 'Users drop off at the payment confirmation step due to unclear fees.' },
      { id: 'node_2', type: 'wireframe', x: 350, y: 0, width: 400, height: 600, title: 'Payment Flow - V1', imageUrl: 'https://images.unsplash.com/photo-1616077168079-7e09a6a38f4d?auto=format&fit=crop&w=400&q=80' },
      { id: 'node_3', type: 'flowchart', x: 800, y: 150, width: 350, height: 250, title: 'Logic Architecture', content: 'Checkout -> Calculate Fee -> User Confirms -> Payment Gateway' }
    ],
    rationale: {
      'node_1': { painpoint: 'High drop-off rate (35%)', decision: 'Redesigned the breakdown UI to be transparent.', metrics: 'Conversion increased by 15%.' },
      'node_2': { decision: 'Used a bottom-sheet for fees rather than a new page to keep context.', notes: 'Tested with 5 users, 4 found it clearer.' },
      'node_3': { notes: 'Backend integration requires 2 API calls. Designed for optimistic UI.' }
    }
  },
  {
    id: 'proj_2',
    title: 'SaaS Dashboard Pattern',
    nodes: [
      { id: 'node_4', type: 'component', x: 100, y: 100, width: 500, height: 300, title: 'Data Table Component', content: 'A highly reusable data table with sorting and filtering.' }
    ],
    rationale: {
      'node_4': { decision: 'Adopted Compound Component pattern for flexibility.', metrics: 'Reduced dev time by 40% for new tables.' }
    }
  }
];
