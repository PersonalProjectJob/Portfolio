import { CV_PROJECTS } from '../../data/cvData';
import type { ContentEntry } from '../../cms/types/cms.types';

/**
 * Detailed metadata mapping for legacy projects to enrich localized titles and summaries.
 */
const PROJECT_METADATA_MAP: Record<
  string,
  {
    title: { en: string; vi: string };
    summary: { en: string; vi: string };
    category: string;
    role: string;
    featured: boolean;
    sort_order: number;
  }
> = {
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
    role: 'Lead Product Designer',
    featured: true,
    sort_order: 1,
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
    role: 'Product Architect & Lead Designer',
    featured: true,
    sort_order: 2,
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
    role: 'Principal UX/UI Designer',
    featured: true,
    sort_order: 3,
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
    role: 'Lead Product Designer',
    featured: true,
    sort_order: 4,
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
    role: 'Design Technologist',
    featured: false,
    sort_order: 5,
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
    role: 'Design System Engineer',
    featured: false,
    sort_order: 6,
  },
  dispatch: {
    title: {
      en: 'Multi-Agent Dispatch & Task Queue',
      vi: 'Hệ thống Điều phối Đa Agent & Hàng đợi Nhiệm vụ',
    },
    summary: {
      en: 'Distributed orchestrator coordinating AI agents for automated delivery.',
      vi: 'Hệ thống điều phối phân tán các tác tử AI phục vụ bàn giao tự động.',
    },
    category: 'Automation Engineering',
    role: 'Systems & Prompt Architect',
    featured: false,
    sort_order: 7,
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
    role: 'AI Governance Lead',
    featured: false,
    sort_order: 8,
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
    role: 'DevOps & Integration Engineer',
    featured: false,
    sort_order: 9,
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
    published_at: '2026-08-14T00:00:00Z',
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
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
