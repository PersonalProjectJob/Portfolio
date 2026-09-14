import { CV_PROJECTS } from '../../data/cvData.ts';
import type { ContentEntry } from '../../cms/types/cms.types.ts';

/**
 * Detailed metadata mapping for legacy projects to enrich localized titles and summaries.
 */
const PROJECT_METADATA_MAP: Record<
  string,
  {
    title: { en: string; vi: string };
    summary: { en: string; vi: string };
    category: string;
    tags: string[];
    role: string;
    featured: boolean;
    sort_order: number;
    published_at?: string;
  }
> = {
  'agent-handoff': {
    title: {
      en: 'The Agent Handoff Problem',
      vi: 'Bài toán Bàn giao Agent (The Agent Handoff Problem)',
    },
    summary: {
      en: 'Four AI coding agents shared one rule set and one work queue. When the orchestrator ran out of quota mid-task, everything stopped. Here is what it took to fix that: leases, compare-and-swap, separate verifiers, and crash-resume drills.',
      vi: 'Bốn AI agent chia sẻ chung một bộ quy tắc và hàng đợi nhiệm vụ. Khi agent điều phối cạn quota giữa chừng, toàn bộ bị đóng băng. Đây là giải pháp giải quyết triệt để: lease, CAS, tách quyền verifier và diễn tập crash-resume.',
    },
    category: 'AI & Automation Engineering',
    tags: ['#Multi-Agent', '#Harness', '#Distributed Systems'],
    role: 'Multi-Agent Systems Architect',
    featured: true,
    sort_order: 1,
    published_at: '2026-09-14T00:00:00Z',
  },
  nexora: {
    title: {
      en: 'NEXORA - Smart Hardware Interface',
      vi: 'NEXORA - Giao diện Thiết bị Thông minh',
    },
    summary: {
      en: 'Next-generation industrial IoT control surface and embedded display system.',
      vi: 'Giao diện điều khiển IoT công nghiệp và hệ thống hiển thị nhúng.',
    },
    category: 'Hardware & Interface',
    tags: ['#Hardware UI', '#Industrial IoT', '#Telemetry'],
    role: 'Principal UX/UI Designer',
    featured: true,
    sort_order: 2,
    published_at: '2026-08-30T00:00:00Z',
  },
  dispatch: {
    title: {
      en: 'Multi-Agent Dispatch & Task Queue',
      vi: 'Hệ thống Điều phối Đa Agent & Hàng đợi Nhiệm vụ',
    },
    summary: {
      en: 'Distributed orchestrator coordinating AI agents for automated delivery.',
      vi: 'Hệ thống điều phối phân tán các AI agent phục vụ bàn giao tự động.',
    },
    category: 'Automation Engineering',
    tags: ['#AI Dispatch', '#Task Queue', '#Automation'],
    role: 'Systems & Prompt Architect',
    featured: true,
    sort_order: 3,
    published_at: '2026-07-20T00:00:00Z',
  },
  'agent-rules': {
    title: {
      en: 'Agent Rules Engine & Dynamic Policy Control',
      vi: 'Bộ Quy tắc Agent & Kiểm soát Chính sách Động',
    },
    summary: {
      en: 'Standardized agent operational procedures, invariants, and automated compliance.',
      vi: 'Quy trình vận hành chuẩn cho Agent và kiểm tra tuân thủ tự động.',
    },
    category: 'Governance & AI Systems',
    tags: ['#AI Governance', '#Policy Engine', '#Quality Gates'],
    role: 'AI Governance Lead',
    featured: true,
    sort_order: 4,
    published_at: '2026-06-15T00:00:00Z',
  },
  'sync-task-badge': {
    title: {
      en: 'Real-time Sync & Telegram Automation',
      vi: 'Đồng bộ Trạng thái Thời gian thực & Telegram',
    },
    summary: {
      en: 'Bi-directional status broadcasting and automated issue triage via Telegram.',
      vi: 'Phát sóng trạng thái hai chiều và xử lý sự cố tự động qua Telegram.',
    },
    category: 'Telemetry & Devops',
    tags: ['#Telemetry', '#Telegram Bot', '#Real-time Sync'],
    role: 'DevOps & Integration Engineer',
    featured: false,
    sort_order: 5,
    published_at: '2026-05-28T00:00:00Z',
  },
  cryptomap: {
    title: {
      en: 'CryptoMap 360 - Web3 Analytics Platform',
      vi: 'CryptoMap 360 - Nền tảng Phân tích Web3',
    },
    summary: {
      en: 'Multi-chain asset tracking & crypto market intelligence platform.',
      vi: 'Nền tảng theo dõi tài sản đa chuỗi & thông tin thị trường crypto.',
    },
    category: 'Web3 & Fintech',
    tags: ['#Web3 Analytics', '#Interactive Map', '#Fintech'],
    role: 'Lead Product Designer',
    featured: false,
    sort_order: 6,
    published_at: '2025-11-20T00:00:00Z',
  },
  handoff: {
    title: {
      en: 'Zero-Friction Design-to-Code Handoff',
      vi: 'Quy trình Bàn giao Design-to-Code Tự động',
    },
    summary: {
      en: 'Production-grade design token pipelines and sync automation tools.',
      vi: 'Hệ thống đồng bộ Token thiết kế và pipeline tự động hóa mã nguồn.',
    },
    category: 'Process & Tooling',
    tags: ['#Process & Tooling', '#Design Tokens', '#Figma to Code'],
    role: 'Design System Engineer',
    featured: false,
    sort_order: 7,
    published_at: '2025-08-10T00:00:00Z',
  },
  'ai-process': {
    title: {
      en: 'AI-Augmented Product Workflows',
      vi: 'Quy trình Phát triển Tích hợp AI',
    },
    summary: {
      en: 'Deep agentic workflow integration into product lifecycle & prototyping.',
      vi: 'Tích hợp AI Agent sâu vào vòng đời phát triển sản phẩm & tạo mẫu.',
    },
    category: 'AI & Methodologies',
    tags: ['#AI & Methodologies', '#MVP Prototyping', '#AI Workflow'],
    role: 'Design Technologist',
    featured: false,
    sort_order: 8,
    published_at: '2025-05-18T00:00:00Z',
  },
  vlinkpay: {
    title: {
      en: 'VLINKPAY - Cross-border Payment Gateway',
      vi: 'VLINKPAY - Cổng thanh toán xuyên biên giới',
    },
    summary: {
      en: 'High-throughput merchant acquiring and multi-currency settlement gateway.',
      vi: 'Cổng thanh toán thương mại và quyết toán đa tiền tệ tốc độ cao.',
    },
    category: 'Fintech Platform',
    tags: ['#Fintech', '#Payment Gateway', '#Mobile App'],
    role: 'Lead Product Designer',
    featured: false,
    sort_order: 9,
    published_at: '2024-12-15T00:00:00Z',
  },
  nailhub: {
    title: {
      en: 'NailHub - Salon Operations & POS SaaS',
      vi: 'NailHub - Nền tảng Quản lý Salon & POS',
    },
    summary: {
      en: 'End-to-end booking, POS & customer retention platform for US nail salons.',
      vi: 'Hệ thống đặt lịch, POS và chăm sóc khách hàng cho tiệm nail tại Mỹ.',
    },
    category: 'B2B SaaS',
    tags: ['#B2B SaaS', '#POS Platform', '#Salon Operations'],
    role: 'Product Architect & Lead Designer',
    featured: false,
    sort_order: 10,
    published_at: '2024-06-10T00:00:00Z',
  },
};

