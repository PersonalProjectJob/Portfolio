import type { LocalizedString, ContentBlock } from './cms.types';

export type BlockType =
  | 'Hero'
  | 'Overview'
  | 'RichText'
  | 'Media'
  | 'Stats'
  | 'ProcessSteps'
  | 'Decision'
  | 'Callout';

export interface HeroBlockData {
  title: LocalizedString;
  subtitle: LocalizedString;
  eyebrow?: string;
  tags?: string[];
  coverImage?: string;
  category?: string;
  role?: string;
  date?: string;
}

export interface OverviewBlockData {
  sectionTitle?: LocalizedString;
  problem: LocalizedString;
  solution: LocalizedString;
  role?: string;
  timeline?: string;
  coreMetric?: string;
}

export interface RichTextBlockData {
  sectionTitle?: LocalizedString;
  body: LocalizedString;
}

export interface MediaItem {
  id: string;
  url: string;
  caption: LocalizedString;
  aspectRatio: '16/9' | '4/3' | '1/1' | '21/9' | 'auto';
  isBeforeAfter?: boolean;
  beforeUrl?: string;
  afterUrl?: string;
  beforeLabel?: LocalizedString;
  afterLabel?: LocalizedString;
}

export interface MediaBlockData {
  sectionTitle?: LocalizedString;
  items: MediaItem[];
}

export interface StatItem {
  id: string;
  value: string;
  label: LocalizedString;
  note?: string;
  changeType?: 'positive' | 'neutral' | 'negative';
}

export interface StatsBlockData {
  sectionTitle?: LocalizedString;
  items: StatItem[];
}

export interface ProcessStepItem {
  id: string;
  stepNumber: number;
  title: LocalizedString;
  description: LocalizedString;
  deliverables?: string[];
  icon?: string;
}

export interface ProcessStepsBlockData {
  sectionTitle?: LocalizedString;
  steps: ProcessStepItem[];
}

export interface DecisionItem {
  id: string;
  problem: LocalizedString;
  choice: LocalizedString;
  rationale: LocalizedString;
  impact?: LocalizedString;
}

export interface DecisionBlockData {
  sectionTitle?: LocalizedString;
  decisions: DecisionItem[];
}

export type CalloutVariant = 'info' | 'tip' | 'warning' | 'quote';
export type CalloutGlowColor = 'cyan' | 'emerald' | 'amber' | 'purple' | 'blue' | 'rose';

export interface CalloutBlockData {
  sectionTitle?: LocalizedString;
  text: LocalizedString;
  variant: CalloutVariant;
  glowColor: CalloutGlowColor;
  author?: string;
  role?: string;
}

export interface BlockTypeDefinition {
  type: BlockType;
  label: LocalizedString;
  description: LocalizedString;
  iconName: string;
  defaultData: () => any;
}

