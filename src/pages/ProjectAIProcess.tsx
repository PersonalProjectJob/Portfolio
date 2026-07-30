import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { ZoomableImage } from '../components/ZoomableImage';

const Icon = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const icons = {
  system: <Icon><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"/><path d="m4 7 8 4 8-4"/><path d="M12 11v10"/></Icon>,
  kit: <Icon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>,
  advisor: <Icon><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5C14.4 15.3 14 16.2 14 18h-4c0-1.8-.4-2.7-1.5-3.5Z"/></Icon>,
  graphic: <Icon><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></Icon>,
  bridge: <Icon><path d="M8 12h8"/><path d="M12 8v8"/><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/></Icon>,
  code: <Icon><path d="m8 9-3 3 3 3"/><path d="m16 9 3 3-3 3"/><path d="m14 5-4 14"/></Icon>,
  check: <Icon><path d="m5 12 4 4L19 6"/></Icon>,
  arrow: <Icon><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></Icon>,
};

type SkillCard = {
  id: string;
  icon: ReactNode;
  title: string;
  summary: string;
  outputs: string[];
  value: string;
};

type PageCopy = {
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    meta: string[];
  };
  context: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{ title: string; description: string }>;
  };
  architecture: {
    eyebrow: string;
    title: string;
    description: string;
    steps: Array<{ label: string; description: string }>;
  };
  skills: {
    eyebrow: string;
    title: string;
    description: string;
    cards: SkillCard[];
  };
  workflow: {
    eyebrow: string;
    title: string;
    description: string;
    steps: Array<{ title: string; description: string }>;
  };
  human: {
    eyebrow: string;
    title: string;
    description: string;
    aiTitle: string;
    aiItems: string[];
    humanTitle: string;
    humanItems: string[];
    quote: string;
  };
  outcome: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{ label: string; value: string; description: string }>;
    closing: string;
  };
};

