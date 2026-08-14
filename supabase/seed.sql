-- ==============================================================================
-- Portfolio Admin CMS & UTM Engine - Seed Data (Sprint 1)
-- ==============================================================================

-- 1. SEED DEFAULT SITE SETTINGS (Singleton configuration)
INSERT INTO site_settings (
  id,
  profile,
  skills,
  experience,
  process,
  seo_defaults
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '{
    "name": "Trương Nguyễn Sơn Thảo (Son Thao)",
    "title": "Product Designer & UX/UI Designer",
    "headline": "Chuyên sâu về luồng Fintech, tạo mẫu AI MVP & kiến tạo Design System",
    "location": "TP. Hồ Chí Minh, Việt Nam",
    "email": "tnsthao94@gmail.com",
    "telegram": "https://t.me/tnsthao94",
    "linkedin": "https://www.linkedin.com/in/tnsthao94",
    "github": "https://github.com/tnsthao94",
    "bio": {
      "en": "Product Designer and UX/UI Designer specializing in fintech, AI products, SaaS platforms, mobile apps, and complex product workflows.",
      "vi": "Product Designer và UX/UI Designer chuyên sâu về sản phẩm fintech, ứng dụng AI, nền tảng SaaS, mobile app và các luồng nghiệp vụ phức tạp."
    }
  }'::jsonb,
  '{
    "design": ["Product Strategy", "Design Systems", "High-Fidelity Prototyping", "Design Tokens", "Interaction Design"],
    "engineering": ["React 19", "TypeScript", "Vite", "Tailwind CSS v4", "Supabase", "REST / GraphQL"],
    "ai_automation": ["Claude Code", "Gemini", "Antigravity", "Multi-Agent Workflows", "Prompt Architecture"]
  }'::jsonb,
  '[
    {
      "company": "StartechAI",
      "role": "UX Designer - MVP AI Builder",
      "period": "Tháng 8 2025 - Tháng 5 2026",
      "description": "Chuyên trách tạo mẫu MVP nhanh và chuẩn hóa Design System kết hợp công cụ AI (Cryptomap360, Bitcoin Nail Bar, Pateso da cóc Cô Tươi)."
    },
    {
      "company": "StartechAI",
      "role": "UX/UI Designer",
      "period": "Tháng 11 2023 - Tháng 6 2025",
      "description": "Thiết kế luồng trải nghiệm fintech VLINKPAY (Thị trường Mỹ), UX luồng Crypto, Spin Game."
    },
    {
      "company": "Talucan",
      "role": "Designer Tự do",
      "period": "Tháng 3 2023 - Tháng 3 2024",
      "description": "Thiết kế sản phẩm POD và tối ưu hóa hệ thống e-commerce."
    },
    {
      "company": "5S Group",
      "role": "Jr. Graphic/UX-UI Designer",
      "period": "Tháng 1 2020 - Tháng 3 2023",
      "description": "Hỗ trợ thiết kế UX/UI cho WMS/TMS và sản phẩm Quick Order Colgate."
    }
  ]'::jsonb,
  '[
    {"step": 1, "title": "Khám phá / Discover", "desc": "Thấu hiểu & Nghiên cứu người dùng (User Interviews, Empathy Map, Personas)."},
    {"step": 2, "title": "Xác định / Define", "desc": "Định vị vấn đề, Customer Journey Map, Phạm vi & Chiến lược MVP."},
    {"step": 3, "title": "Thiết kế / Design", "desc": "Wireframing, UI System, Prototype tương tác & Visual Design."},
    {"step": 4, "title": "Bàn giao / Deliver", "desc": "A/B Testing, Developer Handoff & Giám sát sau khi ra mắt."}
  ]'::jsonb,
  '{
    "title": "Son Thao — Product Designer & UX/UI Designer",
    "description": "Portfolio of Son Thao, a Product Designer and UX/UI Designer specializing in fintech, AI products, SaaS platforms, mobile apps, and complex product workflows.",
    "og_image": "https://tnsthao94.online/images/og-product-figma.jpg",
    "keywords": ["Son Thao", "Trương Nguyễn Sơn Thảo", "Product Designer", "UX/UI Designer", "Fintech Design", "Design Systems", "React 19", "TypeScript", "AI Workflow"]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  profile = EXCLUDED.profile,
  skills = EXCLUDED.skills,
  experience = EXCLUDED.experience,
  process = EXCLUDED.process,
  seo_defaults = EXCLUDED.seo_defaults,
  updated_at = now();

