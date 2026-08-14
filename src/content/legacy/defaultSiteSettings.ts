import type { SiteSettings } from '../../cms/types/cms.types';

/**
 * Default Static Site Settings
 * Provides a resilient offline fallback for profile, skills, experience, process, and SEO metadata.
 * Reflects the authentic profile of Truong Nguyen Son Thao (Son Thao).
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  profile: {
    name: 'Trương Nguyễn Sơn Thảo (Son Thao)',
    title: 'Product Designer & UX/UI Designer',
    headline: 'Chuyên sâu về luồng Fintech, tạo mẫu AI MVP & kiến tạo Design System',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    email: 'tnsthao94@gmail.com',
    telegram: 'https://t.me/tnsthao94',
    linkedin: 'https://www.linkedin.com/in/tnsthao94',
    github: 'https://github.com/tnsthao94',
    avatar: '/avatar.jpg',
    cv_path: '/cv/Truong-Nguyen-Son-Thao-Product-Designer-CV.pdf',
    bio: {
      en: 'Product Designer and UX/UI Designer specializing in fintech, AI products, SaaS platforms, mobile apps, and complex product workflows.',
      vi: 'Product Designer và UX/UI Designer chuyên sâu về sản phẩm fintech, ứng dụng AI, nền tảng SaaS, mobile app và các luồng nghiệp vụ phức tạp.',
    },
  },
  skills: {
    design: [
      'Product Strategy',
      'Design Systems',
      'High-Fidelity Prototyping',
      'Design Tokens',
      'Interaction Design',
      'Information Architecture',
      'User Research & Usability Testing',
    ],
    engineering: [
      'React 19',
      'TypeScript',
      'Vite',
      'Tailwind CSS v4',
      'Zustand',
      'Supabase',
      'REST & GraphQL APIs',
      'Framer Motion',
    ],
    ai_automation: [
      'Claude Code',
      'Gemini & Antigravity',
      'Multi-Agent Workflows',
      'Prompt Architecture',
      'Automated Telemetry & QA',
      'Cursor & AI Tooling',
    ],
  },
  experience: [
    {
      company: 'StartechAI',
      role: 'UX Designer - MVP AI Builder',
      period: 'Tháng 8 2025 - Tháng 5 2026',
      description: {
        en: 'Specialized in rapid MVP prototyping and design systems using AI acceleration tools.',
        vi: 'Chuyên trách tạo mẫu MVP nhanh và chuẩn hóa Design System kết hợp công cụ AI.',
      },
      details: [
        'Dự án: Cryptomap360, Bitcoin Nail Bar, Pateso da cóc Cô Tươi.',
        'Chuyên xây dựng và thiết kế MVPs sử dụng AI (Figma Make, Supabase, Cursor, Deepseek).',
        'Thực hiện nghiên cứu người dùng, thiết kế luồng tìm kiếm và hệ thống UI mở rộng.',
        'Phối hợp với PM và Backend Dev để xác định logic và tính khả thi.',
      ],
    },
    {
      company: 'StartechAI',
      role: 'UX/UI Designer',
      period: 'Tháng 11 2023 - Tháng 6 2025',
      description: {
        en: 'Designed mission-critical fintech and POS workflows for global markets.',
        vi: 'Thiết kế luồng trải nghiệm fintech và hệ thống POS phục vụ thị trường quốc tế.',
      },
      details: [
        'Dự án chính: VLINKPAY (Thị trường Mỹ), UX luồng Crypto, Spin Game.',
        'Phân tích yêu cầu, brainstorm giải pháp, và thiết kế wireframe.',
        'Phối hợp với BA & Dev trong quá trình grooming và triển khai.',
        'Theo dõi sản phẩm sau khi ra mắt và xử lý phản hồi người dùng.',
      ],
    },
    {
      company: 'Talucan (Thương mại điện tử)',
      role: 'Designer Tự do',
      period: 'Tháng 3 2023 - Tháng 3 2024',
      description: {
        en: 'Designed POD product interfaces and managed e-commerce storefronts.',
        vi: 'Thiết kế sản phẩm POD và tối ưu hóa hệ thống e-commerce.',
      },
      details: [
        'Thiết kế sản phẩm POD.',
        'Chỉnh sửa và tối ưu hóa các website WordPress.',
      ],
    },
    {
      company: '5S Group',
      role: 'Jr. Graphic/UX-UI Designer',
      period: 'Tháng 1 2020 - Tháng 3 2023',
      description: {
        en: 'Supported UX/UI design for enterprise logistics and warehouse management systems.',
        vi: 'Hỗ trợ thiết kế UX/UI cho hệ thống quản lý logistics và kho bãi doanh nghiệp.',
      },
      details: [
        'Hỗ trợ phân tích và thiết kế UX/UI cho WMS (Kho) và TMS (Vận tải).',
        'Thiết kế sản phẩm outsource "Quick Order" cho sử dụng nội bộ của Colgate.',
        'Thiết kế banner và ấn phẩm marketing.',
      ],
    },
  ],
  process: [
    {
      step: 1,
      title: {
        en: 'Discover',
        vi: 'Khám phá',
      },
      desc: {
        en: 'Empathy & Research',
        vi: 'Thấu hiểu & Nghiên cứu',
      },
      icon: '🔍',
      details: [
        'User Interviews (Insight analysis)',
        'Empathy Map (JTBD)',
        'User Personas',
      ],
    },
    {
      step: 2,
      title: {
        en: 'Define',
        vi: 'Xác định',
      },
      desc: {
        en: 'Problem Alignment',
        vi: 'Định vị vấn đề',
      },
      icon: '🎯',
      details: [
        'Customer Journey Map',
        'Problem Statement',
        'Scope & MVP Strategy',
      ],
    },
    {
      step: 3,
      title: {
        en: 'Design',
        vi: 'Thiết kế',
      },
      desc: {
        en: 'Ideation & Prototyping',
        vi: 'Ý tưởng & Tạo mẫu',
      },
      icon: '✨',
      details: [
        'Wireframing & UI System',
        'Interactive Prototyping',
        'Visual Design',
      ],
    },
    {
      step: 4,
      title: {
        en: 'Deliver',
        vi: 'Bàn giao',
      },
      desc: {
        en: 'Test & Ship',
        vi: 'Kiểm thử & Triển khai',
      },
      icon: '🚀',
      details: [
        'A/B Testing & Usability',
        'Developer Handoff',
        'Monitor Post-release',
      ],
    },
  ],
  seo_defaults: {
    title: 'Son Thao — Product Designer & UX/UI Designer',
    description: 'Portfolio of Son Thao, a Product Designer and UX/UI Designer specializing in fintech, AI products, SaaS platforms, mobile apps, and complex product workflows.',
    og_image: 'https://tnsthao94.online/images/og-product-figma.jpg',
    keywords: [
      'Son Thao',
      'Trương Nguyễn Sơn Thảo',
      'Product Designer',
      'UX/UI Designer',
      'Fintech Design',
      'Design Systems',
      'React 19',
      'TypeScript',
      'AI Workflow',
    ],
  },
  created_at: '2026-08-14T00:00:00Z',
  updated_at: '2026-08-14T00:00:00Z',
};
