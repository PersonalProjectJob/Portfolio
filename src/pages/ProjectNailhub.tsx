import React, { useMemo, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { ZoomableImage } from '../components/ZoomableImage';
type RoleId = 'owner' | 'technician' | 'buyer';
type Language = 'vi' | 'en';

type RoleJourney = {
  id: RoleId;
  label: string;
  title: string;
  need: string;
  outcome: string;
  steps: string[];
  accent: string;
  activeSurface: string;
  softSurface: string;
};

type Decision = {
  number: string;
  eyebrow: string;
  title: string;
  problem: string;
  decision: string;
  principle: string;
  tradeoff: string;
  accent: string;
  surface: string;
};

const FIGMA_URL =
  'https://www.figma.com/design/OjcQOoxXKckjMZT6DqQ6TN/The-Nail-Hub?node-id=959-17584&t=xnd33yPz496FwEgE-1';

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const FigmaIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
    <path d="M12 9h3.5a3.5 3.5 0 1 1 0 7H12V9z" />
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LayersIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 12 12 17 22 12" />
    <polyline points="2 17 12 22 22 17" />
  </svg>
);

const EvidenceIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const content = {
  vi: {
    hero: {
      tag: 'Nailhub.ai · Marketplace case study',
      title: 'Kết nối',
      highlight: 'hệ sinh thái ngành\u00A0nail',
      description:
        'Thiết kế một marketplace đa vai trò giúp chủ tiệm tuyển thợ, thợ nail tìm việc phù hợp và người mua khám phá cơ hội chuyển nhượng salon trong cùng một hệ thống.',
      proof: ['3 nhóm người dùng', '9 module liên kết', 'Web \u0026 Mobile'],
      quote: 'Một marketplace chỉ thành công khi mọi bên đều nhận được giá trị ngay từ lần tương tác đầu tiên.',
      stats: [
        { icon: 'Users', value: '3', label: 'Nhóm\nNgười dùng' },
        { icon: 'Layers', value: '9', label: 'Module\nliên kết' },
        { icon: 'Search', value: '42+', label: 'Figma\nScreens' },
        { icon: 'Globe', value: '2', label: 'Nền tảng\n(Web/App)' },
      ],
      ctaFigma: 'Xem trên Figma',
      mockupLabel: 'Bằng chứng · Luồng tìm kiếm và khám phá',
      mockupAlt:
        'Giao diện Nailhub.ai hiển thị luồng tìm kiếm, bộ lọc và danh sách cơ hội trong ngành nail',
    },
    snapshot: {
      tag: '01 · Project snapshot',
      title: 'Từ mạng lưới phi chính thức đến một marketplace có cấu\u00A0trúc',
      items: [
        ['Vai trò', 'Lead Product Designer'],
        ['Nền tảng', 'Web & Mobile App'],
        ['Lĩnh vực', 'B2B/B2C Marketplace'],
        ['Phương pháp', 'User-Centered Design'],
      ],
      problemTitle: 'Bài toán người\u00A0dùng',
      problem:
        'Hoạt động tuyển dụng, tìm việc và chuyển nhượng salon thường diễn ra qua cộng đồng rời rạc. Thông tin thiếu chuẩn hóa khiến người dùng khó so sánh cơ hội, đánh giá độ phù hợp và theo dõi trạng thái liên hệ.',
      businessTitle: 'Bài toán sản\u00A0phẩm',
      business:
        'Nailhub cần phục vụ ba mục tiêu khác nhau mà không biến sản phẩm thành ba hệ thống tách rời: tuyển thợ, tìm việc và mua/bán salon.',
      roleTitle: 'Phạm vi tôi phụ\u00A0trách',
      owned: [
        'Xác định cấu trúc marketplace và hành trình cốt lõi cho ba nhóm người dùng.',
        'Thiết kế information architecture, search/filter, listing card, detail và workflow quản lý.',
        'Chuẩn hóa component và trạng thái tương tác trong Figma.',
        'Kết nối discovery với đăng nhập, liên hệ, đăng tin và quản lý trạng thái.',
      ],
      boundaryTitle: 'Ranh giới bằng\u00A0chứng',
      boundary:
        'Source hiện tại không cung cấp số lượng người tham gia research, dữ liệu usability test hoặc business metric sau launch. Vì vậy case study này trình bày bằng chứng thiết kế và logic sản phẩm, không tuyên bố impact chưa được đo.',
    },
    discovery: {
      tag: '02 · Problem framing',
      title: 'Ba nhóm người dùng, ba định nghĩa khác nhau về “cơ hội\u00A0tốt”',
      description:
        'Thay vì bắt đầu từ danh sách tính năng, tôi tổ chức sản phẩm quanh mục tiêu thực tế của từng nhóm người dùng.',
      roleLabels: {
        owner: {
          label: 'Chủ salon',
          title: 'Tuyển và phát triển đội\u00A0ngũ',
          need:
            'Đăng nhu cầu tuyển dụng, mô tả rõ cơ hội và sàng lọc thợ phù hợp.',
          outcome: 'Bắt đầu được một cuộc trao đổi có chất lượng',
          steps: [
            'Đăng nhu cầu',
            'Thêm yêu cầu',
            'Xem ứng viên',
            'Liên hệ',
            'Quản lý trạng thái',
          ],
        },
        technician: {
          label: 'Thợ nail',
          title: 'Tìm cơ hội phù\u00A0hợp',
          need:
            'Tìm theo vị trí và loại công việc, đánh giá salon rồi ứng tuyển hoặc liên hệ.',
          outcome: 'Gửi được một ứng tuyển phù hợp',
          steps: [
            'Tìm việc',
            'Lọc vị trí',
            'Đánh giá salon',
            'Ứng tuyển / liên hệ',
            'Theo dõi trạng thái',
          ],
        },
        buyer: {
          label: 'Người mua / vận hành',
          title: 'Khám phá cơ hội\u00A0salon',
          need:
            'So sánh các tin chuyển nhượng, đánh giá hoạt động kinh doanh và liên hệ chủ salon.',
          outcome: 'Tạo được một yêu cầu quan tâm nghiêm túc',
          steps: [
            'Khám phá salon',
            'Lọc thị trường',
            'Xem chi tiết',
            'Liên hệ chủ salon',
            'Quản lý yêu cầu',
          ],
        },
      },
      journeyPrefix: 'Hành trình chính · ',
      systemTitle: 'Hệ thống dùng\u00A0chung',
      systemDescription:
        'Các hành trình dùng chung nền tảng dữ liệu và pattern tương tác để tránh lặp logic, nhưng mỗi vai trò vẫn có entry point, thông tin ưu tiên và hành động chính riêng.',
      modules: [
        'Search & filter',
        'Listing cards',
        'Listing detail',
        'Authentication',
        'Profile',
        'Application / inquiry',
        'Post listing',
        'Status management',
        'Direct messaging',
      ],
    },
    architecture: {
      tag: '03 · Product architecture',
      title: 'Một marketplace, nhiều entry\u00A0point',
      description:
        'Kiến trúc được tổ chức quanh hai trục: loại cơ hội người dùng đang tìm và vai trò họ đang thực hiện.',
      hierarchy: [
        {
          title: 'Explore',
          items: ['Search', 'Category', 'Location', 'Saved filters'],
        },
        {
          title: 'Evaluate',
          items: ['Listing card', 'Salon profile', 'Compensation', 'Trust cues'],
        },
        {
          title: 'Act',
          items: ['Apply', 'Contact', 'Save', 'Share'],
        },
        {
          title: 'Manage',
          items: ['My listings', 'Applications', 'Inquiries', 'Statuses'],
        },
      ],
      ruleTitle: 'Nguyên tắc kiến\u00A0trúc',
      rules: [
        'Không buộc người dùng hiểu toàn bộ marketplace trước khi bắt đầu.',
        'Giữ thông tin so sánh quan trọng nhất nhất quán giữa list và detail.',
        'Mọi hành động discovery đều có điểm tiếp nối rõ ràng sang quản lý.',
      ],
    },
    decisions: {
      tag: '04 · Key product decisions',
      title: 'Quyết định thiết kế và đánh\u00A0đổi',
      mockupTag: 'Bằng chứng · High-fidelity search flow',
      mockupAlt:
        'Mockup high-fidelity Nailhub.ai với bộ lọc, listing card và luồng liên hệ',
      tooltips: ['Bộ lọc theo ý định', 'Thông tin để so sánh', 'Hành động tiếp theo'],
      cards: [
        {
          number: '01',
          eyebrow: 'Intent before inventory',
          title: 'Tìm kiếm bắt đầu từ mục tiêu thực\u00A0tế',
          problem:
            'Một feed hỗn hợp gồm việc làm và salon chuyển nhượng làm tăng tải nhận thức, đặc biệt với người dùng mới.',
          decision:
            'Cho người dùng xác định loại cơ hội và vị trí trước khi phải so sánh từng listing.',
          principle:
            'Thu hẹp không gian lựa chọn trước, sau đó mới tăng mức độ chi tiết.',
          tradeoff:
            'Thêm một bước định hướng ban đầu, đổi lại danh sách kết quả phù hợp hơn và dễ scan hơn.',
          accent: 'text-teal-500',
          surface: 'border-teal-500/20 bg-teal-500/10',
        },
        {
          number: '02',
          eyebrow: 'Scannable evaluation',
          title: 'Mỗi listing card trả lời quyết định kế\u00A0tiếp',
          problem:
            'Card quá ngắn khiến người dùng phải mở nhiều trang; card quá dài khiến danh sách khó so sánh.',
          decision:
            'Ưu tiên loại cơ hội, vị trí, mức thu nhập/giá, hình ảnh và tín hiệu tin cậy theo thứ tự scan.',
          principle:
            'Hiển thị đủ để loại trừ hoặc tiếp tục, không cố nhồi toàn bộ detail vào card.',
          tradeoff:
            'Một số thông tin thứ cấp được chuyển sang detail để bảo vệ khả năng so sánh nhanh.',
          accent: 'text-sky-500',
          surface: 'border-sky-500/20 bg-sky-500/10',
        },
        {
          number: '03',
          eyebrow: 'Continuity across roles',
          title: 'Discovery phải nối liền với quản\u00A0lý',
          problem:
            'Nếu tìm kiếm, liên hệ và theo dõi trạng thái nằm ở các flow tách rời, người dùng dễ mất context.',
          decision:
            'Kết nối authentication, detail, contact, application/inquiry và dashboard quản lý trong cùng mô hình trạng thái.',
          principle:
            'Một hành động chỉ hoàn tất khi người dùng biết điều gì xảy ra tiếp theo.',
          tradeoff:
            'Kiến trúc phức tạp hơn ở tầng hệ thống, đổi lại trải nghiệm xuyên suốt và dễ mở rộng.',
          accent: 'text-amber-500',
          surface: 'border-amber-500/20 bg-amber-500/10',
        },
      ] as Decision[],
    },
    validation: {
      tag: '05 · Evidence & validation',
      title: 'Bằng chứng hiện có và cách đo tiếp\u00A0theo',
      description:
        'File hiện tại cung cấp high-fidelity flow và hệ thống Figma hoàn chỉnh. Các chỉ số dưới đây là phạm vi thiết kế được bàn giao, không phải số liệu business sau launch.',
      evidence: [
        {
          value: '3',
          label: 'Role journeys',
          description: 'Chủ salon, thợ nail và người mua salon.',
        },
        {
          value: '9',
          label: 'Connected modules',
          description: 'Từ tìm kiếm đến quản lý trạng thái.',
        },
        {
          value: '1',
          label: 'Shared architecture',
          description: 'Một hệ thống phục vụ nhiều mục tiêu.',
        },
        {
          value: 'Figma',
          label: 'Design evidence',
          description: 'Flow, component và trạng thái tương tác.',
        },
      ],
      measureTitle: 'Measurement plan sau\u00A0launch',
      measures: [
        'Search → listing detail conversion',
        'Listing detail → apply/contact conversion',
        'Tỷ lệ hoàn tất đăng tin',
        'Thời gian đến cuộc trao đổi đủ điều kiện',
        'Tỷ lệ inquiry/application được xử lý',
      ],
      caveatTitle: 'Không nên tuyên bố khi chưa có dữ\u00A0liệu',
      caveat:
        'Không sử dụng các câu như “giảm thời gian tuyển dụng”, “tăng conversion” hoặc “được người dùng xác nhận” nếu chưa bổ sung dữ liệu đo, sample size và phương pháp.',
    },
    figma: {
      tag: 'Design evidence',
      title: 'Khám phá hệ thống thiết kế đầy\u00A0đủ',
      description:
        'Xem trực tiếp information architecture, user flow, high-fidelity screens và component library của Nailhub.ai trong Figma.',
      button: 'Mở file Figma',
      imageAlt: 'Ảnh xem trước hệ thống thiết kế Nailhub.ai trên Figma',
    },
    reflection: {
      tag: '06 · Retrospective',
      title: 'Điều case study này chứng\u00A0minh',
      learningsTitle: 'Bài học sản\u00A0phẩm',
      learnings: [
        'Marketplace đa vai trò không nên được thiết kế như nhiều sản phẩm ghép lại; cần một data model và trạng thái dùng chung.',
        'Search chỉ hiệu quả khi bộ lọc phản ánh đúng ngôn ngữ và mục tiêu thực tế của người dùng.',
        'Listing card là công cụ ra quyết định, không chỉ là container hiển thị dữ liệu.',
      ],
      nextTitle: 'Bước tiếp\u00A0theo',
      next: [
        'Bổ sung research methodology, số người tham gia và insight có trích dẫn.',
        'Chạy usability test theo từng role journey và ghi lại task success, time-on-task, lỗi và phản hồi.',
        'Kết nối analytics để đo funnel từ search đến qualified conversation.',
      ],
    },
  },
  en: {
    hero: {
      tag: 'Nailhub.ai · Marketplace case study',
      title: 'Connecting the',
      highlight: 'nail industry ecosystem',
      description:
        'A multi-sided marketplace that helps salon owners hire, nail technicians find relevant work, and buyers discover salon acquisition opportunities in one connected system.',
      proof: ['3 user groups', '9 connected modules', 'Web \u0026 Mobile'],
      quote: 'A marketplace only succeeds when every side receives value from their very first interaction.',
      stats: [
        { icon: 'Users', value: '3', label: 'User\nGroups' },
        { icon: 'Layers', value: '9', label: 'Connected\nModules' },
        { icon: 'Search', value: '42+', label: 'Figma\nScreens' },
        { icon: 'Globe', value: '2', label: 'Platforms\n(Web/App)' },
      ],
      ctaFigma: 'View on Figma',
      mockupLabel: 'Evidence · Search and discovery flow',
      mockupAlt:
        'Nailhub.ai interface showing search, filters and opportunity listings for the nail industry',
    },
    snapshot: {
      tag: '01 · Project snapshot',
      title: 'From informal networks to a structured\u00A0marketplace',
      items: [
        ['Role', 'Lead Product Designer'],
        ['Platform', 'Web & Mobile App'],
        ['Domain', 'B2B/B2C Marketplace'],
        ['Method', 'User-Centered Design'],
      ],
      problemTitle: 'User\u00A0problem',
      problem:
        'Hiring, job discovery and salon transfers often happen through fragmented communities. Inconsistent information makes opportunities difficult to compare, evaluate and track.',
      businessTitle: 'Product\u00A0problem',
      business:
        'Nailhub must serve three different goals without becoming three disconnected products: hiring technicians, finding work and buying or selling a salon.',
      roleTitle: 'My\u00A0contribution',
      owned: [
        'Defined the marketplace structure and core journeys for three user groups.',
        'Designed information architecture, search/filter, listing cards, detail and management workflows.',
        'Standardized components and interaction states in Figma.',
        'Connected discovery with authentication, contact, posting and status management.',
      ],
      boundaryTitle: 'Evidence\u00A0boundary',
      boundary:
        'The current source does not include participant counts, usability-test data or post-launch business metrics. This case study therefore presents design evidence and product logic without claiming unmeasured impact.',
    },
    discovery: {
      tag: '02 · Problem framing',
      title: 'Three user groups, three definitions of a “good\u00A0opportunity”',
      description:
        'Instead of starting with a feature list, I organized the product around the real-world goal of each core user group.',
      roleLabels: {
        owner: {
          label: 'Salon owner',
          title: 'Hire and grow the\u00A0team',
          need:
            'Post a role, explain the opportunity and review suitable technicians.',
          outcome: 'A qualified conversation starts',
          steps: [
            'Post need',
            'Add requirements',
            'Review candidates',
            'Contact',
            'Manage status',
          ],
        },
        technician: {
          label: 'Nail technician',
          title: 'Find the right\u00A0opportunity',
          need:
            'Search by role and location, evaluate the salon and apply or make contact.',
          outcome: 'A relevant application is sent',
          steps: [
            'Search roles',
            'Filter location',
            'Review salon',
            'Apply / contact',
            'Track status',
          ],
        },
        buyer: {
          label: 'Buyer / operator',
          title: 'Discover a salon\u00A0opportunity',
          need:
            'Compare transfer listings, inspect the business and contact the owner.',
          outcome: 'A serious inquiry is created',
          steps: [
            'Browse salons',
            'Filter market',
            'Review listing',
            'Contact owner',
            'Manage inquiry',
          ],
        },
      },
      journeyPrefix: 'Primary journey · ',
      systemTitle: 'Shared product\u00A0system',
      systemDescription:
        'The journeys reuse a shared data and interaction foundation to avoid duplicated logic, while each role retains its own entry point, information priority and primary action.',
      modules: [
        'Search & filter',
        'Listing cards',
        'Listing detail',
        'Authentication',
        'Profile',
        'Application / inquiry',
        'Post listing',
        'Status management',
        'Direct messaging',
      ],
    },
    architecture: {
      tag: '03 · Product architecture',
      title: 'One marketplace, multiple entry\u00A0points',
      description:
        'The architecture is organized around two axes: the type of opportunity being explored and the role the user is performing.',
      hierarchy: [
        {
          title: 'Explore',
          items: ['Search', 'Category', 'Location', 'Saved filters'],
        },
        {
          title: 'Evaluate',
          items: ['Listing card', 'Salon profile', 'Compensation', 'Trust cues'],
        },
        {
          title: 'Act',
          items: ['Apply', 'Contact', 'Save', 'Share'],
        },
        {
          title: 'Manage',
          items: ['My listings', 'Applications', 'Inquiries', 'Statuses'],
        },
      ],
      ruleTitle: 'Architecture\u00A0principles',
      rules: [
        'Do not require users to understand the whole marketplace before starting.',
        'Keep the most important comparison data consistent from list to detail.',
        'Every discovery action must have a clear continuation into management.',
      ],
    },
    decisions: {
      tag: '04 · Key product decisions',
      title: 'Design decisions and trade‑offs',
      mockupTag: 'Evidence · High-fidelity search flow',
      mockupAlt:
        'High-fidelity Nailhub.ai mockup with filters, listing cards and contact flow',
      tooltips: ['Intent filters', 'Comparison data', 'Next action'],
      cards: [
        {
          number: '01',
          eyebrow: 'Intent before inventory',
          title: 'Search begins with a real‑world goal',
          problem:
            'A mixed feed of jobs and salon transfers increases cognitive load, especially for first-time users.',
          decision:
            'Ask users to define opportunity type and location before comparing individual listings.',
          principle:
            'Narrow the choice space first, then increase the level of detail.',
          tradeoff:
            'One additional orientation step produces a more relevant and scannable result set.',
          accent: 'text-teal-500',
          surface: 'border-teal-500/20 bg-teal-500/10',
        },
        {
          number: '02',
          eyebrow: 'Scannable evaluation',
          title: 'Each listing card answers the next\u00A0decision',
          problem:
            'Cards that are too short force repeated detail visits; cards that are too dense become difficult to compare.',
          decision:
            'Prioritize opportunity type, location, compensation or price, imagery and trust cues in scan order.',
          principle:
            'Show enough to reject or continue without turning the card into the detail page.',
          tradeoff:
            'Secondary information moves to detail to preserve fast comparison.',
          accent: 'text-sky-500',
          surface: 'border-sky-500/20 bg-sky-500/10',
        },
        {
          number: '03',
          eyebrow: 'Continuity across roles',
          title: 'Discovery must connect to\u00A0management',
          problem:
            'When search, contact and status tracking live in isolated flows, users lose context.',
          decision:
            'Connect authentication, detail, contact, application or inquiry and management dashboards through a shared state model.',
          principle:
            'An action is complete only when the user understands what happens next.',
          tradeoff:
            'The system architecture becomes more involved, but the experience is more continuous and scalable.',
          accent: 'text-amber-500',
          surface: 'border-amber-500/20 bg-amber-500/10',
        },
      ] as Decision[],
    },
    validation: {
      tag: '05 · Evidence & validation',
      title: 'Available evidence and the next measurement\u00A0layer',
      description:
        'The current file provides a high-fidelity flow and a complete Figma system. The values below describe delivered design scope, not post-launch business performance.',
      evidence: [
        {
          value: '3',
          label: 'Role journeys',
          description: 'Salon owner, technician and salon buyer.',
        },
        {
          value: '9',
          label: 'Connected modules',
          description: 'From discovery through status management.',
        },
        {
          value: '1',
          label: 'Shared architecture',
          description: 'One system serving multiple goals.',
        },
        {
          value: 'Figma',
          label: 'Design evidence',
          description: 'Flows, components and interaction states.',
        },
      ],
      measureTitle: 'Post-launch measurement\u00A0plan',
      measures: [
        'Search → listing-detail conversion',
        'Listing detail → apply/contact conversion',
        'Listing-post completion rate',
        'Time to qualified conversation',
        'Handled inquiry/application rate',
      ],
      caveatTitle: 'Claims to avoid without\u00A0data',
      caveat:
        'Do not state that the product reduced hiring time, increased conversion or was validated by users until the sample, method and measured results are documented.',
    },
    figma: {
      tag: 'Design evidence',
      title: 'Explore the complete design\u00A0system',
      description:
        'Open the Nailhub.ai information architecture, user flows, high-fidelity screens and component library directly in Figma.',
      button: 'Open Figma file',
      imageAlt: 'Preview of the Nailhub.ai design system in Figma',
    },
    reflection: {
      tag: '06 · Retrospective',
      title: 'What this case study\u00A0demonstrates',
      learningsTitle: 'Product\u00A0learnings',
      learnings: [
        'A multi-sided marketplace should not feel like several products stitched together; it needs a shared data and state model.',
        'Search works when filters reflect the real language and goals of users.',
        'A listing card is a decision tool, not merely a data container.',
      ],
      nextTitle: 'Next\u00A0steps',
      next: [
        'Add research methodology, participant counts and traceable insights.',
        'Run usability tests for each role journey and capture task success, time-on-task, errors and feedback.',
        'Instrument analytics to measure the funnel from search to qualified conversation.',
      ],
    },
  },
} satisfies Record<Language, unknown>;

