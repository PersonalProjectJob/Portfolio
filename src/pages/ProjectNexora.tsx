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
type Language = 'vi' | 'en';
type RoleId = 'merchant' | 'staff' | 'customer';
type PaymentStateId = 'amount' | 'method' | 'processing' | 'success' | 'failure';

type Journey = {
  id: RoleId;
  label: string;
  title: string;
  need: string;
  outcome: string;
  entryPoints: string[];
  workspace: string[];
  actions: string[];
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
  'https://www.figma.com/design/Y6WpL0AO5dWex3fCC0TqJl/Nexora?node-id=462-113&t=Oz5usdksmtTeMDNA-1';

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

const FlowIcon = ({ className }: { className?: string }) => (
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
    <rect width="8" height="8" x="3" y="3" rx="2" />
    <rect width="8" height="8" x="13" y="13" rx="2" />
    <line x1="17" x2="17" y1="3" y2="13" />
    <line x1="7" x2="7" y1="11" y2="21" />
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

const ShieldCheckIcon = ({ className }: { className?: string }) => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CodeIcon = ({ className }: { className?: string }) => (
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
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
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

const AlertTriangleIcon = ({ className }: { className?: string }) => (
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
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
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
    <line x1="10" x2="21" y1="14" y2="3" />
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
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </svg>
);

const StoreIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const StateGlyph = ({
  state,
  className,
}: {
  state: PaymentStateId;
  className?: string;
}) => {
  if (state === 'processing') {
    return (
      <span
        aria-label="Processing"
        className={`block h-10 w-10 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600 ${className ?? ''}`}
      />
    );
  }

  if (state === 'failure') {
    return (
      <svg
        aria-hidden="true"
        className={className}
        width="38"
        height="38"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6M9 9l6 6" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      width="38"
      height="38"
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
};

const content = {
  vi: {
    hero: {
      badge: 'AI-ASSISTED PRODUCT ARCHITECTURE',
      title1: 'Một Hệ thống.',
      title2: 'Ba Vai trò.',
      titleHighlight: 'Kết nối Vô hạn.',
      description:
        'Thiết kế kiến trúc sản phẩm và hệ thống trải nghiệm cho NEXORA — một nền tảng kết nối Merchant, Staff và Customer thông qua workflow do AI tạo, với role, routing, trạng thái và data boundary rõ ràng.',
      roles: [
        { label: 'Merchant', title: 'Owner' },
        { label: 'Staff', title: 'Member' },
        { label: 'Customer', title: 'Community' },
      ],
      stats: [
        { value: '56', label: 'Route\nDeclarations', icon: 'Flow' },
        { value: '235+', label: 'TSX\nComponents', icon: 'Code' },
        { value: '12', label: 'Core Flow\nAreas', icon: 'Layers' },
        { value: '2', label: 'Languages\n(EN / VI)', icon: 'Globe' },
      ],
      ctaExplore: 'Khám phá Hệ thống',
      ctaFigma: 'Xem trên Figma',
      mockupAlt:
        'Giao diện dashboard Nexora thể hiện hệ thống quản lý Merchant',
    },
    snapshot: {
      tag: '01 · Source-backed snapshot',
      title: 'Từ UI rời rạc đến một hệ thống vận hành\u00A0được',
      items: [
        ['Vai trò', 'UX Architect / Product Designer'],
        ['Nền tảng', 'Web & Mobile App'],
        ['Phương pháp', 'System Thinking'],
        ['Công cụ', 'Figma, React, AI Coding Agent'],
      ],
      problemTitle: 'Bài toán',
      problem:
        'AI có thể tạo nhanh từng màn hình đẹp, nhưng không tự đảm bảo các màn hình dùng chung logic, nối đúng hành trình hay bao phủ loading, empty, failure và recovery. Khi sản phẩm có nhiều vai trò, sự rời rạc này nhanh chóng biến thành lỗi routing, trạng thái và dữ liệu.',
      productTitle: 'NEXORA phải kết nối điều\u00A0gì?',
      product:
        'Merchant quản lý salon và nhân sự; Staff nhận tip, payout và làm việc tại nhiều salon; Customer tương tác qua QR, thanh toán, review và booking. Các workflow này phải dùng chung hệ thống nhưng không được làm mất trách nhiệm riêng của từng vai trò.',
      contributionTitle: 'Phạm vi tôi phụ\u00A0trách',
      contribution: [
        'Định nghĩa product map, role model, entry point và workflow xuyên suốt.',
        'Tổ chức information architecture cho Owner dashboard, Staff workspace và Public/Customer flow.',
        'Chuẩn hóa state contract: loading, empty, processing, success, failure và recovery.',
        'Chuyển logic sản phẩm thành module/component để AI và Engineering có thể tái sử dụng.',
        'Thiết lập quy tắc handoff, design token và data-boundary nhằm giảm implementation drift.',
      ],
      boundaryTitle: 'Ranh giới bằng\u00A0chứng',
      boundary:
        'Các số liệu trong case study được lấy từ source archive: route declarations, component files và locale keys. Chúng thể hiện độ phủ triển khai, không phải conversion, retention hay mức độ hài lòng của người dùng. Source không kèm mẫu nghiên cứu hoặc analytics sau launch.',
    },
    roles: {
      tag: '02 · Connected role model',
      title: 'Một hệ thống, ba\u00A0workspace',
      description:
        'Role không chỉ thay đổi menu. Mỗi vai trò có entry point, mục tiêu, quyền và trạng thái kết thúc riêng, nhưng cùng chia sẻ business, staff, payment và activity data.',
      journeyPrefix: 'Workflow chính · ',
      labels: {
        merchant: {
          label: 'Merchant / Owner',
          title: 'Thiết lập và vận hành salon',
          need:
            'Quản lý nhân sự, touchpoint, tip, review, giao dịch, booking và cấu hình doanh nghiệp.',
          outcome: 'Salon có thể vận hành và theo dõi',
          entryPoints: ['Login', 'Register', 'Onboarding'],
          workspace: [
            'Dashboard',
            'Staff',
            'Touchpoints',
            'Booking Hub',
            'Reports',
          ],
          actions: [
            'Approve staff',
            'Configure QR',
            'Review activity',
            'Manage payout',
            'Create booking',
          ],
        },
        staff: {
          label: 'Staff',
          title: 'Nhận thu nhập và quản lý công việc cá nhân',
          need:
            'Tham gia salon, nhận tip/payout, theo dõi giao dịch, review, QR và hồ sơ.',
          outcome: 'Thu nhập và trạng thái được minh bạch',
          entryPoints: ['Invite', 'Join link', 'Staff login'],
          workspace: ['Home', 'My QR', 'Tips', 'Payments', 'Earnings'],
          actions: [
            'Join salon',
            'Share QR',
            'Review earnings',
            'Set payout',
            'Manage profile',
          ],
        },
        customer: {
          label: 'Customer / Public',
          title: 'Tương tác mà không cần học hệ thống',
          need:
            'Quét QR, tip, thanh toán trực tiếp, review hoặc đặt lịch với ít ma sát.',
          outcome: 'Hành động công khai hoàn tất rõ ràng',
          entryPoints: ['Touch QR', 'Direct-pay link', 'Booking link'],
          workspace: [
            'Public profile',
            'Payment flow',
            'Booking flow',
            'Result',
          ],
          actions: [
            'Choose amount',
            'Choose method',
            'Submit review',
            'Book service',
            'Recover failure',
          ],
        },
      },
      sharedTitle: 'Shared system',
      sharedDescription:
        'Ba workspace dùng chung identity, business context, staff relationship, payment methods, transaction states và bilingual content. Điều này giúp dữ liệu liên kết nhưng vẫn giữ UI theo trách nhiệm của từng role.',
      sharedModules: [
        'Authentication',
        'Business context',
        'Staff relationship',
        'Payment methods',
        'Transaction state',
        'Notifications',
        'Localization',
        'Permissions',
      ],
    },
    architecture: {
      tag: '03 · Product architecture',
      title: 'Entry → Workspace → Task → State →\u00A0Handoff',
      description:
        'Thay vì mô tả sản phẩm bằng danh sách màn hình, kiến trúc được tổ chức theo cách người dùng đi vào hệ thống, làm việc và chuyển trách nhiệm sang role hoặc service tiếp theo.',
      stages: [
        {
          number: '01',
          title: 'Entry',
          description:
            'Login, onboarding, invite, QR, direct-payment link hoặc public booking.',
          evidence: 'Public + protected routes',
        },
        {
          number: '02',
          title: 'Workspace',
          description:
            'Owner dashboard, Staff dashboard hoặc public customer surface.',
          evidence: 'Role-aware route guards',
        },
        {
          number: '03',
          title: 'Task',
          description:
            'Quản lý staff, tip, payment, review, touchpoint, booking và settings.',
          evidence: 'Modular feature areas',
        },
        {
          number: '04',
          title: 'State',
          description:
            'Loading, empty, processing, success, failure và permission gate.',
          evidence: 'Explicit system feedback',
        },
        {
          number: '05',
          title: 'Handoff',
          description:
            'Mutation, cache invalidation, notification, payout hoặc next role action.',
          evidence: 'Shared data boundary',
        },
      ],
      ownerTitle: 'Owner workspace',
      ownerModules: [
        'Overview',
        'Staff',
        'Tips',
        'Reviews',
        'Transactions',
        'Touchpoints',
        'AI / Booking Hub',
        'Gift Card Center',
        'Analytics',
        'Settings',
        'Subscriptions',
        'Support',
      ],
      staffTitle: 'Staff workspace',
      staffModules: [
        'Home',
        'My QR',
        'Tips',
        'Reviews',
        'Pay',
        'Payments',
        'Earnings',
        'My salons',
        'Profile',
        'Notifications',
      ],
    },
    orchestration: {
      tag: '04 · AI orchestration method',
      title: 'Không prompt màn hình. Prompt một hệ thống có hợp\u00A0đồng.',
      description:
        'Source cho thấy NEXORA không chỉ có UI. Dự án sử dụng route guard, repository/data-hook boundary, design token, locale và build mode để biến quyết định sản phẩm thành ràng buộc mà AI Builder phải tuân theo.',
      steps: [
        {
          title: 'Map first',
          description:
            'Xác định role, route, entry point, task và dependency trước khi sinh component.',
        },
        {
          title: 'Module contract',
          description:
            'Mỗi feature có component, hook, repository, domain type và API mapping rõ ràng.',
        },
        {
          title: 'State coverage',
          description:
            'Happy path không đủ; mỗi flow phải có loading, empty, error, guards và recovery.',
        },
        {
          title: 'Reusable system',
          description:
            'Tái sử dụng pattern cho dashboard, list, detail, modal, payment và status.',
        },
        {
          title: 'Implementation guardrails',
          description:
            'Token lint, TypeScript, environment builds và CI rules giới hạn implementation drift.',
        },
      ],
      dataBoundaryTitle: 'Data boundary trong\u00A0source',
      dataBoundary:
        'Component → data hook → repository → adapter/API. Cấu trúc này giúp UI không tự đoán contract và giúp thay đổi API được cô lập khỏi presentation layer.',
    },
    lab: {
      tag: '05 · Interactive state lab',
      title: 'Thiết kế những khoảnh khắc giữa các màn\u00A0hình',
      description:
        'Payment flow là ví dụ nhỏ nhưng thể hiện nguyên tắc lớn của NEXORA: mỗi trạng thái phải giải thích hệ thống đang làm gì, bảo toàn dữ liệu nào và người dùng có thể phục hồi ra sao.',
      select: 'Chọn trạng thái',
      preview: 'Bản xem trước flow Customer Tip',
      interactive: 'Interactive',
      behaviorsTitle: 'System behavior được bao\u00A0phủ',
      behaviors: ['Loading', 'Error & guards', 'Empty state', 'Toast', 'Tooltip'],
      states: {
        amount: {
          label: 'Amount',
          eyebrow: '01 · Input',
          description:
            'Suggested amounts giảm effort, trong khi custom amount giữ flow linh hoạt.',
        },
        method: {
          label: 'Method',
          eyebrow: '02 · Decision',
          description:
            'Tổng tiền vẫn được giữ trong context khi khách chọn phương thức thanh toán quen thuộc.',
        },
        processing: {
          label: 'Processing',
          eyebrow: '03 · Feedback',
          description:
            'Waiting state tập trung ngăn duplicate action và giải thích hệ thống đang xác nhận điều gì.',
        },
        success: {
          label: 'Success',
          eyebrow: '04 · Resolution',
          description:
            'Confirmation đóng vòng lặp và nói rõ tip đang được chuyển đến ai.',
        },
        failure: {
          label: 'Failure',
          eyebrow: '05 · Recovery',
          description:
            'Flow bảo toàn amount và cung cấp retry/change-method thay vì đẩy người dùng vào dead end.',
        },
      },
      screen: {
        secure: 'Secure checkout',
        brand: 'NEXORA TOUCH',
        salon: 'Luxe Nail Spa',
        steps: ['Amount', 'Payment', 'Status'],
        amountEyebrow: 'Show your appreciation',
        amountTitle: 'Choose a tip amount',
        customAmount: 'Enter a custom amount',
        continue: 'Continue with $10',
        total: 'Tip total',
        methodTitle: 'Choose how to pay',
        methods: ['Apple Pay', 'Credit or debit card', 'Cash App Pay'],
        processingTitle: 'Securing your tip',
        processingDesc:
          'Keep this window open. We’re confirming your $10.00 payment.',
        processingTime: 'Usually takes a few seconds',
        successEyebrow: 'Payment confirmed',
        successTitle: 'You made their day.',
        successDesc: 'Your $10.00 tip is on its way to Alex at Luxe Nail Spa.',
        done: 'Done',
        failureEyebrow: 'Payment not completed',
        failureTitle: 'Your tip is still saved.',
        failureDesc:
          'No charge was made. Try again or choose another payment method.',
        changeMethod: 'Change method',
        retry: 'Try again',
      },
    },
    decisions: {
      tag: '06 · Key product decisions',
      title: 'Quyết định thiết kế và đánh\u00A0đổi',
      cards: [
        {
          number: '01',
          eyebrow: 'Role-aware architecture',
          title: 'Tách workspace, dùng chung data\u00A0model',
          problem:
            'Nếu Owner, Staff và Customer dùng chung navigation và action hierarchy, trách nhiệm trở nên mơ hồ.',
          decision:
            'Tạo route shell và workspace riêng cho từng role, nhưng dùng chung business, staff, payment và activity entities.',
          principle:
            'Tách trải nghiệm theo mục tiêu; kết nối dữ liệu theo hệ thống.',
          tradeoff:
            'Tăng số route và permission case, đổi lại workflow rõ và dễ mở rộng.',
          accent: 'text-violet-500',
          surface: 'border-violet-500/20 bg-violet-500/10',
        },
        {
          number: '02',
          eyebrow: 'State-first workflow',
          title: 'Thiết kế trạng thái trước khi polish\u00A0UI',
          problem:
            'AI thường sinh happy path đẹp nhưng bỏ qua loading, empty, failure và recovery.',
          decision:
            'Mỗi flow phải định nghĩa state contract và CTA hợp lệ trước khi hoàn thiện presentation.',
          principle:
            'Một sản phẩm đáng tin cậy được tạo nên ở khoảng giữa các màn hình.',
          tradeoff:
            'Mất thêm thời gian lập state matrix, đổi lại giảm dead end và implementation guesswork.',
          accent: 'text-amber-500',
          surface: 'border-amber-500/20 bg-amber-500/10',
        },
        {
          number: '03',
          eyebrow: 'Data-boundary discipline',
          title: 'UI không tự đoán\u00A0API',
          problem:
            'Khi component gọi API trực tiếp, thay đổi contract lan rộng và AI dễ sinh logic trùng lặp.',
          decision:
            'Duy trì chuỗi component → hook → repository → adapter/domain.',
          principle:
            'Presentation thể hiện quyết định; data layer chịu trách nhiệm contract.',
          tradeoff:
            'Có nhiều layer hơn, nhưng thay đổi được cô lập và có thể kiểm chứng.',
          accent: 'text-cyan-500',
          surface: 'border-cyan-500/20 bg-cyan-500/10',
        },
        {
          number: '04',
          eyebrow: 'AI with guardrails',
          title: 'Tăng tốc nhưng không trao quyền kiến\u00A0trúc',
          problem:
            'AI tạo code nhanh nhưng có thể hardcode token, phá consistency hoặc bỏ qua environment/API rule.',
          decision:
            'Đưa design token, lint script, typecheck, build mode và story/API mapping vào workflow.',
          principle:
            'AI được tự do xây trong phạm vi hợp đồng đã xác định.',
          tradeoff:
            'Cần duy trì rule và documentation, đổi lại tốc độ không làm mất chất lượng hệ thống.',
          accent: 'text-emerald-500',
          surface: 'border-emerald-500/20 bg-emerald-500/10',
        },
      ] as Decision[],
    },
    evidence: {
      tag: '07 · Implementation evidence',
      title: 'Evidence từ source, không phải số liệu trang\u00A0trí',
      description:
        'Các con số dưới đây được kiểm tra trực tiếp trong archive `vlink-nexora-fe`. Chúng mô tả quy mô implementation và độ phủ nội dung, không chứng minh outcome kinh doanh.',
      metrics: [
        {
          value: '56',
          label: 'Route declarations',
          description:
            'Public, onboarding, Owner dashboard và Staff dashboard.',
        },
        {
          value: '235',
          label: 'TSX component files',
          description:
            'Feature, layout, modal, view và shared UI trong `src/components`.',
        },
        {
          value: '461',
          label: 'TS / TSX source files',
          description:
            'Presentation, data hooks, repositories, domain và utilities.',
        },
        {
          value: '3.6k+',
          label: 'Locale leaf keys / language',
          description:
            '3,674 EN và 3,669 VI keys trong archive được kiểm tra.',
        },
      ],
      imageTag: 'Bằng chứng · Dashboard implementation',
      imageAlt:
        'Ảnh dashboard Nexora được giữ nguyên từ case study hiện tại',
      figmaButton: 'Khám phá Product Map trên Figma',
      sourceTitle: 'Những gì source xác minh\u00A0được',
      sourceItems: [
        'React + Vite + TypeScript và React Router.',
        'Owner, Staff và public Customer route groups.',
        'Dashboard, staff, tips, reviews, transactions, touchpoints, booking, analytics và settings.',
        'Tokenized Tailwind theme và bilingual locale.',
        'Data hooks/repositories và multi-environment build configuration.',
      ],
    },
    validation: {
      tag: '08 · Validation boundary',
      title: 'Tách delivery evidence khỏi user\u00A0impact',
      description:
        'Source archive chứng minh hệ thống đã được tổ chức và triển khai ở quy mô lớn. Tuy nhiên, nó không tự chứng minh người dùng hoàn thành task nhanh hơn hay doanh nghiệp tăng doanh thu.',
      validatedTitle: 'Có thể khẳng\u00A0định',
      validated: [
        'Architecture có ba role và các route guard riêng.',
        'Các module sản phẩm được liên kết trong một codebase.',
        'Payment prototype bao phủ amount, method, processing, success và failure.',
        'Hệ thống có nội dung song ngữ và design token.',
      ],
      missingTitle: 'Chưa có bằng chứng trong\u00A0source',
      missing: [
        'Sample size và phương pháp user research.',
        'Task success, time-on-task và error rate.',
        'Conversion từ QR đến tip/payment/booking.',
        'Retention, revenue hoặc support-ticket reduction.',
      ],
      planTitle: 'Measurement plan đề\u00A0xuất',
      plan: [
        'Activation: hoàn tất onboarding và tạo touchpoint đầu tiên.',
        'Customer funnel: QR open → action selected → payment/review completed.',
        'Staff funnel: invite → join → payout configured → first earning.',
        'Booking funnel: landing → service selected → booking completed.',
        'Operational quality: support reason, failed payment và recovery success.',
      ],
    },
    retrospective: {
      tag: '09 · Retrospective',
      title: 'Điều NEXORA chứng\u00A0minh',
      learningsTitle: 'Bài học',
      learnings: [
        'Tốc độ sinh UI không thay thế được product architecture.',
        'Role, route và state phải được thiết kế như một hệ thống liên kết.',
        'AI hiệu quả nhất khi nhận module contract nhỏ, rõ và có thể kiểm tra.',
        'Codebase cũng là bằng chứng thiết kế khi quyết định UX được mã hóa thành route, state và data boundary.',
      ],
      nextTitle: 'Bước tiếp\u00A0theo',
      next: [
        'Bổ sung research log, participant profile và insight traceability.',
        'Xây usability test cho Owner, Staff và Customer workflow.',
        'Gắn product analytics theo activation và cross-role handoff.',
        'Mở rộng automated test coverage tương ứng với quy mô route và component.',
      ],
      takeawayTitle: 'Takeaway',
      takeaway:
        'NEXORA không chỉ là một tập hợp màn hình được tạo bằng AI. Giá trị cốt lõi nằm ở việc biến tốc độ của AI thành một workflow có cấu trúc, nơi con người chịu trách nhiệm cho logic, trạng thái, dữ liệu và chất lượng trải nghiệm.',
      nextProject: 'Dự án tiếp theo:\u00A0VLINKPAY',
    },
  },
  en: {
    hero: {
      badge: 'AI-ASSISTED PRODUCT ARCHITECTURE',
      tag: 'NEXORA · AI-assisted product architecture',
      title1: 'One System.',
      title2: 'Three Roles.',
      titleHighlight: 'Infinite Connections.',
      description:
        'Designing the product architecture and experience system for NEXORA — a platform that connects Merchants, Staff and Customers through AI-generated workflows, explicit roles, routing, states and data boundaries.',
      roles: [
        { label: 'Merchant', title: 'Owner' },
        { label: 'Staff', title: 'Member' },
        { label: 'Customer', title: 'Community' },
      ],
      stats: [
        { value: '56', label: 'Route\nDeclarations', icon: 'Flow' },
        { value: '235+', label: 'TSX\nComponents', icon: 'Code' },
        { value: '12', label: 'Core Flow\nAreas', icon: 'Layers' },
        { value: '2', label: 'Languages\n(EN / VI)', icon: 'Globe' },
      ],
      ctaExplore: 'Explore the System',
      ctaFigma: 'View on Figma',
      mockupAlt:
        'Nexora dashboard interface showing the Merchant management system',
    },
    snapshot: {
      tag: '01 · Source-backed snapshot',
      title: 'From disconnected UI to an operable\u00A0system',
      items: [
        ['Role', 'UX Architect / Product Designer'],
        ['Platform', 'Web & Mobile App'],
        ['Method', 'System Thinking'],
        ['Tools', 'Figma, React, AI Coding Agent'],
      ],
      problemTitle: 'The problem',
      problem:
        'AI can create polished screens quickly, but it does not automatically make those screens share logic, connect journeys or cover loading, empty, failure and recovery. In a multi-role product, this fragmentation becomes routing, state and data inconsistency.',
      productTitle: 'What must NEXORA\u00A0connect?',
      product:
        'Merchants operate salons and teams; Staff receive tips, payouts and work across salons; Customers interact through QR, payments, reviews and bookings. These workflows need a shared system without erasing role-specific responsibility.',
      contributionTitle: 'My\u00A0contribution',
      contribution: [
        'Defined the product map, role model, entry points and end-to-end workflows.',
        'Structured information architecture for Owner, Staff and public Customer surfaces.',
        'Standardized state contracts: loading, empty, processing, success, failure and recovery.',
        'Translated product logic into reusable modules and components for AI and Engineering.',
        'Defined handoff, token and data-boundary rules to reduce implementation drift.',
      ],
      boundaryTitle: 'Evidence\u00A0boundary',
      boundary:
        'Metrics in this case study come from the source archive: route declarations, component files and locale keys. They represent implementation coverage—not conversion, retention or user satisfaction. The source does not include a research sample or post-launch analytics.',
    },
    roles: {
      tag: '02 · Connected role model',
      title: 'One system, three\u00A0workspaces',
      description:
        'A role changes more than the menu. Each role has its own entry point, goal, permissions and completion state while sharing business, staff, payment and activity data.',
      journeyPrefix: 'Primary workflow · ',
      labels: {
        merchant: {
          label: 'Merchant / Owner',
          title: 'Set up and operate the salon',
          need:
            'Manage staff, touchpoints, tips, reviews, transactions, booking and business configuration.',
          outcome: 'Salon operations are visible and manageable',
          entryPoints: ['Login', 'Register', 'Onboarding'],
          workspace: [
            'Dashboard',
            'Staff',
            'Touchpoints',
            'Booking Hub',
            'Reports',
          ],
          actions: [
            'Approve staff',
            'Configure QR',
            'Review activity',
            'Manage payout',
            'Create booking',
          ],
        },
        staff: {
          label: 'Staff',
          title: 'Receive earnings and manage personal work',
          need:
            'Join salons, receive tips and payouts, and manage transactions, reviews, QR and profile.',
          outcome: 'Earnings and status remain understandable',
          entryPoints: ['Invite', 'Join link', 'Staff login'],
          workspace: ['Home', 'My QR', 'Tips', 'Payments', 'Earnings'],
          actions: [
            'Join salon',
            'Share QR',
            'Review earnings',
            'Set payout',
            'Manage profile',
          ],
        },
        customer: {
          label: 'Customer / Public',
          title: 'Act without learning the system',
          need:
            'Scan a QR, tip, pay directly, leave a review or book with minimal friction.',
          outcome: 'The public action closes clearly',
          entryPoints: ['Touch QR', 'Direct-pay link', 'Booking link'],
          workspace: [
            'Public profile',
            'Payment flow',
            'Booking flow',
            'Result',
          ],
          actions: [
            'Choose amount',
            'Choose method',
            'Submit review',
            'Book service',
            'Recover failure',
          ],
        },
      },
      sharedTitle: 'Shared system',
      sharedDescription:
        'The three workspaces share identity, business context, staff relationships, payment methods, transaction states and bilingual content. Data remains connected while UI follows each role’s responsibility.',
      sharedModules: [
        'Authentication',
        'Business context',
        'Staff relationship',
        'Payment methods',
        'Transaction state',
        'Notifications',
        'Localization',
        'Permissions',
      ],
    },
    architecture: {
      tag: '03 · Product architecture',
      title: 'Entry → Workspace → Task → State → Handoff',
      description:
        'Rather than describing the product as a screen list, the architecture follows how people enter, work and transfer responsibility to another role or service.',
      stages: [
        {
          number: '01',
          title: 'Entry',
          description:
            'Login, onboarding, invite, QR, direct-payment link or public booking.',
          evidence: 'Public + protected routes',
        },
        {
          number: '02',
          title: 'Workspace',
          description:
            'Owner dashboard, Staff dashboard or public Customer surface.',
          evidence: 'Role-aware route guards',
        },
        {
          number: '03',
          title: 'Task',
          description:
            'Staff, tips, payment, reviews, touchpoints, booking and settings.',
          evidence: 'Modular feature areas',
        },
        {
          number: '04',
          title: 'State',
          description:
            'Loading, empty, processing, success, failure and permission gates.',
          evidence: 'Explicit system feedback',
        },
        {
          number: '05',
          title: 'Handoff',
          description:
            'Mutation, cache invalidation, notification, payout or the next role action.',
          evidence: 'Shared data boundary',
        },
      ],
      ownerTitle: 'Owner workspace',
      ownerModules: [
        'Overview',
        'Staff',
        'Tips',
        'Reviews',
        'Transactions',
        'Touchpoints',
        'AI / Booking Hub',
        'Gift Card Center',
        'Analytics',
        'Settings',
        'Subscriptions',
        'Support',
      ],
      staffTitle: 'Staff workspace',
      staffModules: [
        'Home',
        'My QR',
        'Tips',
        'Reviews',
        'Pay',
        'Payments',
        'Earnings',
        'My salons',
        'Profile',
        'Notifications',
      ],
    },
    orchestration: {
      tag: '04 · AI orchestration method',
      title: 'Do not prompt a screen. Prompt a system\u00A0contract.',
      description:
        'The source shows that NEXORA is more than UI. Route guards, repository/data-hook boundaries, design tokens, localization and build modes translate product decisions into constraints the AI Builder must follow.',
      steps: [
        {
          title: 'Map first',
          description:
            'Define roles, routes, entry points, tasks and dependencies before generating components.',
        },
        {
          title: 'Module contract',
          description:
            'Each feature has explicit components, hooks, repositories, domain types and API mapping.',
        },
        {
          title: 'State coverage',
          description:
            'Happy path is insufficient; every flow needs loading, empty, error, guards and recovery.',
        },
        {
          title: 'Reusable system',
          description:
            'Reuse patterns for dashboards, lists, details, modals, payments and statuses.',
        },
        {
          title: 'Implementation guardrails',
          description:
            'Token lint, TypeScript, environment builds and CI rules limit implementation drift.',
        },
      ],
      dataBoundaryTitle: 'Data boundary in the source',
      dataBoundary:
        'Component → data hook → repository → adapter/API. This structure keeps the UI from guessing contracts and isolates API changes from the presentation layer.',
    },
    lab: {
      tag: '05 · Interactive state lab',
      title: 'Designing the moments between\u00A0screens',
      description:
        'The payment flow is a small example of the larger NEXORA principle: each state must explain what the system is doing, what data remains preserved and how users can recover.',
      select: 'Select a state',
      preview: 'Customer Tip flow preview',
      interactive: 'Interactive',
      behaviorsTitle: 'Covered system behaviors',
      behaviors: ['Loading', 'Error & guards', 'Empty state', 'Toast', 'Tooltip'],
      states: {
        amount: {
          label: 'Amount',
          eyebrow: '01 · Input',
          description:
            'Suggested amounts reduce effort while a custom amount keeps the flow flexible.',
        },
        method: {
          label: 'Method',
          eyebrow: '02 · Decision',
          description:
            'The total remains in context while the customer selects a familiar payment method.',
        },
        processing: {
          label: 'Processing',
          eyebrow: '03 · Feedback',
          description:
            'A focused waiting state prevents duplicate actions and explains what is being confirmed.',
        },
        success: {
          label: 'Success',
          eyebrow: '04 · Resolution',
          description:
            'Confirmation closes the loop and states exactly where the tip is going.',
        },
        failure: {
          label: 'Failure',
          eyebrow: '05 · Recovery',
          description:
            'The amount is preserved and retry/change-method options prevent a dead end.',
        },
      },
      screen: {
        secure: 'Secure checkout',
        brand: 'NEXORA TOUCH',
        salon: 'Luxe Nail Spa',
        steps: ['Amount', 'Payment', 'Status'],
        amountEyebrow: 'Show your appreciation',
        amountTitle: 'Choose a tip amount',
        customAmount: 'Enter a custom amount',
        continue: 'Continue with $10',
        total: 'Tip total',
        methodTitle: 'Choose how to pay',
        methods: ['Apple Pay', 'Credit or debit card', 'Cash App Pay'],
        processingTitle: 'Securing your tip',
        processingDesc:
          'Keep this window open. We’re confirming your $10.00 payment.',
        processingTime: 'Usually takes a few seconds',
        successEyebrow: 'Payment confirmed',
        successTitle: 'You made their day.',
        successDesc: 'Your $10.00 tip is on its way to Alex at Luxe Nail Spa.',
        done: 'Done',
        failureEyebrow: 'Payment not completed',
        failureTitle: 'Your tip is still saved.',
        failureDesc:
          'No charge was made. Try again or choose another payment method.',
        changeMethod: 'Change method',
        retry: 'Try again',
      },
    },
    decisions: {
      tag: '06 · Key product decisions',
      title: 'Design decisions and trade‑offs',
      cards: [
        {
          number: '01',
          eyebrow: 'Role-aware architecture',
          title: 'Separate workspaces, shared data\u00A0model',
          problem:
            'When Owner, Staff and Customer share the same navigation and action hierarchy, responsibility becomes ambiguous.',
          decision:
            'Create distinct route shells and workspaces while sharing business, staff, payment and activity entities.',
          principle:
            'Separate experience by goal; connect data through the system.',
          tradeoff:
            'More routes and permission cases are required, but workflows become clearer and more extensible.',
          accent: 'text-violet-500',
          surface: 'border-violet-500/20 bg-violet-500/10',
        },
        {
          number: '02',
          eyebrow: 'State-first workflow',
          title: 'Design states before polishing\u00A0UI',
          problem:
            'AI frequently generates a polished happy path while omitting loading, empty, failure and recovery.',
          decision:
            'Every flow defines its state contract and valid CTAs before presentation is refined.',
          principle:
            'A trustworthy product is built in the moments between screens.',
          tradeoff:
            'State matrices take more planning time but reduce dead ends and implementation guesswork.',
          accent: 'text-amber-500',
          surface: 'border-amber-500/20 bg-amber-500/10',
        },
        {
          number: '03',
          eyebrow: 'Data-boundary discipline',
          title: 'The UI does not guess the\u00A0API',
          problem:
            'When components call APIs directly, contract changes spread and AI creates duplicate logic.',
          decision:
            'Maintain the component → hook → repository → adapter/domain chain.',
          principle:
            'Presentation expresses decisions; the data layer owns the contract.',
          tradeoff:
            'There are more layers, but change is isolated and verifiable.',
          accent: 'text-cyan-500',
          surface: 'border-cyan-500/20 bg-cyan-500/10',
        },
        {
          number: '04',
          eyebrow: 'AI with guardrails',
          title: 'Accelerate without delegating\u00A0architecture',
          problem:
            'AI produces code quickly but can hardcode tokens, break consistency or ignore environment and API rules.',
          decision:
            'Put design tokens, lint scripts, type checks, build modes and story/API mapping into the workflow.',
          principle:
            'AI is free to build inside an explicit contract.',
          tradeoff:
            'Rules and documentation require maintenance, but speed does not erase system quality.',
          accent: 'text-emerald-500',
          surface: 'border-emerald-500/20 bg-emerald-500/10',
        },
      ] as Decision[],
    },
    evidence: {
      tag: '07 · Implementation evidence',
      title: 'Source evidence—not decorative\u00A0numbers',
      description:
        'The values below were checked directly in the `vlink-nexora-fe` archive. They describe implementation scale and content coverage, not business outcomes.',
      metrics: [
        {
          value: '56',
          label: 'Route declarations',
          description:
            'Public, onboarding, Owner dashboard and Staff dashboard.',
        },
        {
          value: '235',
          label: 'TSX component files',
          description:
            'Features, layouts, modals, views and shared UI in `src/components`.',
        },
        {
          value: '461',
          label: 'TS / TSX source files',
          description:
            'Presentation, data hooks, repositories, domain and utilities.',
        },
        {
          value: '3.6k+',
          label: 'Locale leaf keys / language',
          description:
            '3,674 EN and 3,669 VI keys in the inspected archive.',
        },
      ],
      imageTag: 'Evidence · Dashboard implementation',
      imageAlt:
        'Nexora dashboard image preserved from the current case study',
      figmaButton: 'Explore the Product Map in Figma',
      sourceTitle: 'What the source verifies',
      sourceItems: [
        'React + Vite + TypeScript and React Router.',
        'Owner, Staff and public Customer route groups.',
        'Dashboard, staff, tips, reviews, transactions, touchpoints, booking, analytics and settings.',
        'Tokenized Tailwind theme and bilingual localization.',
        'Data hooks/repositories and multi-environment build configuration.',
      ],
    },
    validation: {
      tag: '08 · Validation boundary',
      title: 'Separate delivery evidence from user\u00A0impact',
      description:
        'The source archive proves that a large connected system was structured and implemented. It does not by itself prove faster task completion or increased revenue.',
      validatedTitle: 'Supported claims',
      validated: [
        'The architecture has three roles with separate route guards.',
        'Product modules are connected within one codebase.',
        'The payment prototype covers amount, method, processing, success and failure.',
        'The system has bilingual content and design tokens.',
      ],
      missingTitle: 'Not evidenced in the source',
      missing: [
        'Research sample size and methodology.',
        'Task success, time-on-task and error rate.',
        'Conversion from QR to tip/payment/booking.',
        'Retention, revenue or support-ticket reduction.',
      ],
      planTitle: 'Recommended measurement plan',
      plan: [
        'Activation: onboarding completion and first touchpoint created.',
        'Customer funnel: QR open → action selected → payment/review completed.',
        'Staff funnel: invite → join → payout configured → first earning.',
        'Booking funnel: landing → service selected → booking completed.',
        'Operational quality: support reason, failed payment and recovery success.',
      ],
    },
    retrospective: {
      tag: '09 · Retrospective',
      title: 'What NEXORA\u00A0demonstrates',
      learningsTitle: 'Learnings',
      learnings: [
        'UI generation speed does not replace product architecture.',
        'Roles, routes and states must be designed as one connected system.',
        'AI performs best with small, explicit and testable module contracts.',
        'A codebase becomes design evidence when UX decisions are encoded into routes, states and data boundaries.',
      ],
      nextTitle: 'Next\u00A0steps',
      next: [
        'Add a research log, participant profiles and insight traceability.',
        'Run usability tests for Owner, Staff and Customer workflows.',
        'Instrument product analytics around activation and cross-role handoffs.',
        'Expand automated coverage to match the route and component scale.',
      ],
      takeawayTitle: 'Takeaway',
      takeaway:
        'NEXORA is not merely a collection of AI-generated screens. Its core value is turning AI speed into a structured workflow where humans remain responsible for logic, states, data and experience quality.',
      nextProject: 'Next project: VLINKPAY',
    },
  },
} satisfies Record<Language, unknown>;

const roleStyles: Record<
  RoleId,
  Pick<Journey, 'accent' | 'activeSurface' | 'softSurface'>
> = {
  merchant: {
    accent: 'text-violet-500',
    activeSurface:
      'border-violet-500 bg-violet-500 text-white shadow-violet-500/20',
    softSurface: 'border-violet-500/20 bg-violet-500/10',
  },
  staff: {
    accent: 'text-emerald-500',
    activeSurface:
      'border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/20',
    softSurface: 'border-emerald-500/20 bg-emerald-500/10',
  },
  customer: {
    accent: 'text-amber-500',
    activeSurface:
      'border-amber-500 bg-amber-500 text-white shadow-amber-500/20',
    softSurface: 'border-amber-500/20 bg-amber-500/10',
  },
};

const TouchPaymentScreen = ({
  activeState,
  copy,
}: {
  activeState: PaymentStateId;
  copy: (typeof content.vi)['lab']['screen'];
}) => {
  const activeStep =
    activeState === 'amount' ? 0 : activeState === 'method' ? 1 : 2;

  return (
    <div className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#f7f7fb] text-slate-900 shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5b45f6] text-sm font-black text-white">
            N
          </span>
          <div>
            <p className="text-[10px] font-black tracking-[0.18em] text-slate-900">
              {copy.brand}
            </p>
            <p className="text-[10px] text-slate-500">{copy.salon}</p>
          </div>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500">
          {copy.secure}
        </span>
      </div>

      <div className="px-5 pb-6 pt-5 sm:px-7">
        <div className="mb-6 flex items-start justify-between">
          {copy.steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex min-w-14 flex-col items-center gap-2 text-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-colors ${
                    index <= activeStep
                      ? 'bg-[#5b45f6] text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {index < activeStep ? '✓' : index + 1}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    index <= activeStep
                      ? 'text-[#5b45f6]'
                      : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < 2 && (
                <span
                  className={`mt-3.5 h-px flex-1 ${
                    index < activeStep ? 'bg-[#5b45f6]' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeState}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="min-h-[330px]"
          >
            {activeState === 'amount' && (
              <div>
                <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-[#5b45f6]">
                  {copy.amountEyebrow}
                </p>
                <h5 className="mb-6 text-center text-2xl font-black tracking-tight">
                  {copy.amountTitle}
                </h5>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {['$5', '$10', '$20'].map((amount, index) => (
                    <button
                      key={amount}
                      type="button"
                      className={`rounded-2xl border px-3 py-5 text-lg font-black transition-transform hover:-translate-y-0.5 ${
                        index === 1
                          ? 'border-[#5b45f6] bg-[#5b45f6] text-white shadow-lg shadow-violet-500/20'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="mb-6 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600"
                >
                  {copy.customAmount}
                </button>
                <button
                  type="button"
                  className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white"
                >
                  {copy.continue}
                </button>
              </div>
            )}

            {activeState === 'method' && (
              <div>
                <div className="mb-6 rounded-2xl bg-violet-50 p-4 text-center">
                  <p className="text-xs font-bold text-violet-600">
                    {copy.total}
                  </p>
                  <p className="mt-1 text-3xl font-black text-slate-950">
                    $10.00
                  </p>
                </div>
                <h5 className="mb-4 text-xl font-black tracking-tight">
                  {copy.methodTitle}
                </h5>
                <div className="space-y-3">
                  {copy.methods.map((method, index) => (
                    <button
                      key={method}
                      type="button"
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-sm font-black ${
                        index === 0
                          ? 'border-slate-900 bg-slate-950 text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {method}
                      <span aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeState === 'processing' && (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <StateGlyph state="processing" />
                <h5 className="mt-6 text-2xl font-black tracking-tight">
                  {copy.processingTitle}
                </h5>
                <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-slate-500">
                  {copy.processingDesc}
                </p>
                <div className="mt-8 flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-[11px] font-bold text-slate-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
                  {copy.processingTime}
                </div>
              </div>
            )}

            {activeState === 'success' && (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <StateGlyph state="success" />
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
                  {copy.successEyebrow}
                </p>
                <h5 className="mt-2 text-2xl font-black tracking-tight">
                  {copy.successTitle}
                </h5>
                <p className="mt-3 max-w-[290px] text-sm leading-relaxed text-slate-500">
                  {copy.successDesc}
                </p>
                <button
                  type="button"
                  className="mt-7 rounded-2xl bg-slate-950 px-7 py-3 text-sm font-black text-white"
                >
                  {copy.done}
                </button>
              </div>
            )}

            {activeState === 'failure' && (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <StateGlyph state="failure" />
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-rose-600">
                  {copy.failureEyebrow}
                </p>
                <h5 className="mt-2 text-2xl font-black tracking-tight">
                  {copy.failureTitle}
                </h5>
                <p className="mt-3 max-w-[290px] text-sm leading-relaxed text-slate-500">
                  {copy.failureDesc}
                </p>
                <div className="mt-7 flex w-full gap-3">
                  <button
                    type="button"
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700"
                  >
                    {copy.changeMethod}
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
                  >
                    {copy.retry}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export const ProjectNexora: React.FC = () => {
  const { isLightMode, language } = useStore();
  const reduceMotion = useReducedMotion();
  const [activeRole, setActiveRole] = useState<RoleId>('merchant');
  const [activePaymentState, setActivePaymentState] =
    useState<PaymentStateId>('amount');
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(
    scrollY,
    [0, 360],
    reduceMotion ? [1, 1] : [1, 0],
  );

  const copy = content[language as Language];

  const journeys = useMemo<Journey[]>(
    () =>
      (['merchant', 'staff', 'customer'] as RoleId[]).map((id) => ({
        id,
        ...copy.roles.labels[id],
        ...roleStyles[id],
      })),
    [copy],
  );

  const activeJourney =
    journeys.find((journey) => journey.id === activeRole) ?? journeys[0];

  const paymentStates = useMemo(
    () =>
      ([
        'amount',
        'method',
        'processing',
        'success',
        'failure',
      ] as PaymentStateId[]).map((id) => ({
        id,
        ...copy.lab.states[id],
      })),
    [copy],
  );

  const theme = {
    text: isLightMode ? 'text-slate-900' : 'text-white',
    textMuted: isLightMode ? 'text-slate-600' : 'text-slate-400',
    card: isLightMode
      ? 'border-slate-200 bg-white/90 shadow-sm'
      : 'border-white/10 bg-slate-900/55',
    divider: isLightMode ? 'border-slate-200' : 'border-white/10',
    soft: isLightMode ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.04]',
  };

  const reveal = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.62,
        ease: 'easeOut',
      },
    },
  } as const;

  return (
    <CaseStudyLayout>
      {/* 00 · HERO */}
      <motion.section 
        initial="hidden" 
        animate="visible" 
        variants={reveal} 
        className="container mx-auto px-4 md:px-8 lg:px-12 mb-20 md:mb-32"
      >
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">

          <motion.div style={{ opacity: heroOpacity }} className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 border border-violet-500/30 rounded-full px-4 py-1.5 mb-8 bg-violet-500/10">
              <PlusIcon className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-violet-300">
                {copy.hero.badge}
              </span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-[4.5rem] font-black mb-6 leading-[1.05] tracking-tight ${theme.text}`}>
              {copy.hero.title1} <br />
              {copy.hero.title2 && <>{copy.hero.title2} <br /></>}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
                {copy.hero.titleHighlight}
              </span>
            </h1>
            
            <p className={`text-lg md:text-xl leading-relaxed mb-10 ${theme.textMuted} max-w-2xl`}>
              {copy.hero.description}
            </p>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4 mb-10">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full border ${theme.card}`}>
                  <StoreIcon className={`w-5 h-5 ${theme.textMuted}`} />
                </div>
                <div>
                  <div className={`font-bold text-sm ${theme.text}`}>{copy.hero.roles[0].label}</div>
                  <div className={`text-xs ${theme.textMuted}`}>{copy.hero.roles[0].title}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full border ${theme.card}`}>
                  <UsersIcon className={`w-5 h-5 ${theme.textMuted}`} />
                </div>
                <div>
                  <div className={`font-bold text-sm ${theme.text}`}>{copy.hero.roles[1].label}</div>
                  <div className={`text-xs ${theme.textMuted}`}>{copy.hero.roles[1].title}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full border ${theme.card}`}>
                  <UserIcon className={`w-5 h-5 ${theme.textMuted}`} />
                </div>
                <div>
                  <div className={`font-bold text-sm ${theme.text}`}>{copy.hero.roles[2].label}</div>
                  <div className={`text-xs ${theme.textMuted}`}>{copy.hero.roles[2].title}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {copy.hero.stats.map((stat, idx) => (
                <div key={idx} className={`flex flex-col rounded-2xl border p-3 ${theme.card}`}>
                  <div className="mb-2">
                    {stat.icon === 'Flow' && <FlowIcon className="w-6 h-6 text-violet-400 opacity-70" />}
                    {stat.icon === 'Code' && <CodeIcon className="w-6 h-6 text-violet-400 opacity-70" />}
                    {stat.icon === 'Layers' && <LayersIcon className="w-6 h-6 text-violet-400 opacity-70" />}
                    {stat.icon === 'Globe' && <GlobeIcon className="w-6 h-6 text-violet-400 opacity-70" />}
                  </div>
                  <div>
                    <div className={`text-2xl font-black mb-0.5 tracking-tight ${theme.text}`}>{stat.value}</div>
                    <div className={`text-[11px] font-medium leading-snug whitespace-pre-line ${theme.textMuted}`}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className="w-full inline-flex justify-center items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 px-5 rounded-xl transition-colors text-sm shadow-lg shadow-violet-500/20">
                <FigmaIcon className="w-4 h-4" /> {copy.hero.ctaFigma} <ExternalLinkIcon className="w-4 h-4 opacity-50" />
              </a>
            </div>
          </motion.div>

          <div className="flex-1 w-full relative md:sticky md:top-24">
            <div className="absolute inset-0 bg-violet-500 rounded-3xl blur-3xl opacity-20" />
            <ZoomableImage 
              src="/images/case-study/nexora_hero_916.jpg" 
              alt={copy.hero.mockupAlt} 
              className="relative z-10 w-full rounded-3xl shadow-2xl object-cover border border-slate-200/20" 
            />
          </div>
          
        </div>
      </motion.section>

      <div className="container mx-auto pb-20 md:pb-32">
        {/* 01 · SNAPSHOT */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <header className="lg:col-span-5 lg:pr-6">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-violet-500">
                {copy.snapshot.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl lg:text-4xl xl:text-5xl ${theme.text}`}
              >
                {copy.snapshot.title}
              </h2>
            </header>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {copy.snapshot.items.map(([label, value]) => (
                  <article
                    key={label}
                    className={`rounded-2xl border p-5 ${theme.card}`}
                  >
                    <p
                      className={`text-[10px] font-black uppercase tracking-[0.14em] ${theme.textMuted}`}
                    >
                      {label}
                    </p>
                    <p className={`mt-2 text-sm font-bold ${theme.text}`}>
                      {value}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <article className={`rounded-3xl border p-7 ${theme.card}`}>
                  <FlowIcon className="h-7 w-7 text-rose-500" />
                  <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                    {copy.snapshot.problemTitle}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {copy.snapshot.problem}
                  </p>
                </article>

                <article className={`rounded-3xl border p-7 ${theme.card}`}>
                  <LayersIcon className="h-7 w-7 text-violet-500" />
                  <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                    {copy.snapshot.productTitle}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {copy.snapshot.product}
                  </p>
                </article>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <article
                  className={`rounded-3xl border p-7 ${theme.card}`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-500">
                    {copy.snapshot.contributionTitle}
                  </p>
                  <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                    {copy.snapshot.contribution.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>

                <aside
                  className={`rounded-3xl border p-7 ${
                    isLightMode
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-amber-500/20 bg-amber-500/10'
                  }`}
                >
                  <AlertTriangleIcon className="h-7 w-7 text-amber-500" />
                  <h3 className={`mt-5 text-lg font-black ${theme.text}`}>
                    {copy.snapshot.boundaryTitle}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {copy.snapshot.boundary}
                  </p>
                </aside>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 02 · ROLES */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
            <header className="lg:col-span-7">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-emerald-500">
                {copy.roles.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
              >
                {copy.roles.title}
              </h2>
            </header>
            <p className={`lg:col-span-5 ${theme.textMuted}`}>
              {copy.roles.description}
            </p>
          </div>

          <div
            className="grid gap-4 md:grid-cols-3"
            role="tablist"
            aria-label={
              language === 'vi'
                ? 'Các vai trò trong NEXORA'
                : 'NEXORA product roles'
            }
          >
            {journeys.map((journey) => {
              const isActive = activeRole === journey.id;

              return (
                <button
                  key={journey.id}
                  id={`nexora-role-tab-${journey.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`nexora-role-panel-${journey.id}`}
                  onClick={() => setActiveRole(journey.id)}
                  className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
                    isActive
                      ? `${journey.activeSurface} shadow-xl`
                      : `${theme.card} hover:-translate-y-1`
                  }`}
                >
                  <p
                    className={`text-xs font-black uppercase tracking-[0.16em] ${
                      isActive ? 'text-white/70' : journey.accent
                    }`}
                  >
                    {journey.label}
                  </p>
                  <h3
                    className={`mt-3 text-lg font-black ${
                      isActive ? 'text-white' : theme.text
                    }`}
                  >
                    {journey.title}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      isActive ? 'text-white/80' : theme.textMuted
                    }`}
                  >
                    {journey.need}
                  </p>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              id={`nexora-role-panel-${activeRole}`}
              role="tabpanel"
              aria-labelledby={`nexora-role-tab-${activeRole}`}
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
                    className={`text-xs font-black uppercase tracking-[0.16em] ${activeJourney.accent}`}
                  >
                    {copy.roles.journeyPrefix}
                    {activeJourney.label}
                  </p>
                  <h3 className={`mt-2 text-2xl font-black ${theme.text}`}>
                    {activeJourney.title}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${activeJourney.softSurface} ${activeJourney.accent}`}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  {activeJourney.outcome}
                </span>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
                {[
                  [
                    language === 'vi' ? 'Điểm vào' : 'Entry points',
                    activeJourney.entryPoints,
                  ],
                  [
                    language === 'vi' ? 'Workspace' : 'Workspace',
                    activeJourney.workspace,
                  ],
                  [
                    language === 'vi' ? 'Hành động' : 'Actions',
                    activeJourney.actions,
                  ],
                ].map(([title, items]) => (
                  <article
                    key={String(title)}
                    className={`rounded-2xl border p-5 ${theme.soft}`}
                  >
                    <p
                      className={`text-[10px] font-black uppercase tracking-[0.15em] ${activeJourney.accent}`}
                    >
                      {String(title)}
                    </p>
                    <ul className={`mt-4 space-y-3 text-sm ${theme.textMuted}`}>
                      {(items as readonly string[]).map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span
                            className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                              activeRole === 'merchant'
                                ? 'bg-violet-500'
                                : activeRole === 'staff'
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                            }`}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <aside className={`mt-6 rounded-3xl border p-6 ${theme.card}`}>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-500">
              {copy.roles.sharedTitle}
            </p>
            <p className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}>
              {copy.roles.sharedDescription}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {copy.roles.sharedModules.map((module) => (
                <span
                  key={module}
                  className={`rounded-full border px-3 py-2 text-[10px] font-bold ${theme.soft} ${theme.textMuted}`}
                >
                  {module}
                </span>
              ))}
            </div>
          </aside>
        </motion.section>

        {/* 03 · ARCHITECTURE */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <header className="mx-auto mb-12 max-w-4xl text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-cyan-500">
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

          <div className="hide-scrollbar flex items-stretch overflow-x-auto pb-3">
            {copy.architecture.stages.map((stage, index) => (
              <React.Fragment key={stage.number}>
                <article
                  className={`min-w-[230px] flex-1 rounded-3xl border p-6 ${theme.card}`}
                >
                  <span className="text-xs font-black text-cyan-500">
                    {stage.number}
                  </span>
                  <h3 className={`mt-4 text-xl font-black ${theme.text}`}>
                    {stage.title}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {stage.description}
                  </p>
                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.13em] text-cyan-500">
                    {stage.evidence}
                  </p>
                </article>
                {index < copy.architecture.stages.length - 1 && (
                  <ArrowRightIcon className="mx-3 h-5 w-5 shrink-0 self-center text-cyan-500" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <article className={`rounded-3xl border p-7 ${theme.card}`}>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-500">
                {copy.architecture.ownerTitle}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {copy.architecture.ownerModules.map((module) => (
                  <span
                    key={module}
                    className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-[10px] font-bold text-violet-500"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </article>

            <article className={`rounded-3xl border p-7 ${theme.card}`}>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-500">
                {copy.architecture.staffTitle}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {copy.architecture.staffModules.map((module) => (
                  <span
                    key={module}
                    className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold text-emerald-500"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </motion.section>

        {/* 04 · ORCHESTRATION */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <header className="lg:col-span-5 lg:pr-6">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-violet-500 leading-relaxed">
                {copy.orchestration.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl lg:text-4xl xl:text-5xl ${theme.text}`}
              >
                {copy.orchestration.title}
              </h2>
              <p className={`mt-5 text-base md:text-lg leading-relaxed ${theme.textMuted}`}>
                {copy.orchestration.description}
              </p>
            </header>

            <div className="lg:col-span-7">
              <div className="space-y-4">
                {copy.orchestration.steps.map((step, index) => (
                  <article
                    key={step.title}
                    className={`flex gap-5 rounded-3xl border p-6 ${theme.card}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-xs font-black text-violet-500">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className={`text-lg font-black ${theme.text}`}>
                        {step.title}
                      </h3>
                      <p
                        className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <aside
                className={`mt-5 rounded-3xl border p-7 ${
                  isLightMode
                    ? 'border-cyan-200 bg-cyan-50'
                    : 'border-cyan-500/20 bg-cyan-500/10'
                }`}
              >
                <CodeIcon className="h-7 w-7 text-cyan-500" />
                <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                  {copy.orchestration.dataBoundaryTitle}
                </h3>
                <p
                  className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}
                >
                  {copy.orchestration.dataBoundary}
                </p>
              </aside>
            </div>
          </div>
        </motion.section>

        {/* 05 · STATE LAB */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
            <header className="lg:col-span-7">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-violet-500">
                {copy.lab.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
              >
                {copy.lab.title}
              </h2>
            </header>
            <p
              className={`text-base leading-relaxed lg:col-span-5 ${theme.textMuted}`}
            >
              {copy.lab.description}
            </p>
          </div>

          <div
            className={`relative overflow-hidden rounded-[2rem] border p-4 sm:p-7 lg:p-9 ${
              isLightMode
                ? 'border-slate-200 bg-gradient-to-br from-white to-violet-50/60 shadow-2xl shadow-violet-200/40'
                : 'border-white/10 bg-gradient-to-br from-[#101022] to-[#090914] shadow-2xl shadow-black/30'
            }`}
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/15 blur-[90px]" />
            <div className="relative grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={`text-xs font-black uppercase tracking-[0.18em] ${theme.textMuted}`}
                    >
                      {copy.lab.select}
                    </p>
                    <p className={`mt-2 text-sm ${theme.textMuted}`}>
                      {copy.lab.preview}
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-500">
                    {copy.lab.interactive}
                  </span>
                </div>

                <div
                  className="mt-6 space-y-2"
                  role="tablist"
                  aria-label="Customer payment states"
                >
                  {paymentStates.map((state, index) => {
                    const isActive = state.id === activePaymentState;

                    return (
                      <button
                        key={state.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`${state.eyebrow}: ${state.label}`}
                        onClick={() => setActivePaymentState(state.id)}
                        className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                          isActive
                            ? 'border-violet-500 bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                            : isLightMode
                              ? 'border-slate-200 bg-white/80 hover:border-violet-300 hover:bg-white'
                              : 'border-white/10 bg-white/[0.04] hover:border-violet-500/40 hover:bg-white/[0.07]'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                            isActive
                              ? 'bg-white/15 text-white'
                              : 'bg-violet-500/10 text-violet-500'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-[11px] font-black uppercase tracking-[0.16em] ${
                              isActive ? 'text-violet-100' : theme.textMuted
                            }`}
                          >
                            {state.eyebrow}
                          </span>
                          <span
                            className={`mt-1 block text-sm font-black ${
                              isActive ? 'text-white' : theme.text
                            }`}
                          >
                            {state.label}
                          </span>
                        </span>
                        <ArrowRightIcon
                          className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                            isActive ? 'text-white' : 'text-violet-500'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={activePaymentState}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    className={`mt-5 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {
                      paymentStates.find(
                        (state) => state.id === activePaymentState,
                      )?.description
                    }
                  </motion.p>
                </AnimatePresence>

                <div
                  className={`mt-6 border-t pt-5 ${theme.divider}`}
                >
                  <p
                    className={`mb-3 text-[10px] font-black uppercase tracking-[0.16em] ${theme.textMuted}`}
                  >
                    {copy.lab.behaviorsTitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {copy.lab.behaviors.map((behavior) => (
                      <span
                        key={behavior}
                        className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${theme.soft} ${theme.textMuted}`}
                      >
                        {behavior}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center lg:col-span-7">
                <TouchPaymentScreen
                  activeState={activePaymentState}
                  copy={copy.lab.screen}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 06 · DECISIONS */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <header className="mb-12 text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-amber-500">
              {copy.decisions.tag}
            </p>
            <h2
              className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
            >
              {copy.decisions.title}
            </h2>
          </header>

          <div className="space-y-5">
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
                      className={`rounded-2xl border p-5 ${theme.soft}`}
                    >
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.14em] ${decision.accent}`}
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

        {/* 07 · EVIDENCE */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <header className="lg:col-span-5 lg:pr-6">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-cyan-500">
                {copy.evidence.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl lg:text-4xl xl:text-5xl ${theme.text}`}
              >
                {copy.evidence.title}
              </h2>
              <p className={`mt-5 text-base md:text-lg leading-relaxed ${theme.textMuted}`}>
                {copy.evidence.description}
              </p>
            </header>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {copy.evidence.metrics.map((metric) => (
                  <article
                    key={metric.label}
                    className={`rounded-3xl border p-5 ${theme.card}`}
                  >
                    <p className="text-3xl font-black tracking-tight text-violet-500 md:text-4xl">
                      {metric.value}
                    </p>
                    <p
                      className={`mt-4 text-xs font-black uppercase tracking-[0.12em] ${theme.text}`}
                    >
                      {metric.label}
                    </p>
                    <p
                      className={`mt-2 text-[11px] leading-relaxed ${theme.textMuted}`}
                    >
                      {metric.description}
                    </p>
                  </article>
                ))}
              </div>

              <figure
                className={`mt-5 overflow-hidden rounded-[2rem] border shadow-2xl ${theme.card}`}
              >
                <div
                  className={`flex items-center gap-2 border-b px-5 py-3 ${theme.divider}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <figcaption
                    className={`ml-3 text-[10px] font-bold ${theme.textMuted}`}
                  >
                    {copy.evidence.imageTag}
                  </figcaption>
                </div>
                <img
                  loading="lazy"
                  decoding="async"
                  src="/images/case-study/nexora_hero.png"
                  alt={copy.evidence.imageAlt}
                  className="aspect-[16/9] w-full object-cover object-top"
                />
              </figure>

              <div className="mt-5 grid gap-5 md:grid-cols-5">
                <article
                  className={`rounded-3xl border p-7 md:col-span-3 ${theme.card}`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-500">
                    {copy.evidence.sourceTitle}
                  </p>
                  <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                    {copy.evidence.sourceItems.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>

                <div
                  className={`flex flex-col items-center justify-center rounded-3xl border p-7 text-center md:col-span-2 ${theme.card}`}
                >
                  <FigmaIcon className="h-9 w-9 text-violet-500" />
                  <a
                    href={FIGMA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition-transform hover:scale-105"
                  >
                    {copy.evidence.figmaButton}
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 08 · VALIDATION */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <header className="mx-auto mb-12 max-w-4xl text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-rose-500">
              {copy.validation.tag}
            </p>
            <h2
              className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
            >
              {copy.validation.title}
            </h2>
            <p className={`mt-5 leading-relaxed ${theme.textMuted}`}>
              {copy.validation.description}
            </p>
          </header>

          <div className="grid gap-5 md:grid-cols-3">
            <article
              className={`rounded-3xl border p-7 ${
                isLightMode
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-emerald-500/20 bg-emerald-500/10'
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-500">
                {copy.validation.validatedTitle}
              </p>
              <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                {copy.validation.validated.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article
              className={`rounded-3xl border p-7 ${
                isLightMode
                  ? 'border-rose-200 bg-rose-50'
                  : 'border-rose-500/20 bg-rose-500/10'
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">
                {copy.validation.missingTitle}
              </p>
              <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                {copy.validation.missing.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className={`rounded-3xl border p-7 ${theme.card}`}>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-500">
                {copy.validation.planTitle}
              </p>
              <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                {copy.validation.plan.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ArrowRightIcon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </motion.section>

        {/* 09 · RETROSPECTIVE */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <header className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-violet-500">
              {copy.retrospective.tag}
            </p>
            <h2
              className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
            >
              {copy.retrospective.title}
            </h2>
          </header>

          <div className="grid gap-5 md:grid-cols-2">
            <article className={`rounded-3xl border p-7 ${theme.card}`}>
              <ShieldCheckIcon className="h-7 w-7 text-violet-500" />
              <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                {copy.retrospective.learningsTitle}
              </h3>
              <ul className={`mt-5 space-y-4 text-sm ${theme.textMuted}`}>
                {copy.retrospective.learnings.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className={`rounded-3xl border p-7 ${theme.card}`}>
              <ArrowRightIcon className="h-7 w-7 text-amber-500" />
              <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                {copy.retrospective.nextTitle}
              </h3>
              <ul className={`mt-5 space-y-4 text-sm ${theme.textMuted}`}>
                {copy.retrospective.next.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ArrowRightIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <aside
            className={`mt-6 rounded-3xl border-l-4 border-violet-500 p-7 md:p-9 ${
              isLightMode ? 'bg-violet-50/80' : 'bg-violet-500/10'
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-500">
              {copy.retrospective.takeawayTitle}
            </p>
            <p
              className={`mt-4 text-lg font-medium leading-relaxed ${theme.text}`}
            >
              “{copy.retrospective.takeaway}”
            </p>
          </aside>


        </motion.section>
      </div>
    </CaseStudyLayout>
  );
};