-- 2. SEED INITIAL 9 CONTENT ENTRIES (CV_PROJECTS)
INSERT INTO content_entries (
  slug,
  route,
  title,
  summary,
  category,
  role,
  status,
  render_mode,
  legacy_key,
  template_key,
  featured,
  sort_order,
  graph_config,
  published_at
) VALUES
-- 1. CryptoMap
(
  'cryptomap',
  '/case-study/cryptomap',
  '{"en": "CryptoMap 360 - Web3 Analytics Platform", "vi": "CryptoMap 360 - Nền tảng Phân tích Web3"}'::jsonb,
  '{"en": "Multi-chain asset tracking & crypto market intelligence platform.", "vi": "Nền tảng theo dõi tài sản đa chuỗi & thông tin thị trường crypto."}'::jsonb,
  'Web3 & Fintech',
  'Lead Product Designer',
  'published',
  'legacy',
  'cryptomap',
  'standard',
  true,
  1,
  '{
    "shortName": "CryptoMap360",
    "zone": "product",
    "parentId": "nexora",
    "edgeType": "primary-flow",
    "order": 2,
    "eyebrow": "Web3 Product",
    "positionOverride": { "x": 0.51, "y": 0.55 },
    "noteAnchor": "right"
  }'::jsonb,
  now()
),
-- 2. NailHub
(
  'nailhub',
  '/case-study/nailhub',
  '{"en": "NailHub - Salon Operations & POS SaaS", "vi": "NailHub - Nền tảng Quản lý Salon & POS"}'::jsonb,
  '{"en": "End-to-end booking, POS & customer retention platform for US nail salons.", "vi": "Hệ thống đặt lịch, POS và chăm sóc khách hàng cho tiệm nail tại Mỹ."}'::jsonb,
  'B2B SaaS',
  'Product Architect & Lead Designer',
  'published',
  'legacy',
  'nailhub',
  'standard',
  true,
  2,
  '{
    "shortName": "NailHub",
    "zone": "product",
    "parentId": "cryptomap",
    "edgeType": "primary-flow",
    "order": 3,
    "eyebrow": "B2B SaaS",
    "positionOverride": { "x": 0.46, "y": 0.68 },
    "noteAnchor": "right"
  }'::jsonb,
  now()
),
-- 3. Nexora
(
  'nexora',
  '/case-study/nexora',
  '{"en": "NEXORA - Smart Hardware Interface", "vi": "NEXORA - Giao diện Thiết bị Thông minh"}'::jsonb,
  '{"en": "Next-generation industrial IoT control surface and embedded display system.", "vi": "Giao diện điều khiển IoT công nghiệp và hệ thống hiển thị nhúng."}'::jsonb,
  'Hardware & Interface',
  'Principal UX/UI Designer',
  'published',
  'legacy',
  'nexora',
  'standard',
  true,
  3,
  '{
    "shortName": "NEXORA",
    "zone": "product",
    "parentId": "profile",
    "edgeType": "primary-flow",
    "order": 1,
    "eyebrow": "Hardware & Interface",
    "positionOverride": { "x": 0.52, "y": 0.41 },
    "noteAnchor": "right"
  }'::jsonb,
  now()
),
-- 4. VLinkPay
(
  'vlinkpay',
  '/case-study/vlinkpay',
  '{"en": "VLINKPAY - Cross-border Payment Gateway", "vi": "VLINKPAY - Cổng thanh toán xuyên biên giới"}'::jsonb,
  '{"en": "High-throughput merchant acquiring and multi-currency settlement gateway.", "vi": "Cổng thanh toán thương mại và quyết toán đa tiền tệ tốc độ cao."}'::jsonb,
  'Fintech Platform',
  'Lead Product Designer',
  'published',
  'legacy',
  'vlinkpay',
  'standard',
  true,
  4,
  '{
    "shortName": "VLINKPAY",
    "zone": "product",
    "parentId": "nailhub",
    "edgeType": "primary-flow",
    "order": 4,
    "eyebrow": "Fintech Platform",
    "positionOverride": { "x": 0.36, "y": 0.78 },
    "noteAnchor": "left"
  }'::jsonb,
  now()
),
-- 5. AI Process
(
  'ai-process',
  '/case-study/ai-process',
  '{"en": "AI-Augmented Product Workflows", "vi": "Quy trình Phát triển Tích hợp AI"}'::jsonb,
  '{"en": "Deep agentic workflow integration into product lifecycle & prototyping.", "vi": "Tích hợp AI Agent sâu vào vòng đời phát triển sản phẩm & tạo mẫu."}'::jsonb,
  'AI & Methodologies',
  'Design Technologist',
  'published',
  'legacy',
  'ai-process',
  'standard',
  false,
  5,
  '{
    "shortName": "AI Process",
    "zone": "process",
    "order": 1,
    "eyebrow": "AI Integration",
    "positionOverride": { "x": 0.25, "y": 0.13 },
    "noteAnchor": "left"
  }'::jsonb,
  now()
),
-- 6. Handoff
(
  'handoff',
  '/case-study/handoff',
  '{"en": "Zero-Friction Design-to-Code Handoff", "vi": "Quy trình Bàn giao Design-to-Code Tự động"}'::jsonb,
  '{"en": "Production-grade design token pipelines and sync automation tools.", "vi": "Hệ thống đồng bộ Token thiết kế và pipeline tự động hóa mã nguồn."}'::jsonb,
  'Process & Tooling',
  'Design System Engineer',
  'published',
  'legacy',
  'handoff',
  'standard',
  false,
  6,
  '{
    "shortName": "Handoff",
    "zone": "process",
    "order": 2,
    "eyebrow": "Process",
    "positionOverride": { "x": 0.75, "y": 0.13 },
    "noteAnchor": "right"
  }'::jsonb,
  now()
),
-- 7. Dispatch
(
  'dispatch',
  '/case-study/dispatch',
  '{"en": "Multi-Agent Dispatch & Task Queue", "vi": "Hệ thống Điều phối Đa Agent & Hàng đợi Nhiệm vụ"}'::jsonb,
  '{"en": "Distributed orchestrator coordinating AI agents for automated delivery.", "vi": "Hệ thống điều phối phân tán các tác tử AI phục vụ bàn giao tự động."}'::jsonb,
  'Automation Engineering',
  'Systems & Prompt Architect',
  'published',
  'legacy',
  'dispatch',
  'standard',
  false,
  7,
  '{
    "shortName": "Dispatch",
    "zone": "automation",
    "parentId": "vlinkpay",
    "edgeType": "automation-sequence",
    "order": 1,
    "eyebrow": "Automation 01",
    "positionOverride": { "x": 0.19, "y": 0.81 },
    "noteAnchor": "bottom"
  }'::jsonb,
  now()
),
-- 8. Agent Rules
(
  'agent-rules',
  '/case-study/agent-rules',
  '{"en": "Agent Rules Engine & Dynamic Policy Control", "vi": "Bộ Quy tắc Agent & Kiểm soát Chính sách Động"}'::jsonb,
  '{"en": "Standardized agent operational procedures, invariants, and automated compliance.", "vi": "Quy trình vận hành chuẩn cho Agent và kiểm tra tuân thủ tự động."}'::jsonb,
  'Governance & AI Systems',
  'AI Governance Lead',
  'published',
  'legacy',
  'agent-rules',
  'standard',
  false,
  8,
  '{
    "shortName": "Agent Rules",
    "zone": "automation",
    "parentId": "dispatch",
    "edgeType": "automation-sequence",
    "order": 2,
    "eyebrow": "Automation 02",
    "positionOverride": { "x": 0.10, "y": 0.66 },
    "noteAnchor": "left"
  }'::jsonb,
  now()
),
-- 9. Sync Task Badge
(
  'sync-task-badge',
  '/case-study/sync-task-badge',
  '{"en": "Real-time Sync & Telegram Automation", "vi": "Đồng bộ Trạng thái Thời gian thực & Telegram"}'::jsonb,
  '{"en": "Bi-directional status broadcasting and automated issue triage via Telegram.", "vi": "Phát sóng trạng thái hai chiều và xử lý sự cố tự động qua Telegram."}'::jsonb,
  'Telemetry & Devops',
  'DevOps & Integration Engineer',
  'published',
  'legacy',
  'sync-task-badge',
  'standard',
  false,
  9,
  '{
    "shortName": "Status Report",
    "zone": "automation",
    "parentId": "agent-rules",
    "edgeType": "automation-sequence",
    "order": 3,
    "eyebrow": "Automation 03",
    "positionOverride": { "x": 0.18, "y": 0.49 },
    "noteAnchor": "top"
  }'::jsonb,
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  category = EXCLUDED.category,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  render_mode = EXCLUDED.render_mode,
  legacy_key = EXCLUDED.legacy_key,
  graph_config = EXCLUDED.graph_config,
  updated_at = now();

-- 3. SEED STANDARD TRACKING LINKS (4 Existing Channels)
INSERT INTO tracking_links (
  slug,
  destination_path,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  clicks_count,
  is_active
) VALUES
(
  'linkedin',
  '/',
  'linkedin',
  'social',
  'portfolio',
  'profile',
  0,
  true
),
(
  'cv-link',
  '/',
  'cv',
  'document',
  'job_application',
  'cv_pdf',
  0,
  true
),
(
  'recruiter',
  '/',
  'recruiter_email',
  'email',
  'job_application',
  'portfolio_link',
  0,
  true
),
(
  'zalo',
  '/',
  'zalo',
  'message',
  'portfolio',
  'shared_link',
  0,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  destination_path = EXCLUDED.destination_path,
  utm_source = EXCLUDED.utm_source,
  utm_medium = EXCLUDED.utm_medium,
  utm_campaign = EXCLUDED.utm_campaign,
  utm_content = EXCLUDED.utm_content,
  is_active = EXCLUDED.is_active,
  updated_at = now();