const copy: Record<'vi' | 'en', PageCopy> = {
  vi: {
    hero: {
      eyebrow: 'Figma Agentic Design · Open-source case study',
      title: 'Biến quy trình thiết kế thành',
      highlight: 'năng lực có thể tái sử dụng bởi AI Agent',
      description: 'Một hệ sinh thái skill và plugin kết nối AI Agent với Figma thông qua figma-console MCP — giúp tạo Design System, chuẩn hóa flow, tư vấn pattern và kiểm soát chất lượng thiết kế ngay trên canvas.',
      primaryCta: 'Xem repository',
      secondaryCta: 'Khám phá hệ sinh thái',
      meta: ['Vai trò: Product Designer · Skill Architect', 'Nền tảng: Figma · MCP · React', 'Đầu ra: Skills · Plugins · Workflow'],
    },
    context: {
      eyebrow: '01. Bài toán',
      title: 'AI có thể tạo giao diện nhanh, nhưng chưa tự hiểu hệ thống thiết kế',
      description: 'Khoảng cách lớn nhất không nằm ở khả năng sinh UI, mà ở việc duy trì logic, component, token và tiêu chuẩn handoff xuyên suốt nhiều màn hình và nhiều Agent.',
      cards: [
        { title: 'Kiến thức nằm trong đầu Designer', description: 'Quy tắc chọn pattern, đặt tên, dùng token và tổ chức component thường là tri thức ngầm, khó truyền cho AI một cách ổn định.' },
        { title: 'Figma và code dễ lệch nhau', description: 'Token, component và flow thay đổi ở một phía nhưng không được phản ánh đầy đủ sang phía còn lại, khiến handoff mất tính tin cậy.' },
        { title: 'Tự động hóa thiếu cơ chế kiểm chứng', description: 'AI có thể tạo nhiều layer rất nhanh nhưng vẫn sinh duplicate, sai Auto Layout, clipping hoặc dùng component không nhất quán.' },
      ],
    },
    architecture: {
      eyebrow: '02. Hướng tiếp cận',
      title: 'Đóng gói quyết định thiết kế thành một lớp năng lực cho Agent',
      description: 'Mỗi skill không chỉ là prompt. Nó định nghĩa input, thứ tự thao tác, nguyên tắc ưu tiên, công cụ MCP cần gọi, đầu ra bắt buộc và bước QA trước khi hoàn tất.',
      steps: [
        { label: 'Nguồn sự thật', description: 'Codebase, design tokens, tài liệu thiết kế hoặc component library hiện có.' },
        { label: 'Skill điều phối', description: 'Biến yêu cầu thành workflow có rule, điều kiện dừng và tiêu chí kiểm tra rõ ràng.' },
        { label: 'figma-console MCP', description: 'Cho phép Agent đọc và thao tác trực tiếp với variables, styles, components và layers trong Figma.' },
        { label: 'Figma có cấu trúc', description: 'Design System, flow và assets được tạo theo component, Auto Layout và token thay vì layer rời rạc.' },
        { label: 'QA trước handoff', description: 'Chụp lại màn hình, rà clipping, wrapping, variant bounds và tính nhất quán giữa master với instance.' },
      ],
    },
    skills: {
      eyebrow: '03. Hệ sinh thái Figma skills & plugins',
      title: 'Năm năng lực chính bao phủ toàn bộ vòng đời thiết kế',
      description: 'Từ khởi tạo nền tảng, lắp ráp flow, tư vấn pattern đến xử lý tài nguyên và kết nối nhiều Agent cùng lúc.',
      cards: [
        {
          id: 'create-design-system', icon: icons.system, title: 'Create Design System',
          summary: 'Trích xuất token từ codebase hoặc tài liệu tham chiếu để xây Design System trực tiếp trong Figma.',
          outputs: ['Variable Collections cho màu, spacing và radius', 'Typography, effect và color styles', 'Foundation components cùng variants', 'Mapping chặt chẽ giữa giá trị UI và token'],
          value: 'Giảm thời gian dựng nền tảng và tránh việc Designer hoặc Agent tự tạo giá trị rời rạc.',
        },
        {
          id: 'generate-figma-kit', icon: icons.kit, title: 'Generate Figma Kit',
          summary: 'Audit và đồng bộ các product flow để sẵn sàng cho Dev Mode và design-to-code.',
          outputs: ['Tìm và tái sử dụng component local/library trước', 'Tạo missing master component khi pattern chưa tồn tại', 'Chuyển UI lặp lại thành Auto Layout có nghĩa', 'Thay layer thủ công bằng instance có property override'],
          value: 'Biến một file thiết kế “nhìn đúng” thành một file có cấu trúc đủ tốt để phát triển và mở rộng.',
        },
        {
          id: 'figma-pattern-advisor', icon: icons.advisor, title: 'Figma Pattern Advisor',
          summary: 'Plugin audit selection hiện tại, so khớp với pattern chuẩn và đề xuất component phù hợp theo ngữ cảnh.',
          outputs: ['Phân tích anatomy, text và naming của selection', 'Semantic matching bằng LLM', 'Đề xuất pattern theo Atomic Design', 'Chèn component chuẩn cạnh bản thiết kế gốc'],
          value: 'Đưa tri thức Design System đến đúng thời điểm Designer cần ra quyết định, ngay trên canvas.',
        },
        {
          id: 'remove-background-graphic', icon: icons.graphic, title: 'Remove Background Graphic',
          summary: 'Hỗ trợ tạo, làm sạch và chuẩn hóa graphic assets trước khi đưa vào giao diện.',
          outputs: ['Xử lý nền trong suốt', 'Làm sạch boundary của layer', 'Chuẩn hóa asset để tái sử dụng', 'Đặt graphic đúng ngữ cảnh trong layout'],
          value: 'Giảm các thao tác phụ nhưng tốn thời gian, giúp Designer tập trung vào flow và quyết định sản phẩm.',
        },
        {
          id: 'figma-desktop-bridge-multiport', icon: icons.bridge, title: 'Figma Desktop Bridge · Multi-Port',
          summary: 'Mở rộng Desktop Bridge để nhiều Figma file có thể kết nối với các MCP server/Agent khác nhau.',
          outputs: ['Port selector cho nhiều server đang chạy', 'Ghi nhớ lựa chọn theo từng Figma file', 'Server label để phân biệt Cursor, Claude hoặc Agent khác', 'Tự động kết nối khi chỉ có một server'],
          value: 'Cho phép thử nghiệm và vận hành multi-agent mà không để các phiên kết nối giẫm lên nhau.',
        },
      ],
    },
    workflow: {
      eyebrow: '04. Workflow mẫu',
      title: 'Từ codebase đến một flow Figma sẵn sàng handoff',
      description: 'Các skill được thiết kế để nối tiếp nhau, tạo thành một pipeline thay vì những tác vụ tự động hóa đơn lẻ.',
      steps: [
        { title: 'Đọc ngữ cảnh', description: 'Agent xác định framework, token source, component hiện có và phạm vi flow cần xử lý.' },
        { title: 'Tạo hoặc đồng bộ foundation', description: 'Create Design System dựng variables, styles và component nền tảng dựa trên nguồn sự thật.' },
        { title: 'Lắp ráp flow bằng component', description: 'Generate Figma Kit ưu tiên instance có sẵn, chỉ tạo master mới khi pattern thật sự thiếu.' },
        { title: 'Tư vấn và sửa pattern', description: 'Pattern Advisor kiểm tra selection, giải thích sai lệch và hỗ trợ thay bằng component chuẩn.' },
        { title: 'Kiểm chứng trước khi hoàn tất', description: 'Agent chụp ảnh các vùng thay đổi, rà responsive behavior, clipping và tính nhất quán master–instance.' },
      ],
    },
    human: {
      eyebrow: '05. Human-in-the-loop',
      title: 'Tự động hóa thao tác, không tự động hóa trách nhiệm thiết kế',
      description: 'Agent xử lý phần lặp lại và có thể kiểm chứng. Designer vẫn sở hữu mục tiêu, ngữ cảnh và quyết định có ảnh hưởng đến người dùng.',
      aiTitle: 'AI Agent đảm nhiệm',
      aiItems: ['Đọc token và cấu trúc file', 'Tạo variables, styles và component', 'Tái sử dụng instance trên nhiều flow', 'Phát hiện lệch pattern và lỗi cấu trúc', 'Chuẩn bị bằng chứng QA'],
      humanTitle: 'Designer quyết định',
      humanItems: ['Mục tiêu và phạm vi sản phẩm', 'Pattern nào phù hợp với hành vi người dùng', 'Ngoại lệ nào được phép phá chuẩn', 'Mức độ ưu tiên giữa tốc độ và chất lượng', 'Phê duyệt cuối cùng trước handoff'],
      quote: 'Mục tiêu không phải để AI thiết kế thay con người, mà để quyết định tốt của Designer có thể được thực thi nhất quán ở quy mô lớn hơn.',
    },
    outcome: {
      eyebrow: '06. Giá trị tạo ra',
      title: 'Từ một bộ plugin thành hạ tầng thiết kế có thể mở rộng',
      description: 'Repository không chỉ lưu công cụ. Nó ghi lại cách biến nguyên tắc thiết kế thành workflow mà nhiều Agent, nhiều dự án và nhiều thành viên có thể tái sử dụng.',
      cards: [
        { label: 'Design consistency', value: 'Token-first', description: 'Mọi màu, khoảng cách và kích thước được truy về nguồn token thay vì giá trị tùy ý.' },
        { label: 'Handoff quality', value: 'Component-driven', description: 'Flow được cấu tạo bằng master và instance, hỗ trợ Dev Mode và design-to-code tốt hơn.' },
        { label: 'Agent scalability', value: 'Workflow-based', description: 'Quy tắc và tiêu chí QA nằm trong skill, không phụ thuộc hoàn toàn vào trí nhớ của từng phiên chat.' },
      ],
      closing: 'Đây là cách tôi tiếp cận AI trong thiết kế: xây một hệ thống giúp Agent làm đúng việc, đúng thứ tự và luôn để Designer giữ quyền quyết định cuối cùng.',
    },
  },
  en: {
    hero: {
      eyebrow: 'Figma Agentic Design · Open-source case study',
      title: 'Turning design workflows into',
      highlight: 'reusable capabilities for AI agents',
      description: 'An ecosystem of skills and plugins connecting AI agents to Figma through figma-console MCP — enabling design-system creation, flow standardization, pattern guidance, and design QA directly on the canvas.',
      primaryCta: 'View repository',
      secondaryCta: 'Explore the ecosystem',
      meta: ['Role: Product Designer · Skill Architect', 'Platform: Figma · MCP · React', 'Deliverables: Skills · Plugins · Workflows'],
    },
    context: {
      eyebrow: '01. The problem',
      title: 'AI can generate interfaces quickly, but it does not inherently understand the design system',
      description: 'The hardest gap is not UI generation. It is preserving product logic, components, tokens, and handoff standards across many screens and multiple agents.',
      cards: [
        { title: 'Design knowledge stays tacit', description: 'Pattern choices, naming, token usage, and component structure often live in a designer’s head and are difficult to transfer reliably to AI.' },
        { title: 'Figma and code drift apart', description: 'Tokens, components, and flows change on one side without being fully reflected on the other, weakening handoff confidence.' },
        { title: 'Automation lacks verification', description: 'AI can create layers quickly while still producing duplicates, broken Auto Layout, clipping, or inconsistent component usage.' },
      ],
    },
    architecture: {
      eyebrow: '02. The approach',
      title: 'Package design decisions as an operational capability for agents',
      description: 'Each skill is more than a prompt. It defines inputs, execution order, priorities, MCP tools, required outputs, and QA gates before completion.',
      steps: [
        { label: 'Source of truth', description: 'The codebase, design tokens, design documentation, or an existing component library.' },
        { label: 'Skill orchestration', description: 'Transforms a request into a workflow with rules, stop conditions, and explicit validation criteria.' },
        { label: 'figma-console MCP', description: 'Lets the agent read and modify variables, styles, components, and layers directly in Figma.' },
        { label: 'Structured Figma output', description: 'Design systems, flows, and assets are built with components, Auto Layout, and tokens instead of loose layers.' },
        { label: 'QA before handoff', description: 'Screenshots are reviewed for clipping, wrapping, variant bounds, and master–instance consistency.' },
      ],
    },
    skills: {
      eyebrow: '03. Figma skills & plugin ecosystem',
      title: 'Five core capabilities across the design lifecycle',
      description: 'From foundations and flow assembly to pattern guidance, asset preparation, and multi-agent connectivity.',
      cards: [
        {
          id: 'create-design-system', icon: icons.system, title: 'Create Design System',
          summary: 'Extracts tokens from a codebase or reference document and builds the design system directly in Figma.',
          outputs: ['Variable Collections for color, spacing, and radius', 'Typography, effect, and color styles', 'Foundation components with variants', 'Strict mapping between UI values and tokens'],
          value: 'Reduces foundation work and prevents designers or agents from inventing disconnected values.',
        },
        {
          id: 'generate-figma-kit', icon: icons.kit, title: 'Generate Figma Kit',
          summary: 'Audits and synchronizes product flows so they are ready for Dev Mode and design-to-code.',
          outputs: ['Search local and library components first', 'Create missing masters only when required', 'Convert repeated UI into meaningful Auto Layout', 'Replace manual duplicates with property-driven instances'],
          value: 'Turns a file that merely looks correct into a structured file that can be developed and extended.',
        },
        {
          id: 'figma-pattern-advisor', icon: icons.advisor, title: 'Figma Pattern Advisor',
          summary: 'Audits the current selection, matches it to canonical patterns, and recommends the right component in context.',
          outputs: ['Analyze selection anatomy, text, and naming', 'LLM-powered semantic matching', 'Recommendations aligned with Atomic Design', 'Insert compliant components beside the original'],
          value: 'Brings design-system knowledge to the moment a designer is making a decision on the canvas.',
        },
        {
          id: 'remove-background-graphic', icon: icons.graphic, title: 'Remove Background Graphic',
          summary: 'Supports graphic creation, cleanup, and normalization before assets enter the interface.',
          outputs: ['Transparent background preparation', 'Clean layer boundaries', 'Reusable asset normalization', 'Context-aware placement in layouts'],
          value: 'Removes repetitive production work so designers can focus on product flows and decisions.',
        },
        {
          id: 'figma-desktop-bridge-multiport', icon: icons.bridge, title: 'Figma Desktop Bridge · Multi-Port',
          summary: 'Extends Desktop Bridge so multiple Figma files can connect to different MCP servers or agents.',
          outputs: ['Port selector for active servers', 'Per-file connection preference', 'Server labels for Cursor, Claude, or other agents', 'Silent auto-connect when only one server exists'],
          value: 'Enables multi-agent experimentation without different sessions interfering with each other.',
        },
      ],
    },
    workflow: {
      eyebrow: '04. Example workflow',
      title: 'From codebase to a handoff-ready Figma flow',
      description: 'The skills are designed to connect into a pipeline rather than operate as isolated automations.',
      steps: [
        { title: 'Read the context', description: 'The agent identifies the framework, token source, existing components, and target flow.' },
        { title: 'Create or sync foundations', description: 'Create Design System builds variables, styles, and foundation components from the source of truth.' },
        { title: 'Assemble flows with components', description: 'Generate Figma Kit reuses existing instances and creates a new master only when a pattern is truly missing.' },
        { title: 'Review and correct patterns', description: 'Pattern Advisor audits selections, explains mismatches, and supports replacement with compliant components.' },
        { title: 'Verify before completion', description: 'The agent captures changed areas and checks responsive behavior, clipping, and master–instance consistency.' },
      ],
    },
    human: {
      eyebrow: '05. Human in the loop',
      title: 'Automate execution, not design accountability',
      description: 'Agents handle repeatable and verifiable production work. Designers retain ownership of goals, context, and decisions that affect users.',
      aiTitle: 'AI agent handles',
      aiItems: ['Reading tokens and file structure', 'Creating variables, styles, and components', 'Applying reusable instances across flows', 'Detecting pattern and structure mismatches', 'Preparing QA evidence'],
      humanTitle: 'Designer decides',
      humanItems: ['Product goals and scope', 'Which pattern fits user behavior', 'When an exception should break the standard', 'The trade-off between speed and quality', 'Final approval before handoff'],
      quote: 'The goal is not to make AI design instead of people. It is to make strong design decisions executable with greater consistency and scale.',
    },
    outcome: {
      eyebrow: '06. Value created',
      title: 'From a plugin collection to scalable design infrastructure',
      description: 'The repository does more than store tools. It captures how design principles become reusable workflows across agents, projects, and teams.',
      cards: [
        { label: 'Design consistency', value: 'Token-first', description: 'Every color, spacing value, and dimension traces back to a defined token.' },
        { label: 'Handoff quality', value: 'Component-driven', description: 'Flows are assembled from masters and instances for stronger Dev Mode and design-to-code output.' },
        { label: 'Agent scalability', value: 'Workflow-based', description: 'Rules and QA criteria live in the skill rather than relying on the memory of a single chat session.' },
      ],
      closing: 'This is how I approach AI in design: build a system that helps agents do the right work, in the right order, while the designer keeps final decision authority.',
    },
  },
};

