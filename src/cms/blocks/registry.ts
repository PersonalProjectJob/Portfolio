import React from 'react';
import {
  Sparkles,
  Target,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Layers,
  GitFork,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import type { z } from 'zod';
import type { ContentBlock } from '../types/cms.types';
import type {
  BlockType,
  HeroBlockData,
  OverviewBlockData,
  RichTextBlockData,
  MediaBlockData,
  StatsBlockData,
  ProcessStepsBlockData,
  DecisionBlockData,
  CalloutBlockData,
} from './types';
import {
  HeroBlockSchema,
  OverviewBlockSchema,
  RichTextBlockSchema,
  MediaBlockSchema,
  StatsBlockSchema,
  ProcessStepsBlockSchema,
  DecisionBlockSchema,
  CalloutBlockSchema,
} from './types';

// Import all 8 renderers
import { HeroBlockRenderer } from './renderers/HeroBlockRenderer';
import { OverviewBlockRenderer } from './renderers/OverviewBlockRenderer';
import { RichTextBlockRenderer } from './renderers/RichTextBlockRenderer';
import { MediaBlockRenderer } from './renderers/MediaBlockRenderer';
import { StatsBlockRenderer } from './renderers/StatsBlockRenderer';
import { ProcessStepsBlockRenderer } from './renderers/ProcessStepsBlockRenderer';
import { DecisionBlockRenderer } from './renderers/DecisionBlockRenderer';
import { CalloutBlockRenderer } from './renderers/CalloutBlockRenderer';

export interface BlockRendererProps<T = unknown> {
  data: T;
  className?: string;
}

export interface BlockEditorProps<T = unknown> {
  blockId: string;
  data: T;
  onChange: (newData: Partial<T>) => void;
}

export interface BlockDefinition<T = unknown> {
  type: BlockType | string;
  label: { en: string; vi: string };
  description: { en: string; vi: string };
  icon: LucideIcon;
  category: 'header' | 'content' | 'media' | 'data' | 'workflow';
  defaultData: T;
  schema: z.ZodTypeAny;
  Renderer: React.ComponentType<BlockRendererProps<T>>;
  Editor?: React.ComponentType<BlockEditorProps<T>>;
}

// ─── DEFAULT BLOCK DATA FACTORIES ──────────────────────────

export const DEFAULT_HERO_DATA: HeroBlockData = {
  eyebrow: { en: 'Product Case Study', vi: 'Hồ sơ Dự án Sản phẩm' },
  title: { en: 'Next-Gen FinTech Architecture', vi: 'Kiến trúc Nền tảng FinTech Thế hệ mới' },
  subtitle: {
    en: 'Scaling high-throughput payment systems with sub-50ms latency.',
    vi: 'Tối ưu hóa hệ thống thanh toán thông lượng cao với độ trễ dưới 50ms.',
  },
  tags: ['Fintech', 'Architecture', 'Design System'],
  category: 'Product Design & Architecture',
  role: 'Lead Architect & Designer',
  date: '2026',
  metrics: [
    { value: '< 50ms', label: { en: 'P99 Latency', vi: 'Độ trễ P99' }, note: { en: 'Real-time sync', vi: 'Đồng bộ tức thời' } },
    { value: '+142%', label: { en: 'Throughput', vi: 'Thông lượng xử lý' } },
    { value: '99.99%', label: { en: 'SLA Reliability', vi: 'Độ tin cậy SLA' } },
  ],
};

export const DEFAULT_OVERVIEW_DATA: OverviewBlockData = {
  sectionTitle: { en: 'Project Overview & Challenges', vi: 'Tổng quan Dự án & Thách thức' },
  problem: {
    en: 'Legacy monolithic architecture resulted in high latency, frequent timeout drops, and friction in mobile checkout conversions.',
    vi: 'Hệ thống kiến trúc cũ gây ra độ trễ cao, tỷ lệ rớt đơn cao trong thanh toán di động và khó mở rộng.',
  },
  problemPoints: [
    { en: 'Payment drop-off rate reached 18% during peak hours.', vi: 'Tỷ lệ rớt đơn đạt 18% trong các khung giờ cao điểm.' },
    { en: 'Inconsistent design language across Android and iOS.', vi: 'Thiếu tính nhất quán giao diện giữa Android và iOS.' },
  ],
  solution: {
    en: 'Architected an event-driven edge routing gateway combined with a unified token-based Design System.',
    vi: 'Xây dựng cổng định tuyến dữ liệu biên hướng sự kiện kết hợp hệ thống Design System chuẩn hóa.',
  },
  solutionPoints: [
    { en: 'Edge caching layer reducing cold start by 75%.', vi: 'Lớp đệm Edge giúp giảm độ trễ khởi động tới 75%.' },
    { en: 'Micro-interactions designed according to Apple HIG.', vi: 'Vi tương tác mượt mà theo chuẩn Apple HIG.' },
  ],
  role: { en: 'Lead Product Designer & System Architect', vi: 'Kiến trúc sư Trưởng & Thiết kế Sản phẩm' },
  timeline: { en: '6 Months (Q1 - Q2 2026)', vi: '6 Tháng (Q1 - Q2 2026)' },
  coreMetric: {
    value: '+42.6%',
    label: { en: 'Checkout Conversion', vi: 'Tỷ lệ Chuyển đổi' },
    description: { en: 'Measured post-rollout', vi: 'Đo lường sau phát hành' },
  },
};

export const DEFAULT_RICH_TEXT_DATA: RichTextBlockData = {
  sectionTitle: { en: 'Deep Dive: Technical Implementation', vi: 'Chi tiết Thực thi Kỹ thuật' },
  content: {
    en: '### Architecture Principles\n\nWe adhered to three non-negotiable architectural tenets:\n1. **Zero-Latency Ingestion**: Data synchronization occurs over binary WebSocket streams.\n2. **Graceful Degradation**: Offline fallback caching ensures uninterrupted UX.\n3. **Strict Type Contracts**: End-to-end Zod & TypeScript type enforcement.',
    vi: '### Nguyên tắc Kiến trúc Cốt lõi\n\nChúng tôi tuân thủ 3 nguyên tắc bất di bất dịch:\n1. **Xử lý Không độ trễ**: Đồng bộ dữ liệu qua luồng nhị phân WebSocket.\n2. **Dung sai Sự cố (Graceful Degradation)**: Bộ đệm ngoại tuyến giúp trải nghiệm người dùng không bị gián đoạn.\n3. **Ràng buộc Type Nghiêm ngặt**: Đồng bộ an toàn kiểu dữ liệu end-to-end với Zod & TypeScript.',
  },
  layout: 'single',
};

export const DEFAULT_MEDIA_DATA: MediaBlockData = {
  sectionTitle: { en: 'Visual Design & Prototypes', vi: 'Thiết kế Giao diện & Bản mẫu' },
  description: {
    en: 'High-fidelity glassmorphism screens crafted for maximum clarity and responsive touch targets.',
    vi: 'Giao diện kính mờ cao cấp với bố cục tối ưu cho thao tác chạm trên mọi màn hình.',
  },
  layout: 'grid-2',
  items: [
    {
      url: '/assets/sample-screen-1.png',
      caption: { en: 'Real-time analytics dashboard layout', vi: 'Bố cục bảng điều khiển phân tích thời gian thực' },
      alt: 'Analytics Dashboard',
      aspectRatio: '16/9',
    },
    {
      url: '/assets/sample-screen-2.png',
      caption: { en: 'Mobile transaction verification flow', vi: 'Quy trình xác thực giao dịch trên thiết bị di động' },
      alt: 'Mobile Verification',
      aspectRatio: '16/9',
    },
  ],
  comparisonSlider: {
    enabled: false,
    beforeImage: '/assets/sample-before.png',
    afterImage: '/assets/sample-after.png',
    beforeLabel: { en: 'Legacy UI', vi: 'Giao diện cũ' },
    afterLabel: { en: 'Redesigned Glassmorphism', vi: 'Giao diện mới' },
  },
};

export const DEFAULT_STATS_DATA: StatsBlockData = {
  sectionTitle: { en: 'Key Business & Performance Impact', vi: 'Tác động Hiệu năng & Kinh doanh' },
  subtitle: {
    en: 'Verified metrics collected across 500,000+ active monthly transactions.',
    vi: 'Số liệu kiểm chứng trên hơn 500.000 giao dịch hàng tháng.',
  },
  columns: 3,
  cards: [
    {
      id: 'stat-1',
      value: '42.8%',
      label: { en: 'Conversion Increase', vi: 'Tăng trưởng Tỷ lệ Chuyển đổi' },
      change: '+42.8%',
      trend: 'up',
      note: { en: 'Measured over 90 days', vi: 'Đo lường trong 90 ngày' },
      icon: 'trending_up',
    },
    {
      id: 'stat-2',
      value: '280ms',
      label: { en: 'Average Page Render', vi: 'Tốc độ Render Trung bình' },
      change: '-65%',
      trend: 'up',
      note: { en: 'Down from 820ms baseline', vi: 'Giảm từ mức 820ms trước đây' },
      icon: 'zap',
    },
    {
      id: 'stat-3',
      value: '99.98%',
      label: { en: 'System Availability', vi: 'Độ khả dụng Hệ thống' },
      change: '+0.4%',
      trend: 'up',
      note: { en: 'Zero critical downtime incidents', vi: 'Không có sự cố gián đoạn nghiêm trọng' },
      icon: 'shield',
    },
  ],
};

export const DEFAULT_PROCESS_STEPS_DATA: ProcessStepsBlockData = {
  sectionTitle: { en: 'Engineering & UX Process', vi: 'Quy trình Thực thi Kỹ thuật & UX' },
  subtitle: {
    en: 'A 4-phase agile delivery pipeline ensuring rapid iteration with zero regressions.',
    vi: 'Quy trình phân phối 4 giai đoạn linh hoạt đảm bảo lặp nhanh và không lỗi hồi quy.',
  },
  steps: [
    {
      stepNumber: 1,
      phase: { en: 'Phase 01 &bull; Discovery', vi: 'Giai đoạn 01 &bull; Khảo sát' },
      title: { en: 'User Research & Telemetry Audit', vi: 'Nghiên cứu Người dùng & Đo kiểm Hệ thống' },
      description: {
        en: 'Conducted 24 in-depth interviews with merchants and mapped performance bottlenecks across checkout funnels.',
        vi: 'Phỏng vấn chuyên sâu 24 đối tác và phân tích các điểm nghẽn hiệu năng trên phễu thanh toán.',
      },
      deliverables: ['User Persona Journey Map', 'Telemetry Audit Report', 'Benchmark Spec'],
      icon: 'search',
    },
    {
      stepNumber: 2,
      phase: { en: 'Phase 02 &bull; Design System', vi: 'Giai đoạn 02 &bull; Design System' },
      title: { en: 'Token Pipeline & HIG Prototyping', vi: 'Xây dựng Token Pipeline & Bản mẫu HIG' },
      description: {
        en: 'Engineered auto-syncing Figma Tokens, glassmorphism tokens, and micro-interaction curves.',
        vi: 'Xây dựng hệ thống đồng bộ Figma Tokens, hiệu ứng kính mờ và vi tương tác mượt mà.',
      },
      deliverables: ['Design Token Repository', 'Interactive Clickable Figma Prototype'],
      icon: 'layout',
    },
    {
      stepNumber: 3,
      phase: { en: 'Phase 03 &bull; Engineering', vi: 'Giai đoạn 03 &bull; Lập trình' },
      title: { en: 'Modular Frontend & Edge Gateway', vi: 'Xây dựng Frontend Module & Cổng Edge' },
      description: {
        en: 'Implemented atomic UI components with strict TypeScript types, Framer Motion transitions, and React Query caching.',
        vi: 'Phát triển các component nguyên tử với TypeScript chặt chẽ, hiệu ứng Framer Motion và bộ nhớ đệm React Query.',
      },
      deliverables: ['Atomic React Component Library', 'Edge Cache Function', 'Storybook Specs'],
      icon: 'code',
    },
    {
      stepNumber: 4,
      phase: { en: 'Phase 04 &bull; QA & Launch', vi: 'Giai đoạn 04 &bull; Kiểm thử & Ra mắt' },
      title: { en: 'E2E Validation & Multi-region Rollout', vi: 'Kiểm thử E2E & Triển khai Đa vùng' },
      description: {
        en: 'Automated Playwright test matrix and 100% lighthouse accessibility compliance.',
        vi: 'Tự động hóa kiểm thử Playwright và đạt điểm tối đa Lighthouse Accessibility.',
      },
      deliverables: ['E2E Automated Test Suite', 'Performance Scorecard 99/100'],
      icon: 'rocket',
    },
  ],
};

export const DEFAULT_DECISION_DATA: DecisionBlockData = {
  sectionTitle: { en: 'Key Architectural & UX Decisions', vi: 'Các Quyết định Thiết kế & Kiến trúc Then chốt' },
  subtitle: {
    en: 'Transparent rationale behind technical tradeoffs and system ergonomics.',
    vi: 'Minh bạch lý do đằng sau các đánh đổi kỹ thuật và công thái học trải nghiệm.',
  },
  items: [
    {
      id: 'dec-1',
      problem: {
        en: 'State synchronization between canvas visual editor and live code renderer.',
        vi: 'Đồng bộ trạng thái giữa Canvas kéo thả trực quan và bộ render mã nguồn trực tiếp.',
      },
      options: [
        {
          title: 'Zustand Reactive Store + Zod Schema Validation',
          pros: ['Instant render updates without context lag', 'Zero bundle overhead (~1.5kB)', 'Strict runtime type verification'],
          cons: ['Requires deliberate action dispatchers'],
          selected: true,
        },
        {
          title: 'Redux Toolkit / Complex Context Provider',
          pros: ['Familiar standard boilerplate'],
          cons: ['Heavy bundle size', 'Excessive re-renders across canvas nodes'],
          selected: false,
        },
      ],
      decision: {
        en: 'Adopted Zustand with selective shallow subscriptions and Zod schemas.',
        vi: 'Lựa chọn Zustand kết hợp đăng ký shallow có chọn lọc và Zod validation schema.',
      },
      why: {
        en: 'Maintains 60fps drag performance during split-screen visual editing while guaranteeing 100% schema integrity.',
        vi: 'Đảm bảo hiệu năng kéo thả 60fps khi chỉnh sửa màn hình chia đôi và bảo đảm an toàn dữ liệu.',
      },
      impact: {
        en: '0ms perceivable input lag during high-frequency block reordering.',
        vi: '0ms độ trễ nhận biết khi kéo thả sắp xếp lại các khối nội dung.',
      },
    },
  ],
};

export const DEFAULT_CALLOUT_DATA: CalloutBlockData = {
  type: 'insight',
  title: { en: 'Core Engineering Insight', vi: 'Đúc kết Kỹ thuật Then chốt' },
  content: {
    en: '> **"Simplicity is the prerequisite for reliability."**\n>\n> Designing atomic content blocks as self-contained, typed components allowed our team to deliver 8 distinct presentation modes in under a week with 0 runtime errors.',
    vi: '> **"Đơn giản là điều kiện tiên quyết cho sự tin cậy."**\n>\n> Thiết kế các khối nội dung nguyên tử dưới dạng các component độc lập, có kiểu dữ liệu chặt chẽ giúp triển khai 8 chế độ hiển thị chỉ trong một tuần với 0 lỗi runtime.',
  },
  author: 'AD',
  role: 'Lead Architect',
};

// ─── REGISTRY DEFINITIONS MAP ──────────────────────────────

const REGISTRY_MAP: Record<string, BlockDefinition<any>> = {
  hero: {
    type: 'hero',
    label: { en: 'Hero Header', vi: 'Tiêu đề Hero' },
    description: {
      en: 'Large typography, cover imagery, and high-impact project metrics.',
      vi: 'Tiêu đề lớn nổi bật, ảnh bìa và các chỉ số ấn tượng.',
    },
    icon: Sparkles,
    category: 'header',
    defaultData: DEFAULT_HERO_DATA,
    schema: HeroBlockSchema,
    Renderer: HeroBlockRenderer as any,
  },
  overview: {
    type: 'overview',
    label: { en: 'Overview & Challenge', vi: 'Tổng quan & Thách thức' },
    description: {
      en: 'Structured 2-column Problem/Solution cards with role & timeline pills.',
      vi: 'Thẻ so sánh 2 cột Vấn đề / Giải pháp kèm thông tin vai trò & thời gian.',
    },
    icon: Target,
    category: 'content',
    defaultData: DEFAULT_OVERVIEW_DATA,
    schema: OverviewBlockSchema,
    Renderer: OverviewBlockRenderer as any,
  },
  rich_text: {
    type: 'rich_text',
    label: { en: 'Rich Text & Prose', vi: 'Văn bản & Markdown' },
    description: {
      en: 'Markdown-enabled prose with headings, code snippets, blockquotes, and tables.',
      vi: 'Đoạn văn Markdown với tiêu đề, khối mã nguồn, trích dẫn và bảng biểu.',
    },
    icon: FileText,
    category: 'content',
    defaultData: DEFAULT_RICH_TEXT_DATA,
    schema: RichTextBlockSchema,
    Renderer: RichTextBlockRenderer as any,
  },
  media: {
    type: 'media',
    label: { en: 'Media & Gallery', vi: 'Hình ảnh & Bản mẫu' },
    description: {
      en: 'Responsive image/video grid with zoomable lightbox and Before/After slider.',
      vi: 'Bộ sưu tập hình ảnh/video responsive kèm lightbox phóng to và thanh trượt Trước/Sau.',
    },
    icon: ImageIcon,
    category: 'media',
    defaultData: DEFAULT_MEDIA_DATA,
    schema: MediaBlockSchema,
    Renderer: MediaBlockRenderer as any,
  },
  stats: {
    type: 'stats',
    label: { en: 'Stats & Metrics', vi: 'Chỉ số & Hiệu năng' },
    description: {
      en: 'Key metric cards grid with glow accents and trend indicators.',
      vi: 'Lưới thẻ chỉ số hiệu năng với viền phát sáng và chỉ báo xu hướng.',
    },
    icon: TrendingUp,
    category: 'data',
    defaultData: DEFAULT_STATS_DATA,
    schema: StatsBlockSchema,
    Renderer: StatsBlockRenderer as any,
  },
  process_steps: {
    type: 'process_steps',
    label: { en: 'Process & Steps', vi: 'Quy trình & Các bước' },
    description: {
      en: 'Numbered workflow timeline with phase badges, icons, and deliverables.',
      vi: 'Dòng thời gian quy trình các bước có số thứ tự, biểu tượng và sản phẩm bàn giao.',
    },
    icon: Layers,
    category: 'workflow',
    defaultData: DEFAULT_PROCESS_STEPS_DATA,
    schema: ProcessStepsBlockSchema,
    Renderer: ProcessStepsBlockRenderer as any,
  },
  decision: {
    type: 'decision',
    label: { en: 'Tradeoffs & Decisions', vi: 'Quyết định & Đánh đổi' },
    description: {
      en: 'Architecture and UX decision cards with pros/cons tradeoff comparison.',
      vi: 'Thẻ phân tích quyết định kiến trúc & UX với so sánh ưu/nhược điểm các phương án.',
    },
    icon: GitFork,
    category: 'workflow',
    defaultData: DEFAULT_DECISION_DATA,
    schema: DecisionBlockSchema,
    Renderer: DecisionBlockRenderer as any,
  },
  callout: {
    type: 'callout',
    label: { en: 'Callout & Takeaways', vi: 'Điểm nhấn & Đúc kết' },
    description: {
      en: 'Highlighted key takeaway card with accent glow and icon variations.',
      vi: 'Khối ghi chú nổi bật với viền kính mờ phát sáng và nhiều biến thể.',
    },
    icon: Lightbulb,
    category: 'content',
    defaultData: DEFAULT_CALLOUT_DATA,
    schema: CalloutBlockSchema,
    Renderer: CalloutBlockRenderer as any,
  },
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────

/**
 * Registers or overrides a Block Definition in the registry
 */
export function registerBlockDefinition<T = unknown>(definition: BlockDefinition<T>): void {
  const normalizedKey = definition.type.toLowerCase().trim();
  REGISTRY_MAP[normalizedKey] = definition as BlockDefinition<any>;
}

/**
 * Retrieves a Block Definition by its block type string (case-insensitive)
 */
export function getBlockDefinition<T = unknown>(type: string): BlockDefinition<T> | undefined {
  if (!type) return undefined;
  const normalizedKey = type.toLowerCase().trim();
  return (REGISTRY_MAP[normalizedKey] ||
    Object.values(REGISTRY_MAP).find(
      (d) => d.type.toLowerCase() === normalizedKey
    )) as BlockDefinition<T> | undefined;
}

/**
 * Returns an array of all registered Block Definitions
 */
export function getAllBlockDefinitions(): BlockDefinition[] {
  return Object.values(REGISTRY_MAP);
}

/**
 * Generates a default ContentBlock instance for a given BlockType
 */
export function createDefaultBlock<T extends BlockType = BlockType>(
  type: T,
  customId?: string
): ContentBlock<Record<string, unknown>> {
  const def = getBlockDefinition(type);
  const id = customId || `block-${type}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    type,
    visible: true,
    data: def ? JSON.parse(JSON.stringify(def.defaultData)) : {},
  };
}