export const BLOCK_DEFINITIONS: Record<BlockType, BlockTypeDefinition> = {
  Hero: {
    type: 'Hero',
    label: { en: 'Hero Header', vi: 'Khối Đầu Trang' },
    description: {
      en: 'Title, subtitle, eyebrow metadata, badges & main showcase image',
      vi: 'Tiêu đề, phụ đề, nhãn dự án, thẻ phân loại & ảnh đại diện chính',
    },
    iconName: 'Sparkles',
    defaultData: (): HeroBlockData => ({
      title: { en: 'Project Title', vi: 'Tiêu Đề Dự Án' },
      subtitle: { en: 'A high-impact case study overview detailing the solution.', vi: 'Tổng quan giải pháp chi tiết của dự án.' },
      eyebrow: 'CASE STUDY // 2026',
      tags: ['Product Design', 'React', 'Design System'],
      coverImage: '',
      category: 'Product Design',
      role: 'Lead Product Designer',
      date: '2026',
    }),
  },
  Overview: {
    type: 'Overview',
    label: { en: 'Project Overview', vi: 'Tổng Quan Dự Án' },
    description: {
      en: 'Structured summary: Problem statement, Solution, Role, Timeline & Core Metric',
      vi: 'Tóm tắt bài toán: Vấn đề, Giải pháp, Vai trò, Thời gian & Chỉ số cốt lõi',
    },
    iconName: 'Compass',
    defaultData: (): OverviewBlockData => ({
      sectionTitle: { en: 'Executive Overview', vi: 'Tổng Quan Điều Hành' },
      problem: {
        en: 'Legacy systems suffered from high latency and fragmented user journeys.',
        vi: 'Hệ thống cũ gặp phải độ trễ cao và trải nghiệm người dùng phân mảnh.',
      },
      solution: {
        en: 'Engineered a unified design system and reactive atomic state pipeline.',
        vi: 'Thiết kế hệ thống thiết kế hợp nhất và luồng dữ liệu phản ứng tức thì.',
      },
      role: 'Lead Product Designer & Design Technologist',
      timeline: 'Q1 2026 (12 weeks)',
      coreMetric: '+142% Retention Rate',
    }),
  },
  RichText: {
    type: 'RichText',
    label: { en: 'Rich Text / Markdown', vi: 'Văn Bản Markdown' },
    description: {
      en: 'Multi-paragraph narrative, formatted markdown, quotes & lists',
      vi: 'Nội dung văn bản dài, định dạng Markdown, danh sách và trích dẫn',
    },
    iconName: 'FileText',
    defaultData: (): RichTextBlockData => ({
      sectionTitle: { en: 'Deep Dive & Findings', vi: 'Phân Tích Chi Tiết' },
      body: {
        en: '### User Research Insights\n\nThrough 24 qualitative user interviews and quantitative funnel analysis, we uncovered two critical friction points:\n\n1. **Cognitive Overload**: Too many visual stimuli on first paint.\n2. **Slow Handoff**: Lack of shared tokens between design and frontend.\n\n> "Simplifying the interaction path reduced time-to-first-action by 68%."',
        vi: '### Thông Tin Nghiên Cứu Người Dùng\n\nQua 24 cuộc phỏng vấn sâu và phân tích phễu dữ liệu, chúng tôi phát hiện 2 điểm nghẽn chính:\n\n1. **Quá tải nhận thức**: Quá nhiều thông tin hiển thị ngay lần đầu mở.\n2. **Bàn giao chậm**: Thiếu chuẩn token đồng bộ giữa thiết kế và lập trình.\n\n> "Đơn giản hóa luồng tương tác đã giảm 68% thời gian thao tác đầu tiên."',
      },
    }),
  },
  Media: {
    type: 'Media',
    label: { en: 'Media & Gallery', vi: 'Hình Ảnh & So Sánh' },
    description: {
      en: 'High-res showcase image, gallery grid, and interactive Before/After sliders',
      vi: 'Thư viện hình ảnh độ phân giải cao và thanh trượt so sánh Trước/Sau',
    },
    iconName: 'Image',
    defaultData: (): MediaBlockData => ({
      sectionTitle: { en: 'Visual Design & Prototypes', vi: 'Thiết Kế & Bản Mẫu' },
      items: [
        {
          id: `media-${Date.now()}-1`,
          url: '',
          caption: {
            en: 'High-fidelity dark mode dashboard with real-time telemetries.',
            vi: 'Giao diện bảng điều khiển chế độ tối với biểu đồ thời gian thực.',
          },
          aspectRatio: '16/9',
          isBeforeAfter: false,
        },
      ],
    }),
  },
  Stats: {
    type: 'Stats',
    label: { en: 'Impact & Metrics', vi: 'Chỉ Số & Đo Lường' },
    description: {
      en: 'Highlighted metrics cards with key impact numbers and measurable outcomes',
      vi: 'Thẻ chỉ số nổi bật thể hiện kết quả kinh doanh và số liệu tác động',
    },
    iconName: 'BarChart3',
    defaultData: (): StatsBlockData => ({
      sectionTitle: { en: 'Key Business Impact', vi: 'Tác Động Kinh Doanh' },
      items: [
        {
          id: `stat-${Date.now()}-1`,
          value: '+142%',
          label: { en: 'Conversion Rate', vi: 'Tỷ lệ chuyển đổi' },
          note: 'Measured over 90-day cohort',
          changeType: 'positive',
        },
        {
          id: `stat-${Date.now()}-2`,
          value: '< 100ms',
          label: { en: 'Interaction Latency', vi: 'Độ trễ tương tác' },
          note: 'Optimized rendering pipeline',
          changeType: 'positive',
        },
        {
          id: `stat-${Date.now()}-3`,
          value: '4.9 / 5',
          label: { en: 'CSAT Satisfaction', vi: 'Điểm hài lòng CSAT' },
          note: 'Post-launch customer survey',
          changeType: 'positive',
        },
      ],
    }),
  },
  ProcessSteps: {
    type: 'ProcessSteps',
    label: { en: 'Process & Methodology', vi: 'Quy Trình Thực Hiện' },
    description: {
      en: 'Step-by-step product design methodology with deliverables badges',
      vi: 'Các bước quy trình phát triển sản phẩm cùng sản phẩm bàn giao chi tiết',
    },
    iconName: 'GitMerge',
    defaultData: (): ProcessStepsBlockData => ({
      sectionTitle: { en: 'Design & Engineering Process', vi: 'Quy Trình Thiết Kế & Kỹ Thuật' },
      steps: [
        {
          id: `step-${Date.now()}-1`,
          stepNumber: 1,
          title: { en: 'Discovery & Telemetry Audit', vi: 'Khám Phá & Đánh Giá Dữ Liệu' },
          description: {
            en: 'Analyzed legacy telemetry data, mapped user friction points, and conducted stakeholder workshops.',
            vi: 'Phân tích dữ liệu vận hành cũ, lập bản đồ điểm nghẽn và phỏng vấn các bên liên quan.',
          },
          deliverables: ['Telemetry Report', 'Friction Map', 'User Journey Map'],
        },
        {
          id: `step-${Date.now()}-2`,
          stepNumber: 2,
          title: { en: 'Design System & Prototyping', vi: 'Hệ Thống Thiết Kế & Bản Mẫu' },
          description: {
            en: 'Established atomic token variables, dark-mode accessible palettes, and interactive prototypes.',
            vi: 'Xây dựng bộ biến token nguyên tử, bảng màu chế độ tối chuẩn tương phản và bản mẫu tương tác.',
          },
          deliverables: ['Figma Token Kit', 'Interactive Prototype', 'Component Library'],
        },
        {
          id: `step-${Date.now()}-3`,
          stepNumber: 3,
          title: { en: 'Production Build & Validation', vi: 'Lập Trình Thực Tế & Kiểm Thử' },
          description: {
            en: 'Built pixel-perfect React 19 components with zero runtime layout shift and 60fps micro-animations.',
            vi: 'Hiện thực hóa các thành phần React 19 tối ưu 60fps và không có độ trễ giao diện.',
          },
          deliverables: ['Production TSX', 'E2E Test Suite', 'Performance Audit (100)'],
        },
      ],
    }),
  },
  Decision: {
    type: 'Decision',
    label: { en: 'Design Decisions', vi: 'Quyết Định Thiết Kế' },
    description: {
      en: 'Technical and architectural trade-offs: Problem, Choice made, and Rationale',
      vi: 'Lựa chọn đánh đổi thiết kế & kiến trúc: Bài toán, Giải pháp chọn và Lý do',
    },
    iconName: 'GitCommit',
    defaultData: (): DecisionBlockData => ({
      sectionTitle: { en: 'Key Technical & UX Decisions', vi: 'Các Quyết Định Thiết Kế Then Chốt' },
      decisions: [
        {
          id: `dec-${Date.now()}-1`,
          problem: {
            en: 'Choosing between Client-side dynamic rendering vs Static Document snapshot for case studies.',
            vi: 'Lựa chọn giữa kết xuất động phía Client hay tạo bản chụp tĩnh cho các case study.',
          },
          choice: {
            en: 'Hybrid State Pipeline with optimistic TanStack Query & atomic block document schema.',
            vi: 'Kiến trúc Hybrid kết hợp TanStack Query lạc quan và cấu trúc tài liệu khối nguyên tử.',
          },
          rationale: {
            en: 'Enables sub-millisecond local previews while preserving SSR compatibility and instant cold-start loads.',
            vi: 'Cho phép xem trước tức thì dưới 1ms trong khi vẫn giữ khả năng tải trang tĩnh siêu tốc.',
          },
          impact: {
            en: '0ms perceptual lag during editing and 100/100 Lighthouse performance.',
            vi: 'Độ trễ 0ms khi chỉnh sửa và đạt điểm 100/100 tuyệt đối trên Lighthouse.',
          },
        },
      ],
    }),
  },
  Callout: {
    type: 'Callout',
    label: { en: 'Callout & Highlights', vi: 'Hộp Ghi Chú / Trích Dẫn' },
    description: {
      en: 'Accentuated cards for key takeaways, critical warnings, tips, or quotes',
      vi: 'Khối làm nổi bật thông tin cốt lõi, trích dẫn, lời khuyên hoặc cảnh báo',
    },
    iconName: 'AlertTriangle',
    defaultData: (): CalloutBlockData => ({
      sectionTitle: { en: 'Key Takeaway', vi: 'Điểm Nhấn Cốt Lõi' },
      text: {
        en: 'By unifying the design token pipeline with atomic block schemas, we eliminated 90% of cross-team handoff bottlenecks.',
        vi: 'Bằng việc hợp nhất đường ống Token thiết kế với mô hình khối nguyên tử, chúng tôi đã loại bỏ 90% điểm nghẽn bàn giao giữa các đội ngũ.',
      },
      variant: 'tip',
      glowColor: 'cyan',
      author: 'Nguyen Huu Hoang Duy',
      role: 'Lead Product Designer',
    }),
  },
};

export function createDefaultBlock(type: BlockType): ContentBlock {
  const definition = BLOCK_DEFINITIONS[type];
  const uniqueId = `block-${type.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id: uniqueId,
    type,
    visible: true,
    data: definition ? definition.defaultData() : {},
  };
}
