import React, { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { useStore } from '../store/useStore';

type Language = 'vi' | 'en';

type Decision = {
  number: string;
  eyebrow: string;
  title: string;
  problem: string;
  decision: string;
  rationale: string;
  tradeOff: string;
  image: string;
  alt: string;
  accent: string;
  surface: string;
};

type Metric = {
  value: string;
  label: string;
  note: string;
  accent: string;
};

const COPY = {
  vi: {
    hero: {
      tag: 'Case study sản phẩm thực tế',
      titleBefore: 'Kết nối',
      titleAccent: 'Crypto',
      titleAfter: 'với thế\u00A0giới\u00A0thực',
      description:
        'Thiết kế trải nghiệm khám phá địa điểm, dữ liệu thị trường và quy trình listing trong một hệ sinh thái bản đồ crypto mobile-first.',
      proof: ['200+ địa điểm được lập bản đồ', 'MVP sprint 2 tuần', 'Web app mobile-first'],
      imageCaption:
        'Dashboard bản đồ toàn cầu — bằng chứng sản phẩm hiện có trong source code.',
    },
    section: {
      overview: '01. Tổng quan dự án',
      challenge: '02. Bài toán & phạm vi',
      research: '03. Discovery & Research',
      strategy: '04. Product Strategy',
      decisions: '05. Quyết định thiết kế',
      performance: '06. Hiệu năng & kết quả',
      reflection: '07. Retrospective',
    },
    snapshot: {
      title: 'Project snapshot',
      items: [
        { label: 'Vai trò', value: 'Product Designer' },
        { label: 'Thời gian', value: '02–05/2026', note: 'MVP build sprint: 2 tuần' },
        { label: 'Nền tảng', value: 'Web app mobile-first' },
        { label: 'Bối cảnh', value: 'Sản phẩm fintech / Web3' },
      ],
      contributionTitle: 'Phạm vi đóng góp của tôi',
      contributions: [
        'Tổng hợp research và xác định vấn đề sản phẩm.',
        'Thiết kế information architecture, search/filter flow và map interaction.',
        'Thiết kế trải nghiệm merchant discovery, market data và listing wizard.',
        'Xây dựng UI system có khả năng mở rộng và phối hợp design QA với PM/Engineering.',
      ],
      boundaryTitle: 'Ranh giới trách nhiệm',
      boundary:
        'Case study tập trung vào product discovery, UX architecture và design execution. Backend, data ingestion và analytics instrumentation là phạm vi phối hợp cùng Engineering.',
    },
    challenge: {
      title: 'Từ dữ liệu phân mảnh đến một hành trình có thể hành động',
      userProblemTitle: 'Vấn đề người dùng',
      userProblem:
        'Người sở hữu crypto không dễ xác định địa điểm nào thực sự chấp nhận thanh toán, hỗ trợ tài sản nào và dữ liệu còn cập nhật hay không.',
      businessProblemTitle: 'Vấn đề hệ sinh thái',
      businessProblem:
        'Nguồn cung merchant và dự án crypto cần một quy trình listing có kiểm soát để mở rộng coverage mà không làm giảm chất lượng dữ liệu.',
      constraintsTitle: 'Ràng buộc chính',
      constraints: [
        'MVP cần được thiết kế và đưa vào triển khai trong sprint 2 tuần.',
        'Bản đồ phải xử lý hơn 200 địa điểm mà vẫn dễ đọc trên mobile.',
        'Dữ liệu thị trường dày đặc nhưng không được làm tăng cognitive load.',
        'Listing mới cần validation và lớp admin verification.',
      ],
      successTitle: 'Tiêu chí thành công của MVP',
      success: [
        'Người dùng tìm được địa điểm phù hợp theo WHERE / WHAT / COIN.',
        'Thông tin trust và supported assets xuất hiện đúng lúc ra quyết định.',
        'Merchant/project có luồng onboarding rõ ràng và có kiểm duyệt.',
        'Trải nghiệm map-heavy vẫn giữ mức tương tác tốt trên thiết bị phổ biến.',
      ],
    },
    research: {
      title: 'Research được dùng để định hình sản phẩm',
      description:
        'Bằng chứng hiện có cho thấy dự án sử dụng desk research, competitive audit, persona synthesis và custom journey mapping. Case study không tuyên bố sample size phỏng vấn hoặc usability test khi source hiện tại chưa cung cấp dữ liệu đó.',
      methods: [
        {
          number: '01',
          title: 'Desk research',
          description:
            'Tổng hợp bối cảnh adoption, thị trường mới nổi và sự dịch chuyển use case từ đầu cơ sang thanh toán, remittance và stablecoin.',
        },
        {
          number: '02',
          title: 'Competitive audit',
          description:
            'Đối chiếu CoinGecko, CoinATMRadar và Coinmap để tìm khoảng trống giữa market data, geo discovery và physical adoption.',
        },
        {
          number: '03',
          title: 'Persona synthesis',
          description:
            'Tách nhu cầu của crypto holder/traveler và merchant owner để tránh thiết kế một flow chung cho hai mục tiêu khác nhau.',
        },
        {
          number: '04',
          title: 'Journey mapping',
          description:
            'Mô hình hóa hành trình từ nhu cầu chi tiêu crypto đến tìm địa điểm, đánh giá trust và hoàn tất giao dịch.',
        },
      ],
      evidence1Title: 'Bằng chứng 01 — Bối cảnh adoption',
      evidence1Caption:
        'Biểu đồ research hiện có trong dự án. Nên bổ sung URL nguồn, năm xuất bản và ngày truy cập trong phiên bản public.',
      competitorTitle: 'Khoảng trống cạnh tranh',
      strengthsLabel: 'Điểm mạnh',
      gapsLabel: 'Khoảng trống',
      competitors: [
        {
          name: 'CoinGecko',
          strengths: ['Market data mạnh', 'Exchange ranking', 'Volume, liquidity, trust score'],
          gaps: ['Thiếu physical adoption layer', 'Không có geo-based UX', 'Không kết nối offline utility'],
        },
        {
          name: 'CoinATMRadar',
          strengths: ['Tập trung crypto ATM', 'Có fee và operator data'],
          gaps: ['Phạm vi chủ yếu là ATM', 'Không có merchant discovery', 'Thiếu exchange/project listing'],
        },
        {
          name: 'Coinmap',
          strengths: ['Hiển thị merchant nhận Bitcoin', 'Coverage toàn cầu'],
          gaps: ['UX cũ và khó mở rộng', 'Thiếu market/exchange layer', 'Thiếu workflow giao dịch và ecosystem integration'],
        },
      ],
      usersTitle: 'Hai nhóm người dùng cốt lõi',
      users: [
        {
          title: 'Crypto holder / Traveler',
          needs: ['Tìm địa điểm gần hoặc tại thành phố sắp đến', 'Biết coin/network được hỗ trợ', 'Xác định listing có đáng tin và còn hoạt động'],
        },
        {
          title: 'Merchant / Project owner',
          needs: ['Xuất hiện trong ecosystem', 'Khai báo dữ liệu theo từng bước', 'Theo dõi trạng thái kiểm duyệt trước khi được public'],
        },
      ],
      personaCaption: 'Persona evidence giữ nguyên từ file hiện tại.',
      journeyTitle: 'Custom journey map',
      journeyCaption: 'Journey-map evidence giữ nguyên từ file hiện tại.',
    },
    strategy: {
      title: 'Kiến trúc xoay quanh ba công việc chính',
      pillars: [
        {
          number: '01',
          title: 'Discover',
          description: 'Khám phá địa điểm bằng map, location context và intent filters.',
        },
        {
          number: '02',
          title: 'Evaluate',
          description: 'Đánh giá trust, market movement và supported assets ngay trong hành trình.',
        },
        {
          number: '03',
          title: 'Contribute',
          description: 'Đưa merchant/project mới vào hệ sinh thái qua wizard và admin verification.',
        },
      ],
      journeyTitle: 'Core user journey',
      journey: [
        { title: 'Trigger', description: 'Người dùng cần tìm nơi có thể sử dụng crypto.' },
        { title: 'Narrow intent', description: 'Chọn WHERE / WHAT / COIN để giảm không gian tìm kiếm.' },
        { title: 'Evaluate', description: 'Xem merchant detail, trust signal và supported assets.' },
        { title: 'Act', description: 'Đi đến địa điểm hoặc tiếp tục flow liên quan.' },
      ],
      iaTitle: 'Information architecture',
      ia: [
        '1.0 Global Map / Home',
        '1.1 Merchant Detail — bottom sheet / side panel',
        '1.2 Advanced Filters — WHERE / WHAT / COIN',
        '2.0 Market Watch — market context & assets',
        '3.0 B2B Portal',
        '3.1 Merchant / Project Listing Wizard',
        '3.2 Admin Verification State',
      ],
    },
    decisions: {
      title: 'Mỗi màn hình gắn với một quyết định sản phẩm',
      principleLabel: 'Nguyên tắc',
      tradeOffLabel: 'Trade-off',
      items: [
        {
          number: '01',
          eyebrow: 'Discover with intent',
          title: 'Giảm map overload trước khi hiển thị chi tiết',
          problem:
            'Render trực tiếp hơn 200 marker làm bản đồ khó scan và tăng chi phí tương tác, đặc biệt trên mobile.',
          decision:
            'Dùng marker clustering làm trạng thái mặc định; WHERE / WHAT / COIN giúp người dùng thể hiện intent trước khi zoom vào từng merchant.',
          rationale:
            'Ưu tiên overview trước, sau đó progressive disclosure theo mức độ cụ thể của nhu cầu.',
          tradeOff:
            'Clustering che bớt từng địa điểm ở zoom level thấp, nhưng đổi lại người dùng hiểu mật độ và khu vực nhanh hơn.',
          image: '/images/case-study/cryptomap_global_dashboard.png',
          alt: 'CryptoMap360 global dashboard với marker clustering và intent filters',
          accent: 'text-amber-400',
          surface: 'bg-amber-500/10 border-amber-500/20',
        },
        {
          number: '02',
          eyebrow: 'Build trust',
          title: 'Đưa market context đến đúng thời điểm quyết định',
          problem:
            'Market data dày đặc dễ biến sản phẩm thành dashboard đầu tư và làm lệch mục tiêu tìm utility thực tế.',
          decision:
            'Chỉ ưu tiên price movement, verification state và supported assets; dùng màu để truyền trạng thái thay vì trang trí.',
          rationale:
            'Thông tin thị trường phải hỗ trợ quyết định, không cạnh tranh sự chú ý với map discovery.',
          tradeOff:
            'Giảm số lượng data point trên overview; người dùng chuyên sâu cần mở thêm trang market detail.',
          image: '/images/case-study/cryptomap_market_live.png',
          alt: 'CryptoMap360 market page với market cap, trending assets, gainers và bảng giá',
          accent: 'text-cyan-400',
          surface: 'bg-cyan-500/10 border-cyan-500/20',
        },
        {
          number: '03',
          eyebrow: 'Grow verified supply',
          title: 'Biến chất lượng dữ liệu thành một phần của user flow',
          problem:
            'Cho phép listing tự do giúp tăng coverage nhanh nhưng dễ tạo dữ liệu trùng, sai hoặc không còn hoạt động.',
          decision:
            'Chia form thành multi-step wizard, validation tại chỗ và trạng thái chờ admin verification trước khi public.',
          rationale:
            'Data quality không nên là tác vụ back-office tách rời; nó phải được thiết kế ngay từ điểm nhập dữ liệu.',
          tradeOff:
            'Onboarding dài hơn một form đơn, nhưng giảm lỗi và giúp người gửi hiểu tiến trình phê duyệt.',
          image: '/images/case-study/cryptomap_wizard.png',
          alt: 'CryptoMap360 multi-step listing wizard',
          accent: 'text-violet-400',
          surface: 'bg-violet-500/10 border-violet-500/20',
        },
      ] satisfies Decision[],
    },
    performance: {
      title: 'Hiệu năng được xử lý như một phần của UX',
      description:
        'Map-heavy products có thể đúng về chức năng nhưng vẫn thất bại nếu pan, zoom, filter hoặc list update tạo cảm giác chậm. Thiết kế và triển khai cùng tập trung vào clustering, virtualized list và API sequencing.',
      techniques: ['Marker clustering', 'Virtualized lists', 'API sequencing', 'Progressive disclosure'],
      metrics: [
        { value: '80/100', label: 'Performance score', note: 'Snapshot sau tối ưu trong case study hiện tại', accent: 'text-amber-300' },
        { value: '3.3s', label: 'Largest Contentful Paint', note: 'Với giao diện chứa bản đồ và dữ liệu lớn', accent: 'text-cyan-300' },
        { value: '170ms', label: 'Interaction to Next Paint', note: 'Mức Good theo dữ liệu hiện có', accent: 'text-emerald-300' },
      ] satisfies Metric[],
      outcomesTitle: 'Kết quả có thể xác nhận từ artifact hiện tại',
      outcomes: [
        { value: '200+', label: 'Địa điểm được lập bản đồ', note: 'Coverage hiển thị trong sản phẩm' },
        { value: '2 tuần', label: 'MVP build sprint', note: 'Nằm trong engagement 02–05/2026' },
        { value: '8.68k', label: 'Requests được ghi nhận', note: 'Cần ghi rõ là API calls, searches hay sessions trước khi dùng làm product KPI' },
      ],
      note:
        'Các con số trên được giữ từ file hiện tại. Để portfolio có độ tin cậy cao hơn, hãy bổ sung công cụ đo, thiết bị/network, khoảng thời gian và định nghĩa chính xác của “requests”.',
    },
    reflection: {
      title: 'Điều case study chứng minh — và chưa chứng minh',
      provesTitle: 'Đã chứng minh',
      proves: [
        'Có thể đi từ market problem đến IA và end-to-end MVP scope.',
        'Có khả năng xử lý tương tác map-heavy, dữ liệu dày và workflow nhiều bước.',
        'Có tư duy kết nối UX decision với data quality và technical feasibility.',
      ],
      boundaryTitle: 'Chưa nên tuyên bố',
      boundaries: [
        'Chưa có bằng chứng trong source về sample size usability test.',
        'Chưa có conversion, retention hoặc merchant activation rate.',
        '8.68k requests chưa đủ định nghĩa để xem là user impact.',
      ],
      learningsTitle: 'Bài học chính',
      learnings: [
        'Với sản phẩm địa lý, performance và information density là thành phần của trải nghiệm chứ không phải việc tối ưu sau cùng.',
        'Độ tin cậy cần được thể hiện tại điểm quyết định và được bảo vệ ngay từ flow nhập dữ liệu.',
      ],
      nextTitle: 'Bước tiếp theo hợp lý',
      next: [
        'Đo task completion cho bài toán “tìm merchant chấp nhận một coin cụ thể”.',
        'Theo dõi map → merchant detail → navigation/transaction intent funnel.',
        'Thiết lập freshness score, owner confirmation và cơ chế report listing sai.',
        'Đo listing completion, rejection reason và time-to-approval cho B2B portal.',
      ],
    },
  },
  en: {
    hero: {
      tag: 'Live product case study',
      titleBefore: 'Connecting',
      titleAccent: 'Crypto',
      titleAfter: 'to the real\u00A0world',
      description:
        'A mobile-first experience for discovering real-world locations, understanding market context and contributing verified listings to a crypto map ecosystem.',
      proof: ['200+ mapped locations', '2-week MVP sprint', 'Mobile-first web app'],
      imageCaption:
        'Global map dashboard — existing product evidence preserved from the current source.',
    },
    section: {
      overview: '01. Project overview',
      challenge: '02. Challenge & scope',
      research: '03. Discovery & research',
      strategy: '04. Product strategy',
      decisions: '05. Design decisions',
      performance: '06. Performance & outcomes',
      reflection: '07. Retrospective',
    },
    snapshot: {
      title: 'Project snapshot',
      items: [
        { label: 'Role', value: 'Product Designer' },
        { label: 'Timeline', value: 'Feb–May 2026', note: 'MVP build sprint: 2 weeks' },
        { label: 'Platform', value: 'Mobile-first web app' },
        { label: 'Domain', value: 'Fintech / Web3' },
      ],
      contributionTitle: 'My contribution',
      contributions: [
        'Synthesized research and framed the product problem.',
        'Designed the information architecture, search/filter flow and map interactions.',
        'Designed merchant discovery, market data and listing-wizard experiences.',
        'Built a scalable UI system and collaborated with PM/Engineering on design QA.',
      ],
      boundaryTitle: 'Responsibility boundary',
      boundary:
        'This case study focuses on product discovery, UX architecture and design execution. Backend implementation, data ingestion and analytics instrumentation were collaboration areas with Engineering.',
    },
    challenge: {
      title: 'Turning fragmented data into an actionable journey',
      userProblemTitle: 'User problem',
      userProblem:
        'Crypto holders cannot easily confirm which locations genuinely accept crypto, which assets they support or whether the information is still current.',
      businessProblemTitle: 'Ecosystem problem',
      businessProblem:
        'Merchants and crypto projects need a controlled listing process that expands coverage without degrading data quality.',
      constraintsTitle: 'Key constraints',
      constraints: [
        'The MVP had to be designed and delivered within a two-week build sprint.',
        'The map needed to remain readable with more than 200 locations on mobile.',
        'Dense market information could not increase cognitive load.',
        'New listings required validation and an admin-verification layer.',
      ],
      successTitle: 'MVP success criteria',
      success: [
        'People can find a relevant location using WHERE / WHAT / COIN.',
        'Trust signals and supported assets appear at decision time.',
        'Merchants/projects have a clear, moderated onboarding flow.',
        'The map-heavy experience remains responsive on common devices.',
      ],
    },
    research: {
      title: 'Research inputs used to shape the product',
      description:
        'The existing evidence shows desk research, competitive auditing, persona synthesis and custom journey mapping. This case study does not claim interview sample sizes or usability-test results that are not present in the current source.',
      methods: [
        {
          number: '01',
          title: 'Desk research',
          description:
            'Synthesized adoption context, emerging-market behavior and the shift from speculation toward payments, remittance and stablecoins.',
        },
        {
          number: '02',
          title: 'Competitive audit',
          description:
            'Compared CoinGecko, CoinATMRadar and Coinmap to identify the gap between market data, geo discovery and physical adoption.',
        },
        {
          number: '03',
          title: 'Persona synthesis',
          description:
            'Separated crypto-holder/traveler needs from merchant-owner needs instead of forcing both goals into one journey.',
        },
        {
          number: '04',
          title: 'Journey mapping',
          description:
            'Mapped the journey from wanting to spend crypto to discovering a place, evaluating trust and completing an action.',
        },
      ],
      evidence1Title: 'Evidence 01 — Adoption context',
      evidence1Caption:
        'Existing research chart from the project. Add the exact source URL, publication year and access date before publishing publicly.',
      competitorTitle: 'Competitive gap',
      strengthsLabel: 'Strengths',
      gapsLabel: 'Gaps',
      competitors: [
        {
          name: 'CoinGecko',
          strengths: ['Strong market data', 'Exchange ranking', 'Volume, liquidity and trust score'],
          gaps: ['No physical-adoption layer', 'No geo-based UX', 'No offline-utility bridge'],
        },
        {
          name: 'CoinATMRadar',
          strengths: ['Focused crypto-ATM coverage', 'Fee and operator data'],
          gaps: ['ATM-only scope', 'No merchant discovery', 'Limited exchange/project listing'],
        },
        {
          name: 'Coinmap',
          strengths: ['Bitcoin merchant locations', 'Global coverage'],
          gaps: ['Dated, difficult-to-scale UX', 'No market/exchange layer', 'No transaction workflow or ecosystem integration'],
        },
      ],
      usersTitle: 'Two core user groups',
      users: [
        {
          title: 'Crypto holder / Traveler',
          needs: ['Find places nearby or in a destination city', 'Understand supported coins/networks', 'Confirm that a listing is trustworthy and active'],
        },
        {
          title: 'Merchant / Project owner',
          needs: ['Become discoverable in the ecosystem', 'Submit data step by step', 'Track review status before publication'],
        },
      ],
      personaCaption: 'Persona evidence preserved from the current source file.',
      journeyTitle: 'Custom journey map',
      journeyCaption: 'Journey-map evidence preserved from the current source file.',
    },
    strategy: {
      title: 'An architecture built around three core jobs',
      pillars: [
        {
          number: '01',
          title: 'Discover',
          description: 'Explore locations through a map, location context and intent filters.',
        },
        {
          number: '02',
          title: 'Evaluate',
          description: 'Assess trust, market movement and supported assets within the journey.',
        },
        {
          number: '03',
          title: 'Contribute',
          description: 'Add merchants/projects through a guided wizard and admin verification.',
        },
      ],
      journeyTitle: 'Core user journey',
      journey: [
        { title: 'Trigger', description: 'A person needs to find somewhere to use crypto.' },
        { title: 'Narrow intent', description: 'WHERE / WHAT / COIN reduces the search space.' },
        { title: 'Evaluate', description: 'Review merchant details, trust signals and supported assets.' },
        { title: 'Act', description: 'Navigate to the location or continue a related flow.' },
      ],
      iaTitle: 'Information architecture',
      ia: [
        '1.0 Global Map / Home',
        '1.1 Merchant Detail — bottom sheet / side panel',
        '1.2 Advanced Filters — WHERE / WHAT / COIN',
        '2.0 Market Watch — market context & assets',
        '3.0 B2B Portal',
        '3.1 Merchant / Project Listing Wizard',
        '3.2 Admin Verification State',
      ],
    },
    decisions: {
      title: 'Every screen represents a product decision',
      principleLabel: 'Principle',
      tradeOffLabel: 'Trade-off',
      items: [
        {
          number: '01',
          eyebrow: 'Discover with intent',
          title: 'Reduce map overload before revealing detail',
          problem:
            'Rendering more than 200 individual markers makes the map hard to scan and increases interaction cost, especially on mobile.',
          decision:
            'Use marker clustering as the default state; WHERE / WHAT / COIN lets people express intent before zooming into individual merchants.',
          rationale:
            'Prioritize the overview, then progressively disclose detail as the need becomes more specific.',
          tradeOff:
            'Clustering hides individual places at low zoom levels, but helps people understand density and relevant areas faster.',
          image: '/images/case-study/cryptomap_global_dashboard.png',
          alt: 'CryptoMap360 global dashboard with marker clustering and intent filters',
          accent: 'text-amber-400',
          surface: 'bg-amber-500/10 border-amber-500/20',
        },
        {
          number: '02',
          eyebrow: 'Build trust',
          title: 'Bring market context to the decision point',
          problem:
            'Dense market data can turn the product into an investment dashboard and distract from real-world utility.',
          decision:
            'Prioritize price movement, verification state and supported assets; use color to communicate status rather than decorate data.',
          rationale:
            'Market information should support a decision instead of competing with map discovery.',
          tradeOff:
            'The overview exposes fewer data points; advanced users need to open the market-detail experience.',
          image: '/images/case-study/cryptomap_market_live.png',
          alt: 'CryptoMap360 market page with market cap, trending assets, gainers and price table',
          accent: 'text-cyan-400',
          surface: 'bg-cyan-500/10 border-cyan-500/20',
        },
        {
          number: '03',
          eyebrow: 'Grow verified supply',
          title: 'Make data quality part of the user flow',
          problem:
            'Open listing can grow coverage quickly but also creates duplicate, inaccurate or inactive data.',
          decision:
            'Use a multi-step wizard, inline validation and a pending admin-verification state before publication.',
          rationale:
            'Data quality should be designed at the point of entry, not treated as a separate back-office cleanup task.',
          tradeOff:
            'Onboarding is longer than a single form, but produces fewer errors and makes the approval process understandable.',
          image: '/images/case-study/cryptomap_wizard.png',
          alt: 'CryptoMap360 multi-step listing wizard',
          accent: 'text-violet-400',
          surface: 'bg-violet-500/10 border-violet-500/20',
        },
      ] satisfies Decision[],
    },
    performance: {
      title: 'Performance treated as part of the experience',
      description:
        'A map-heavy product can be functionally correct and still fail when pan, zoom, filter or list updates feel slow. Design and implementation therefore focused on clustering, virtualized lists and API sequencing.',
      techniques: ['Marker clustering', 'Virtualized lists', 'API sequencing', 'Progressive disclosure'],
      metrics: [
        { value: '80/100', label: 'Performance score', note: 'Post-optimization snapshot in the current case study', accent: 'text-amber-300' },
        { value: '3.3s', label: 'Largest Contentful Paint', note: 'With a map- and data-heavy interface', accent: 'text-cyan-300' },
        { value: '170ms', label: 'Interaction to Next Paint', note: 'Reported as Good in the existing evidence', accent: 'text-emerald-300' },
      ] satisfies Metric[],
      outcomesTitle: 'Outcomes supported by the current artifact',
      outcomes: [
        { value: '200+', label: 'Mapped locations', note: 'Coverage displayed in the product' },
        { value: '2 weeks', label: 'MVP build sprint', note: 'Within the Feb–May 2026 engagement' },
        { value: '8.68k', label: 'Recorded requests', note: 'Define whether these are API calls, searches or sessions before using this as a product KPI' },
      ],
      note:
        'These values are preserved from the current file. For stronger portfolio credibility, add the measurement tool, device/network, date range and exact definition of “requests”.',
    },
    reflection: {
      title: 'What the case study proves — and does not prove',
      provesTitle: 'Supported by evidence',
      proves: [
        'Ability to move from a market problem to IA and an end-to-end MVP scope.',
        'Ability to handle map-heavy interaction, dense information and multi-step workflows.',
        'Ability to connect UX decisions with data quality and technical feasibility.',
      ],
      boundaryTitle: 'Do not overclaim yet',
      boundaries: [
        'The source does not contain a usability-test sample size.',
        'There is no conversion, retention or merchant-activation rate.',
        '8.68k requests is not sufficiently defined to represent user impact.',
      ],
      learningsTitle: 'Key learnings',
      learnings: [
        'For spatial products, performance and information density are experience concerns—not post-design optimization tasks.',
        'Trust must be visible at the decision point and protected from the moment data enters the system.',
      ],
      nextTitle: 'Logical next steps',
      next: [
        'Measure task completion for “find a merchant that accepts a specific coin”.',
        'Track the map → merchant detail → navigation/transaction-intent funnel.',
        'Introduce freshness scores, owner confirmation and inaccurate-listing reports.',
        'Measure listing completion, rejection reasons and time to approval in the B2B portal.',
      ],
    },
  },
} as const;

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LayersIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 12 12 17 22 12" />
    <polyline points="2 17 12 22 22 17" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const WarningIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const SectionHeading = ({ eyebrow, title, description, centered = false, textClass, mutedClass }: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
  textClass: string;
  mutedClass: string;
}) => (
  <header className={centered ? 'mx-auto mb-16 max-w-3xl text-center' : 'mb-12 max-w-3xl'}>
    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-amber-500">{eyebrow}</p>
    <h2 className={`text-3xl font-black tracking-tight md:text-5xl ${textClass}`}>{title}</h2>
    {description ? <p className={`mt-5 text-base leading-relaxed md:text-lg ${mutedClass}`}>{description}</p> : null}
  </header>
);