/**
 * Maps CV_PROJECTS into standard ContentEntry[] array for hybrid/offline resilience.
 */
export const DEFAULT_PROJECT_ENTRIES: ContentEntry[] = CV_PROJECTS.map((project, index) => {
  const meta = PROJECT_METADATA_MAP[project.id] || {
    title: { en: project.title, vi: project.title },
    summary: { en: project.context, vi: project.context },
    category: project.category,
    tags: ['#Case Study'],
    role: project.role,
    featured: index < 4,
    sort_order: index + 1,
  };

  return {
    id: project.id,
    slug: project.id,
    route: `/project/${project.id}`,
    title: meta.title,
    summary: meta.summary,
    category: meta.category,
    tags: meta.tags,
    role: meta.role,
    status: 'published',
    render_mode: 'legacy',
    legacy_key: project.id,
    template_key: 'standard',
    featured: meta.featured,
    sort_order: meta.sort_order,
    graph_config: project.graphMetadata
      ? {
          shortName: project.graphMetadata.shortName,
          zone: project.graphMetadata.zone,
          parentId: project.graphMetadata.parentId,
          edgeType: project.graphMetadata.edgeType,
          order: project.graphMetadata.order,
          eyebrow: project.graphMetadata.eyebrow,
          positionOverride: project.graphMetadata.positionOverride,
          noteAnchor: project.graphMetadata.noteAnchor,
          slot: project.graphMetadata.slot,
        }
      : null,
    seo: {
      title: meta.title.en,
      description: meta.summary.en,
      og_image: `/assets/case-studies/${project.id}-preview.png`,
      keywords: [meta.category, meta.role, 'Case Study', 'Portfolio'],
    },
    draft_document: {
      schemaVersion: 1,
      blocks: [],
    },
    published_document: {
      schemaVersion: 1,
      blocks: [],
    },
    published_at: meta.published_at || '2026-08-14T00:00:00Z',
    created_at: meta.published_at || '2026-08-14T00:00:00Z',
    updated_at: meta.published_at || '2026-08-14T00:00:00Z',
  };
});

/**
 * Finds a project entry by its URL slug.
 */
export function getLegacyProjectBySlug(slug: string): ContentEntry | undefined {
  if (!slug) return undefined;
  const normalizedSlug = slug.toLowerCase().trim();
  return DEFAULT_PROJECT_ENTRIES.find(
    (p) => p.slug.toLowerCase() === normalizedSlug || p.legacy_key?.toLowerCase() === normalizedSlug
  );
}

/**
 * Finds a project entry by its unique ID.
 */
export function getLegacyProjectById(id: string): ContentEntry | undefined {
  if (!id) return undefined;
  return DEFAULT_PROJECT_ENTRIES.find((p) => p.id === id);
}