export const ProjectAIProcess: React.FC = () => {
  const { isLightMode, language } = useStore();
  const c = copy[language];
  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800',
    accent: isLightMode ? 'text-indigo-600' : 'text-indigo-400',
    accentBg: isLightMode ? 'bg-indigo-50' : 'bg-indigo-900/20',
    border: isLightMode ? 'border-slate-200' : 'border-slate-800',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'shadow-[0_0_30px_rgba(99,102,241,0.1)]'
  };

  const fadeInUp: any = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  return (
    <CaseStudyLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-indigo-100/50 via-transparent to-transparent' : 'from-indigo-900/20 via-transparent to-transparent'}`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 pt-4">
              <p className={`text-sm font-bold tracking-widest uppercase mb-4 ${theme.accent}`}>{c.hero.eyebrow}</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                {c.hero.title}<br/><span className={theme.accent}>{c.hero.highlight}</span>
              </h1>
              <p className={`text-lg md:text-xl mb-8 leading-relaxed ${theme.textMuted}`}>{c.hero.description}</p>
              
              <div className="flex flex-wrap gap-3 mb-8">
                <a href="https://github.com/PersonalProjectJob/personal-skill-and-plugin" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">
                  {c.hero.primaryCta}{icons.arrow}
                </a>
                <a href="#figma-skill-ecosystem" className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-semibold transition-colors ${theme.card}`}>
                  {c.hero.secondaryCta}
                </a>
              </div>
              <div className="flex flex-col gap-2">
                {c.hero.meta.map((item) => <p key={item} className={`text-sm ${theme.textMuted}`}>{item}</p>)}
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-3xl opacity-20" />
              <ZoomableImage src="/images/case-study/ai_process_cs_1.jpg" alt="Figma agentic design workflow" className="relative z-10 w-full rounded-3xl shadow-2xl object-cover border border-slate-200/20" />
            </div>
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.context.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.context.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.context.description}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {c.context.cards.map((card, index) => (
              <article key={card.title} className={`p-6 rounded-2xl border-l-4 border-l-indigo-500 ${theme.card}`}>
                <span className={`inline-flex w-9 h-9 items-center justify-center rounded-lg ${theme.accentBg} ${theme.accent} font-black mb-5`}>0{index + 1}</span>
                <h3 className={`font-bold text-lg mb-3 ${theme.accent}`}>{card.title}</h3>
                <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{card.description}</p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.architecture.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.architecture.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.architecture.description}</p>
          </div>
          <div className={`rounded-2xl border p-5 md:p-8 ${theme.card}`}>
            <div className="grid md:grid-cols-5 gap-4">
              {c.architecture.steps.map((step, index) => (
                <div key={step.label} className={`relative p-5 rounded-2xl ${theme.accentBg} border ${theme.border}`}>
                  <span className={`text-xs font-bold uppercase tracking-widest ${theme.accent}`}>0{index + 1}</span>
                  <h3 className="font-bold mt-3 mb-2">{step.label}</h3>
                  <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section id="figma-skill-ecosystem" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32 scroll-mt-24">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.skills.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.skills.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.skills.description}</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {c.skills.cards.map((skill, index) => (
              <article key={skill.id} className={`p-6 md:p-8 rounded-2xl border ${theme.card} ${index === 0 ? 'lg:col-span-2' : ''}`}>
                <div className={`${index === 0 ? 'lg:grid lg:grid-cols-[.85fr_1.15fr] lg:gap-10' : ''}`}>
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <span className={`inline-flex w-12 h-12 shrink-0 items-center justify-center rounded-2xl ${theme.accentBg} ${theme.accent}`}>{skill.icon}</span>
                      <code className={`text-xs px-3 py-1.5 rounded-full ${isLightMode ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'}`}>/{skill.id}</code>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{skill.title}</h3>
                    <p className={`leading-relaxed ${theme.textMuted} mb-6`}>{skill.summary}</p>
                  </div>
                  <div>
                    <ul className="space-y-3 mb-6">
                      {skill.outputs.map((item) => (
                        <li key={item} className="flex gap-3 items-start">
                          <span className={`${theme.accent} mt-0.5`}>{icons.check}</span>
                          <span className={`text-sm leading-relaxed ${theme.text}`}>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={`p-4 rounded-xl ${theme.accentBg} ${theme.accent}`}>
                      <p className="text-sm leading-relaxed"><strong>UX value:</strong> {skill.value}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.workflow.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.workflow.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.workflow.description}</p>
          </div>
          <div className="relative pl-6 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-12">
            {c.workflow.steps.map((step) => (
              <div key={step.title} className="relative">
                <div className={`absolute -left-[31px] md:-left-[39px] w-4 h-4 rounded-full bg-indigo-500 ring-4 ${isLightMode ? 'ring-white' : 'ring-[#0f172a]'}`}></div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className={theme.textMuted}>{step.description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.human.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.human.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.human.description}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <article className={`p-6 md:p-8 rounded-2xl border-t-4 border-t-indigo-500 ${theme.card}`}>
              <div className="flex items-center gap-3 mb-6"><span className={theme.accent}>{icons.code}</span><h3 className={`text-xl font-bold ${theme.accent}`}>{c.human.aiTitle}</h3></div>
              <ul className="space-y-4 list-disc list-inside">
                {c.human.aiItems.map((item) => <li key={item} className={theme.textMuted}>{item}</li>)}
              </ul>
            </article>
            <article className={`p-6 md:p-8 rounded-2xl border-t-4 border-t-emerald-500 ${theme.card}`}>
              <div className="flex items-center gap-3 mb-6"><span className="text-emerald-500">{icons.check}</span><h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500">{c.human.humanTitle}</h3></div>
              <ul className="space-y-4 list-disc list-inside">
                {c.human.humanItems.map((item) => <li key={item} className={theme.textMuted}>{item}</li>)}
              </ul>
            </article>
          </div>
          <blockquote className={`p-6 md:p-8 rounded-2xl border-l-4 border-l-indigo-500 ${theme.accentBg} italic text-xl font-medium leading-relaxed ${theme.text}`}>
            {c.human.quote}
          </blockquote>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.outcome.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.outcome.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.outcome.description}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {c.outcome.cards.map((card) => (
              <article key={card.label} className={`p-6 rounded-2xl border-t-4 border-t-indigo-500 ${theme.card}`}>
                <p className={`text-sm uppercase tracking-widest font-bold mb-3 ${theme.accent}`}>{card.label}</p>
                <p className="text-3xl font-black mb-3">{card.value}</p>
                <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{card.description}</p>
              </article>
            ))}
          </div>
          <div className={`mt-10 p-6 md:p-8 rounded-xl ${theme.accentBg} ${theme.accent} font-medium text-center text-lg md:text-xl`}>
            {c.outcome.closing}
          </div>
        </motion.section>
      </div>
    </CaseStudyLayout>
  );
};