const EvidenceFigure = ({ src, alt, title, caption, className = '' }: {
  src: string;
  alt: string;
  title: string;
  caption: string;
  className?: string;
}) => (
  <figure className={`overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 shadow-2xl ${className}`}>
    <img loading="lazy" decoding="async" src={src} alt={alt} className="h-auto w-full object-cover object-top" />
    <figcaption className="border-t border-white/10 bg-slate-950/95 p-5 text-left">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-white">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{caption}</p>
    </figcaption>
  </figure>
);

const BulletList = ({ items, iconClass = 'text-amber-400', textClass }: {
  items: readonly string[];
  iconClass?: string;
  textClass: string;
}) => (
  <ul className="space-y-3">
    {items.map((item) => (
      <li key={item} className={`flex items-start gap-3 text-sm leading-relaxed ${textClass}`}>
        <CheckCircleIcon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const InfoCard = ({ title, children, className = '', titleClass = 'text-amber-500' }: {
  title: string;
  children: ReactNode;
  className?: string;
  titleClass?: string;
}) => (
  <article className={`rounded-3xl border p-6 md:p-8 ${className}`}>
    <h3 className={`text-lg font-black ${titleClass}`}>{title}</h3>
    <div className="mt-5">{children}</div>
  </article>
);

export const ProjectCryptomap: React.FC = () => {
  const { isLightMode, language } = useStore();
  const reduceMotion = useReducedMotion();
  const copy = COPY[language as Language];

  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#050510]',
    text: isLightMode ? 'text-slate-900' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-600' : 'text-slate-400',
    card: isLightMode
      ? 'border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.10)]'
      : 'border-white/10 bg-white/[0.045] shadow-2xl backdrop-blur-xl',
    softCard: isLightMode
      ? 'border-slate-200 bg-slate-50'
      : 'border-white/10 bg-white/[0.035]',
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
  } as const;

  const revealProps = {
    initial: reduceMotion ? false : 'hidden',
    whileInView: reduceMotion ? undefined : 'visible',
    viewport: { once: true, margin: '-80px' },
    variants: fadeInUp,
  } as const;

  return (
    <CaseStudyLayout>
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${theme.bg}`} aria-hidden="true">
        <div className={`absolute inset-0 bg-gradient-to-b ${isLightMode ? 'from-amber-50/70 via-slate-50 to-slate-100' : 'from-[#101827] via-[#050510] to-[#050510]'}`} />
        <div className="absolute -right-[12%] -top-[20%] h-[55vw] w-[55vw] rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute -left-[15%] top-[35%] h-[45vw] w-[45vw] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <motion.section
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? undefined : 'visible'}
        variants={fadeInUp}
        className="relative z-10 flex min-h-[78vh] flex-col items-center justify-center pb-20 text-center md:pb-28"
      >
        <figure className="group relative mb-10 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] shadow-2xl">
          <img
            loading="eager"
            decoding="async"
            src="/images/case-study/cryptomap_global_dashboard.png"
            alt="CryptoMap360 global merchant discovery dashboard"
            className="aspect-[16/9] w-full object-cover object-center transition-transform duration-1000 group-hover:scale-[1.015]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-5 text-left sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-amber-400/30 bg-slate-950/75 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300 backdrop-blur-md">
                {copy.hero.tag}
              </span>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-200 sm:text-base">
                {copy.hero.imageCaption}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {copy.hero.proof.map((proof) => (
                <span key={proof} className="rounded-full border border-white/10 bg-slate-950/75 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-md">
                  {proof}
                </span>
              ))}
            </div>
          </div>
        </figure>

        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">CryptoMap360</p>
        <h1 className={`max-w-5xl text-4xl font-black uppercase tracking-[-0.05em] md:text-7xl ${theme.text}`}>
          {copy.hero.titleBefore}{' '}
          <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
            {copy.hero.titleAccent}
          </span>{' '}
          {copy.hero.titleAfter}
        </h1>
        <p className={`mx-auto mt-7 max-w-3xl px-4 text-lg leading-relaxed md:text-xl ${theme.textMuted}`}>
          {copy.hero.description}
        </p>
      </motion.section>

      <motion.section {...revealProps} className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow={copy.section.overview} title={copy.snapshot.title} textClass={theme.text} mutedClass={theme.textMuted} />

          <div className={`overflow-hidden rounded-3xl border ${theme.card}`}>
            <div className="grid grid-cols-1 border-b border-current/10 sm:grid-cols-2 lg:grid-cols-4">
              {copy.snapshot.items.map((item) => (
                <div key={item.label} className="border-b border-current/10 p-6 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
                  <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${theme.textMuted}`}>{item.label}</p>
                  <p className={`mt-3 text-base font-black ${theme.text}`}>{item.value}</p>
                  {'note' in item && item.note ? <p className={`mt-1 text-xs ${theme.textMuted}`}>{item.note}</p> : null}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-8 p-6 md:p-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h3 className={`text-xl font-black ${theme.text}`}>{copy.snapshot.contributionTitle}</h3>
                <div className="mt-6">
                  <BulletList items={copy.snapshot.contributions} textClass={theme.textMuted} />
                </div>
              </div>
              <aside className={`rounded-2xl border p-6 lg:col-span-5 ${theme.softCard}`}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-500">{copy.snapshot.boundaryTitle}</p>
                <p className={`mt-4 text-sm leading-relaxed ${theme.textMuted}`}>{copy.snapshot.boundary}</p>
              </aside>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...revealProps} className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow={copy.section.challenge} title={copy.challenge.title} textClass={theme.text} mutedClass={theme.textMuted} centered />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoCard title={copy.challenge.userProblemTitle} className={theme.card} titleClass="text-amber-500">
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{copy.challenge.userProblem}</p>
            </InfoCard>
            <InfoCard title={copy.challenge.businessProblemTitle} className={theme.card} titleClass="text-cyan-500">
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{copy.challenge.businessProblem}</p>
            </InfoCard>
            <InfoCard title={copy.challenge.constraintsTitle} className={theme.card} titleClass="text-violet-500">
              <BulletList items={copy.challenge.constraints} iconClass="text-violet-400" textClass={theme.textMuted} />
            </InfoCard>
            <InfoCard title={copy.challenge.successTitle} className={theme.card} titleClass="text-emerald-500">
              <BulletList items={copy.challenge.success} iconClass="text-emerald-400" textClass={theme.textMuted} />
            </InfoCard>
          </div>
        </div>
      </motion.section>

      <motion.section {...revealProps} className="relative z-10 border-y border-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow={copy.section.research}
            title={copy.research.title}
            description={copy.research.description}
            textClass={theme.text}
            mutedClass={theme.textMuted}
            centered
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {copy.research.methods.map((method) => (
              <article key={method.number} className={`rounded-3xl border p-6 ${theme.card}`}>
                <p className="text-xs font-black tracking-[0.18em] text-amber-500">{method.number}</p>
                <h3 className={`mt-5 text-lg font-black ${theme.text}`}>{method.title}</h3>
                <p className={`mt-4 text-sm leading-relaxed ${theme.textMuted}`}>{method.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-12">
            <EvidenceFigure
              src="/images/case-study/chart_1.webp"
              alt="Chart showing countries with high grassroots crypto adoption"
              title={copy.research.evidence1Title}
              caption={copy.research.evidence1Caption}
            />
          </div>

          <div className="mt-20">
            <h3 className={`text-2xl font-black md:text-3xl ${theme.text}`}>{copy.research.competitorTitle}</h3>
            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {copy.research.competitors.map((competitor) => (
                <article key={competitor.name} className={`rounded-3xl border p-6 md:p-8 ${theme.card}`}>
                  <h4 className={`text-2xl font-black ${theme.text}`}>{competitor.name}</h4>
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-500">{copy.research.strengthsLabel}</p>
                  <ul className={`mt-3 space-y-2 text-sm ${theme.textMuted}`}>
                    {competitor.strengths.map((item) => <li key={item}>+ {item}</li>)}
                  </ul>
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-rose-500">{copy.research.gapsLabel}</p>
                  <ul className={`mt-3 space-y-2 text-sm ${theme.textMuted}`}>
                    {competitor.gaps.map((item) => <li key={item}>− {item}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <h3 className={`text-2xl font-black md:text-3xl ${theme.text}`}>{copy.research.usersTitle}</h3>
              <div className="mt-8 space-y-5">
                {copy.research.users.map((user) => (
                  <article key={user.title} className={`rounded-2xl border p-6 ${theme.card}`}>
                    <h4 className={`font-black ${theme.text}`}>{user.title}</h4>
                    <ul className={`mt-4 space-y-2 text-sm ${theme.textMuted}`}>
                      {user.needs.map((need) => <li key={need}>• {need}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <EvidenceFigure
                src="/images/case-study/chart_3.png"
                alt="CryptoMap360 user persona research artifact"
                title={copy.research.usersTitle}
                caption={copy.research.personaCaption}
              />
            </div>
          </div>

          <div className="mt-16">
            <EvidenceFigure
              src="/images/case-study/chart_4.webp"
              alt="CryptoMap360 custom user journey map"
              title={copy.research.journeyTitle}
              caption={copy.research.journeyCaption}
            />
          </div>
        </div>
      </motion.section>

      <motion.section {...revealProps} className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow={copy.section.strategy} title={copy.strategy.title} textClass={theme.text} mutedClass={theme.textMuted} />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {copy.strategy.pillars.map((pillar) => (
              <article key={pillar.number} className={`rounded-3xl border p-7 ${theme.card}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-sm font-black text-amber-500">{pillar.number}</span>
                <h3 className={`mt-6 text-xl font-black ${theme.text}`}>{pillar.title}</h3>
                <p className={`mt-4 text-sm leading-relaxed ${theme.textMuted}`}>{pillar.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <article className={`rounded-3xl border p-6 md:p-9 ${theme.card}`}>
              <h3 className={`flex items-center gap-3 text-xl font-black ${theme.text}`}>
                <ArrowRightIcon className="h-5 w-5 text-amber-500" />
                {copy.strategy.journeyTitle}
              </h3>
              <div className="relative mt-8 space-y-7 border-l-2 border-amber-500/25 pl-7">
                {copy.strategy.journey.map((step, index) => (
                  <div key={step.title} className="relative">
                    <span className="absolute -left-[36px] top-0 flex h-4 w-4 rounded-full bg-amber-500 ring-4 ring-amber-500/10" />
                    <p className={`text-sm font-black ${theme.text}`}>{index + 1}. {step.title}</p>
                    <p className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}>{step.description}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className={`rounded-3xl border p-6 md:p-9 ${theme.card}`}>
              <h3 className={`flex items-center gap-3 text-xl font-black ${theme.text}`}>
                <LayersIcon className="h-5 w-5 text-cyan-500" />
                {copy.strategy.iaTitle}
              </h3>
              <div className="mt-8 space-y-3 font-mono text-xs md:text-sm">
                {copy.strategy.ia.map((item, index) => (
                  <div key={item} className={`rounded-xl border p-3 ${index === 0 ? 'border-amber-500/25 bg-amber-500/10 text-amber-500' : index === 3 ? 'border-cyan-500/25 bg-cyan-500/10 text-cyan-500' : index === 4 ? 'border-violet-500/25 bg-violet-500/10 text-violet-500' : theme.softCard}`}>
                    {item}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </motion.section>

      <motion.section {...revealProps} className="relative z-10 py-16 md:py-24" id="cryptomap-decisions">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow={copy.section.decisions} title={copy.decisions.title} textClass={theme.text} mutedClass={theme.textMuted} centered />

          <div className="space-y-24 md:space-y-32">
            {copy.decisions.items.map((decision, index) => (
              <article key={decision.number} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
                <div className={`relative lg:col-span-7 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className={`absolute -inset-5 rounded-[2rem] opacity-35 blur-3xl ${decision.surface}`} aria-hidden="true" />
                  <figure className={`relative overflow-hidden rounded-[2rem] border shadow-2xl ${isLightMode ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-950'}`}>
                    <img loading="lazy" decoding="async" src={decision.image} alt={decision.alt} className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 hover:scale-[1.015]" />
                    <figcaption className={`absolute left-4 top-4 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur-md ${decision.surface} ${decision.accent}`}>
                      Decision {decision.number}
                    </figcaption>
                  </figure>
                </div>

                <div className={`lg:col-span-5 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <p className={`text-xs font-black uppercase tracking-[0.2em] ${decision.accent}`}>{decision.eyebrow}</p>
                  <h3 className={`mt-3 text-2xl font-black tracking-tight md:text-3xl ${theme.text}`}>{decision.title}</h3>

                  <dl className="mt-7 space-y-5">
                    <div>
                      <dt className={`text-[10px] font-black uppercase tracking-[0.14em] ${theme.text}`}>Problem</dt>
                      <dd className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}>{decision.problem}</dd>
                    </div>
                    <div>
                      <dt className={`text-[10px] font-black uppercase tracking-[0.14em] ${theme.text}`}>Decision</dt>
                      <dd className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}>{decision.decision}</dd>
                    </div>
                  </dl>

                  <div className={`mt-7 rounded-2xl border p-5 ${decision.surface}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${decision.accent}`}>{copy.decisions.principleLabel}</p>
                    <p className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}>{decision.rationale}</p>
                  </div>
                  <div className={`mt-4 rounded-2xl border p-5 ${theme.softCard}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${theme.text}`}>{copy.decisions.tradeOffLabel}</p>
                    <p className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}>{decision.tradeOff}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...revealProps} className="relative z-10 border-y border-white/5 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow={copy.section.performance}
            title={copy.performance.title}
            description={copy.performance.description}
            textClass={theme.text}
            mutedClass={theme.textMuted}
          />

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#111827] to-[#070a11] p-6 text-white shadow-2xl md:p-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-400">Performance engineering</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {copy.performance.techniques.map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-slate-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-7">
                {copy.performance.metrics.map((metric) => (
                  <article key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                    <p className={`text-3xl font-black tracking-tight ${metric.accent}`}>{metric.value}</p>
                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-white">{metric.label}</p>
                    <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{metric.note}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className={`text-2xl font-black md:text-3xl ${theme.text}`}>{copy.performance.outcomesTitle}</h3>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {copy.performance.outcomes.map((outcome) => (
                <article key={outcome.label} className={`rounded-3xl border p-7 ${theme.card}`}>
                  <p className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-4xl font-black text-transparent">{outcome.value}</p>
                  <p className={`mt-5 text-xs font-black uppercase tracking-[0.13em] ${theme.text}`}>{outcome.label}</p>
                  <p className={`mt-3 text-xs leading-relaxed ${theme.textMuted}`}>{outcome.note}</p>
                </article>
              ))}
            </div>

            <aside className={`mt-6 flex items-start gap-4 rounded-2xl border p-5 ${theme.softCard}`}>
              <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p className={`text-xs leading-relaxed ${theme.textMuted}`}>{copy.performance.note}</p>
            </aside>
          </div>
        </div>
      </motion.section>

      <motion.section {...revealProps} className="relative z-10 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading eyebrow={copy.section.reflection} title={copy.reflection.title} textClass={theme.text} mutedClass={theme.textMuted} centered />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoCard title={copy.reflection.provesTitle} className={theme.card} titleClass="text-emerald-500">
              <BulletList items={copy.reflection.proves} iconClass="text-emerald-400" textClass={theme.textMuted} />
            </InfoCard>
            <InfoCard title={copy.reflection.boundaryTitle} className={theme.card} titleClass="text-amber-500">
              <ul className="space-y-3">
                {copy.reflection.boundaries.map((item) => (
                  <li key={item} className={`flex items-start gap-3 text-sm leading-relaxed ${theme.textMuted}`}>
                    <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </InfoCard>
            <InfoCard title={copy.reflection.learningsTitle} className={theme.card} titleClass="text-cyan-500">
              <BulletList items={copy.reflection.learnings} iconClass="text-cyan-400" textClass={theme.textMuted} />
            </InfoCard>
            <InfoCard title={copy.reflection.nextTitle} className={theme.card} titleClass="text-violet-500">
              <BulletList items={copy.reflection.next} iconClass="text-violet-400" textClass={theme.textMuted} />
            </InfoCard>
          </div>

          <div className="mt-12 flex justify-center">
            <a
              href="#cryptomap-decisions"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-orange-500/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {language === 'vi' ? 'Xem lại các quyết định thiết kế' : 'Review the design decisions'}
              <MapPinIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.section>
    </CaseStudyLayout>
  );
};