const roleStyle: Record<
  RoleId,
  Pick<RoleJourney, 'accent' | 'activeSurface' | 'softSurface'>
> = {
  owner: {
    accent: 'text-teal-500',
    activeSurface:
      'border-teal-500 bg-teal-500 text-white shadow-teal-500/20',
    softSurface: 'border-teal-500/20 bg-teal-500/10',
  },
  technician: {
    accent: 'text-sky-500',
    activeSurface:
      'border-sky-500 bg-sky-500 text-white shadow-sky-500/20',
    softSurface: 'border-sky-500/20 bg-sky-500/10',
  },
  buyer: {
    accent: 'text-amber-500',
    activeSurface:
      'border-amber-500 bg-amber-500 text-white shadow-amber-500/20',
    softSurface: 'border-amber-500/20 bg-amber-500/10',
  },
};

export const ProjectNailhub: React.FC = () => {
  const { isLightMode, language } = useStore();
  const [activeRole, setActiveRole] = useState<RoleId>('technician');
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const backgroundY = useTransform(
    scrollY,
    [0, 1000],
    reduceMotion ? [0, 0] : [0, 160],
  );
  const heroOpacity = useTransform(
    scrollY,
    [0, 360],
    reduceMotion ? [1, 1] : [1, 0],
  );

  const copy = content[language];

  const roles = useMemo<RoleJourney[]>(
    () =>
      (['owner', 'technician', 'buyer'] as RoleId[]).map((id) => ({
        id,
        ...copy.discovery.roleLabels[id],
        ...roleStyle[id],
      })),
    [copy],
  );

  const selectedRole =
    roles.find((role) => role.id === activeRole) ?? roles[1];

  const theme = {
    text: isLightMode ? 'text-slate-900' : 'text-white',
    textMuted: isLightMode ? 'text-slate-600' : 'text-slate-400',
    card: isLightMode
      ? 'border-slate-200 bg-white/90 shadow-sm'
      : 'border-white/10 bg-slate-900/55',
    divider: isLightMode ? 'border-slate-200' : 'border-white/10',
    soft: isLightMode ? 'bg-slate-50' : 'bg-white/[0.04]',
  };

  const reveal = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.62, ease: 'easeOut' },
    },
  } as const;

  return (
    <CaseStudyLayout>
      <div className="relative z-10 container mx-auto px-4 pb-16">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative mb-20 overflow-hidden md:mb-32"
        >
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div
              className={`absolute inset-0 bg-gradient-to-b opacity-50 ${
                isLightMode
                  ? 'from-[#fff8f3] via-slate-50 to-transparent'
                  : 'from-[#2a1716]/45 via-[#07151a]/25 to-transparent'
              }`}
            />
            <motion.div
              style={{ y: backgroundY }}
              className="absolute -right-[15%] -top-[25%] h-[65vw] w-[65vw] rounded-full bg-[#c98d72]/15 blur-[120px]"
            />
            <motion.div
              style={{ y: backgroundY }}
              className="absolute -left-[15%] top-[35%] h-[50vw] w-[50vw] rounded-full bg-teal-500/10 blur-[110px]"
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
            <motion.div
              style={{ opacity: heroOpacity }}
              className="flex-1 w-full text-left"
            >

              <motion.div
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 border border-teal-500/30 rounded-full px-4 py-1.5 mb-8 bg-teal-500/10"
              >
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-teal-300">
                  {copy.hero.tag}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.08 }}
                className={`text-4xl md:text-5xl lg:text-[4.5rem] font-black mb-6 leading-[1.05] tracking-tight ${theme.text}`}
              >
                {copy.hero.title}
                <br />
                <span className="bg-gradient-to-r from-[#c98d72] via-rose-400 to-teal-500 bg-clip-text text-transparent">
                  {copy.hero.highlight}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.16 }}
                className={`text-lg md:text-xl leading-relaxed mb-10 ${theme.textMuted} max-w-2xl`}
              >
                {copy.hero.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.22 }}
                className="flex flex-wrap items-center gap-3 mb-10"
              >
                {copy.hero.proof.map((item) => (
                  <span
                    key={item}
                    className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                      isLightMode
                        ? 'border-slate-200 bg-white text-slate-700'
                        : 'border-white/10 bg-slate-900/50 text-slate-200'
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </motion.div>

              <motion.blockquote
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.24 }}
                className={`pl-5 border-l-4 ${isLightMode ? 'border-teal-500 bg-teal-50/50' : 'border-teal-500 bg-teal-900/10'} py-3 pr-4 rounded-r-xl italic text-base mb-8 ${theme.text}`}
              >
                {copy.hero.quote}
              </motion.blockquote>

              <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.28 }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {copy.hero.stats.map((stat, idx) => (
                    <div key={idx} className={`flex flex-col rounded-2xl border p-3 ${theme.card}`}>
                      <div className="mb-2">
                        {stat.icon === 'Users' && <UsersIcon className="w-5 h-5 text-teal-400 opacity-70" />}
                        {stat.icon === 'Layers' && <LayersIcon className="w-5 h-5 text-teal-400 opacity-70" />}
                        {stat.icon === 'Search' && <SearchIcon className="w-5 h-5 text-teal-400 opacity-70" />}
                        {stat.icon === 'Globe' && <GlobeIcon className="w-5 h-5 text-teal-400 opacity-70" />}
                      </div>
                      <div>
                        <div className={`text-2xl font-black mb-0.5 tracking-tight ${theme.text}`}>{stat.value}</div>
                        <div className={`text-[11px] font-medium leading-snug whitespace-pre-line ${theme.textMuted}`}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className="w-full inline-flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-5 rounded-xl transition-colors text-sm shadow-lg shadow-teal-500/20">
                    <FigmaIcon className="w-4 h-4" /> {copy.hero.ctaFigma} <ExternalLinkIcon className="w-4 h-4 opacity-50" />
                  </a>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: reduceMotion ? 0 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.28 }}
              className="flex-1 w-full relative mt-8 md:mt-0 md:sticky md:top-24"
            >
              <div className="absolute inset-0 bg-teal-500 rounded-3xl blur-3xl opacity-20" />
              <ZoomableImage 
                src="/images/case-study/nailhub_hero_abstract.jpg" 
                alt={copy.hero.mockupAlt} 
                className={`relative z-10 w-full rounded-3xl shadow-2xl object-cover border ${
                  isLightMode ? 'border-slate-200/50' : 'border-white/10'
                }`} 
              />
            </motion.div>
          </div>
        </motion.section>
      </div>

      <div className="container mx-auto pb-20 md:pb-32">
        {/* 01 · SNAPSHOT */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <header className="lg:col-span-5">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-teal-500">
                {copy.snapshot.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl break-words ${theme.text}`}
              >
                {copy.snapshot.title}
              </h2>
            </header>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {copy.snapshot.items.map(([label, value]) => (
                  <div
                    key={label}
                    className={`rounded-2xl border p-5 ${theme.card}`}
                  >
                    <p
                      className={`text-[10px] font-black uppercase tracking-[0.15em] ${theme.textMuted}`}
                    >
                      {label}
                    </p>
                    <p className={`mt-2 text-sm font-bold ${theme.text}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <article className={`rounded-3xl border p-7 ${theme.card}`}>
                  <SearchIcon className="h-7 w-7 text-rose-400" />
                  <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                    {copy.snapshot.problemTitle}
                  </h3>
                  <p className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}>
                    {copy.snapshot.problem}
                  </p>
                </article>
                <article className={`rounded-3xl border p-7 ${theme.card}`}>
                  <LayersIcon className="h-7 w-7 text-teal-500" />
                  <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                    {copy.snapshot.businessTitle}
                  </h3>
                  <p className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}>
                    {copy.snapshot.business}
                  </p>
                </article>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-5">
                <article
                  className={`rounded-3xl border p-7 lg:col-span-3 ${theme.card}`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c98d72]">
                    {copy.snapshot.roleTitle}
                  </p>
                  <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                    {copy.snapshot.owned.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <aside
                  className={`rounded-3xl border p-7 lg:col-span-2 ${
                    isLightMode
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-amber-500/20 bg-amber-500/10'
                  }`}
                >
                  <EvidenceIcon className="h-7 w-7 text-amber-500" />
                  <h3 className={`mt-5 text-lg font-black ${theme.text}`}>
                    {copy.snapshot.boundaryTitle}
                  </h3>
                  <p className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}>
                    {copy.snapshot.boundary}
                  </p>
                </aside>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 02 · ROLE JOURNEYS */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-teal-500">
                {copy.discovery.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
              >
                {copy.discovery.title}
              </h2>
            </div>
            <p className={`lg:col-span-5 ${theme.textMuted}`}>
              {copy.discovery.description}
            </p>
          </div>

          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
            role="tablist"
            aria-label={
              language === 'vi'
                ? 'Các nhóm người dùng Nailhub'
                : 'Nailhub user groups'
            }
          >
            {roles.map((role) => {
              const isActive = role.id === activeRole;
              return (
                <button
                  key={role.id}
                  id={`nailhub-role-tab-${role.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`nailhub-role-panel-${role.id}`}
                  onClick={() => setActiveRole(role.id)}
                  className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                    isActive
                      ? `${role.activeSurface} shadow-xl`
                      : `${theme.card} hover:-translate-y-1`
                  }`}
                >
                  <p
                    className={`text-xs font-black uppercase tracking-[0.16em] ${
                      isActive ? 'text-white/70' : role.accent
                    }`}
                  >
                    {role.label}
                  </p>
                  <h3
                    className={`mt-3 text-lg font-black ${
                      isActive ? 'text-white' : theme.text
                    }`}
                  >
                    {role.title}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      isActive ? 'text-white/80' : theme.textMuted
                    }`}
                  >
                    {role.need}
                  </p>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              id={`nailhub-role-panel-${activeRole}`}
              role="tabpanel"
              aria-labelledby={`nailhub-role-tab-${activeRole}`}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
              className={`mt-6 overflow-hidden rounded-[2rem] border ${theme.card}`}
            >
              <div
                className={`flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center ${theme.divider}`}
              >
                <div>
                  <p
                    className={`text-xs font-black uppercase tracking-[0.16em] ${selectedRole.accent}`}
                  >
                    {copy.discovery.journeyPrefix}
                    {selectedRole.label}
                  </p>
                  <h3 className={`mt-2 text-2xl font-black ${theme.text}`}>
                    {selectedRole.title}
                  </h3>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${selectedRole.softSurface} ${selectedRole.accent}`}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  {selectedRole.outcome}
                </div>
              </div>

              <div className="hide-scrollbar flex items-center overflow-x-auto p-6 sm:p-8">
                {selectedRole.steps.map((step, index) => (
                  <React.Fragment key={step}>
                    <div
                      className={`min-w-[145px] rounded-2xl border p-4 text-center ${
                        isLightMode
                          ? 'border-slate-200 bg-slate-50'
                          : 'border-white/10 bg-white/[0.04]'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-black ${selectedRole.accent}`}
                      >
                        0{index + 1}
                      </span>
                      <p className={`mt-2 text-sm font-bold ${theme.text}`}>
                        {step}
                      </p>
                    </div>
                    {index < selectedRole.steps.length - 1 && (
                      <ArrowRightIcon
                        className={`mx-2 h-4 w-4 shrink-0 ${selectedRole.accent}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={`mt-6 rounded-3xl border p-6 ${theme.card}`}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c98d72]">
                  {copy.discovery.systemTitle}
                </p>
                <p className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}>
                  {copy.discovery.systemDescription}
                </p>
              </div>
              <div className="flex max-w-2xl flex-wrap gap-2">
                {copy.discovery.modules.map((module) => (
                  <span
                    key={module}
                    className={`rounded-full border px-3 py-2 text-[10px] font-bold ${
                      isLightMode
                        ? 'border-slate-200 bg-slate-50 text-slate-600'
                        : 'border-white/10 bg-white/[0.04] text-slate-300'
                    }`}
                  >
                    {module}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* 03 · ARCHITECTURE */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="grid gap-12 lg:grid-cols-12">
            <header className="lg:col-span-4">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-sky-500">
                {copy.architecture.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
              >
                {copy.architecture.title}
              </h2>
              <p className={`mt-5 leading-relaxed ${theme.textMuted}`}>
                {copy.architecture.description}
              </p>
            </header>

            <div className="lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {copy.architecture.hierarchy.map((group, index) => (
                  <article
                    key={group.title}
                    className={`rounded-3xl border p-6 ${theme.card}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xl font-black ${theme.text}`}>
                        {group.title}
                      </h3>
                      <span className="text-xs font-black text-teal-500">
                        0{index + 1}
                      </span>
                    </div>
                    <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                      {group.items.map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <aside
                className={`mt-5 rounded-3xl border p-7 ${
                  isLightMode
                    ? 'border-teal-200 bg-teal-50'
                    : 'border-teal-500/20 bg-teal-500/10'
                }`}
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-500">
                  {copy.architecture.ruleTitle}
                </p>
                <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                  {copy.architecture.rules.map((rule) => (
                    <li key={rule} className="flex items-start gap-3">
                      <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </motion.section>

        {/* 04 · DECISIONS */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <header className="mb-14 text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#c98d72]">
              {copy.decisions.tag}
            </p>
            <h2
              className={`text-4xl font-black tracking-tight md:text-5xl ${theme.text}`}
            >
              {copy.decisions.title}
            </h2>
          </header>

          <figure
            className={`overflow-hidden rounded-[2rem] border shadow-2xl ${theme.card}`}
          >
            <div
              className={`flex items-center gap-2 border-b px-5 py-3 ${theme.divider}`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
              <figcaption
                className={`ml-3 text-[10px] font-bold ${theme.textMuted}`}
              >
                {copy.decisions.mockupTag}
              </figcaption>
            </div>
            <div className="relative bg-white">
              <img
                loading="lazy"
                decoding="async"
                src="/images/case-study/nailhub_search_flow.png"
                alt={copy.decisions.mockupAlt}
                className="aspect-[16/9] w-full object-cover object-top"
              />
              <div className="absolute left-[14%] top-[12%] hidden rounded-full border border-white/30 bg-slate-950/85 px-3 py-2 text-[10px] font-black text-white backdrop-blur-md md:block">
                {copy.decisions.tooltips[0]}
              </div>
              <div className="absolute left-[17%] top-[31%] hidden rounded-full border border-white/30 bg-teal-600/90 px-3 py-2 text-[10px] font-black text-white backdrop-blur-md md:block">
                {copy.decisions.tooltips[1]}
              </div>
              <div className="absolute right-[13%] top-[48%] hidden rounded-full border border-white/30 bg-[#b66f52]/90 px-3 py-2 text-[10px] font-black text-white backdrop-blur-md md:block">
                {copy.decisions.tooltips[2]}
              </div>
            </div>
          </figure>

          <div className="mt-8 space-y-5">
            {copy.decisions.cards.map((decision) => (
              <article
                key={decision.number}
                className={`grid gap-7 rounded-3xl border p-6 md:grid-cols-12 md:p-8 ${theme.card}`}
              >
                <div className="md:col-span-4">
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border text-xs font-black ${decision.surface} ${decision.accent}`}
                  >
                    {decision.number}
                  </div>
                  <p
                    className={`mt-5 text-[10px] font-black uppercase tracking-[0.17em] ${decision.accent}`}
                  >
                    {decision.eyebrow}
                  </p>
                  <h3 className={`mt-2 text-2xl font-black ${theme.text}`}>
                    {decision.title}
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:col-span-8">
                  {[
                    [
                      language === 'vi' ? 'Vấn đề' : 'Problem',
                      decision.problem,
                    ],
                    [
                      language === 'vi' ? 'Quyết định' : 'Decision',
                      decision.decision,
                    ],
                    [
                      language === 'vi' ? 'Nguyên tắc' : 'Principle',
                      decision.principle,
                    ],
                    [
                      language === 'vi' ? 'Đánh đổi' : 'Trade-off',
                      decision.tradeoff,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className={`rounded-2xl border p-5 ${
                        isLightMode
                          ? 'border-slate-200 bg-slate-50'
                          : 'border-white/10 bg-white/[0.03]'
                      }`}
                    >
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.15em] ${decision.accent}`}
                      >
                        {label}
                      </p>
                      <p
                        className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </motion.section>

        {/* 05 · EVIDENCE */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="grid gap-12 lg:grid-cols-12">
            <header className="lg:col-span-5">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-amber-500">
                {copy.validation.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl break-words ${theme.text}`}
              >
                {copy.validation.title}
              </h2>
              <p className={`mt-5 leading-relaxed ${theme.textMuted}`}>
                {copy.validation.description}
              </p>
            </header>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {copy.validation.evidence.map((item) => (
                  <article
                    key={item.label}
                    className={`rounded-3xl border p-5 ${theme.card}`}
                  >
                    <p className="text-3xl font-black tracking-tight text-teal-500">
                      {item.value}
                    </p>
                    <p
                      className={`mt-4 text-xs font-black uppercase tracking-[0.12em] ${theme.text}`}
                    >
                      {item.label}
                    </p>
                    <p className={`mt-2 text-[11px] leading-relaxed ${theme.textMuted}`}>
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <article className={`rounded-3xl border p-7 ${theme.card}`}>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-500">
                    {copy.validation.measureTitle}
                  </p>
                  <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                    {copy.validation.measures.map((measure) => (
                      <li key={measure} className="flex items-start gap-3">
                        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
                        {measure}
                      </li>
                    ))}
                  </ul>
                </article>

                <aside
                  className={`rounded-3xl border p-7 ${
                    isLightMode
                      ? 'border-rose-200 bg-rose-50'
                      : 'border-rose-500/20 bg-rose-500/10'
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">
                    {copy.validation.caveatTitle}
                  </p>
                  <p className={`mt-5 text-sm leading-relaxed ${theme.textMuted}`}>
                    {copy.validation.caveat}
                  </p>
                </aside>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FIGMA EVIDENCE — preserves the original teaser image */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div
            className={`relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border shadow-2xl ${
              isLightMode ? 'border-slate-200' : 'border-white/10'
            }`}
          >
            <div className="absolute inset-0 z-0">
              <img
                loading="lazy"
                decoding="async"
                src="/images/case-study/nailhub_figma_teaser.jpg"
                alt={copy.figma.imageAlt}
                className="h-full w-full object-cover opacity-60 dark:opacity-40"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${
                  isLightMode
                    ? 'from-white/95 via-white/80 to-white/10'
                    : 'from-slate-950/95 via-slate-950/80 to-slate-950/10'
                }`}
              />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center px-8 py-16 text-center md:px-16 md:py-20">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-teal-500">
                {copy.figma.tag}
              </p>
              <h2
                className={`mb-4 text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
              >
                {copy.figma.title}
              </h2>
              <p
                className={`mb-8 max-w-2xl text-sm font-medium leading-relaxed md:text-lg ${theme.textMuted}`}
              >
                {copy.figma.description}
              </p>

              <a
                href={FIGMA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-3 rounded-xl px-8 py-4 font-black shadow-xl transition-all hover:scale-105 ${
                  isLightMode
                    ? 'bg-[#0d9488] text-white shadow-teal-500/25 hover:bg-[#0f766e]'
                    : 'bg-teal-500 text-slate-950 shadow-teal-500/20 hover:bg-teal-400'
                }`}
              >
                <FigmaIcon className="h-6 w-6" />
                {copy.figma.button}
              </a>
            </div>
          </div>
        </motion.section>

        {/* 06 · RETROSPECTIVE */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <header className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-teal-500">
              {copy.reflection.tag}
            </p>
            <h2
              className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
            >
              {copy.reflection.title}
            </h2>
          </header>

          <div className="grid gap-5 md:grid-cols-2">
            <article className={`rounded-3xl border p-7 ${theme.card}`}>
              <UsersIcon className="h-7 w-7 text-[#c98d72]" />
              <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                {copy.reflection.learningsTitle}
              </h3>
              <ul className={`mt-5 space-y-4 text-sm ${theme.textMuted}`}>
                {copy.reflection.learnings.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#c98d72]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className={`rounded-3xl border p-7 ${theme.card}`}>
              <ArrowRightIcon className="h-7 w-7 text-teal-500" />
              <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                {copy.reflection.nextTitle}
              </h3>
              <ul className={`mt-5 space-y-4 text-sm ${theme.textMuted}`}>
                {copy.reflection.next.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </motion.section>
      </div>
    </CaseStudyLayout>
  );
};
