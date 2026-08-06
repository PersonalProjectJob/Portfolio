import React, { useMemo, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';

type Language = 'vi' | 'en';
type JourneyRole = 'customer' | 'partner';

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
  'https://www.figma.com/design/upTvpWOIHNFC8Vzqf4AJ3f/Program-Hub--Copy-?node-id=52-11225';

const CreditCardIcon = ({ className }: { className?: string }) => (
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
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
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
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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

const FileCheckIcon = ({ className }: { className?: string }) => (
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
    <path d="m9 15 2 2 4-4" />
  </svg>
);

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

const content = {
  vi: {
    hero: {
      tag: 'VLINKPAY · Fintech transaction case study',
      title: 'Minh bạch',
      highlight: 'dòng tiền\u00A0P2P',
      description:
        'Thiết kế trải nghiệm đổi tiền qua Merchant/ATM với mục tiêu giúp người dùng luôn hiểu số tiền, phí, trạng thái giao dịch, trách nhiệm của từng bên và hành động tiếp theo.',
      proof: [
        'Customer ↔ Merchant/ATM',
        'State-driven transaction',
        'Trust & dispute ready',
      ],
      mockupTag: 'Bằng chứng · Hệ sinh thái VLINKPAY',
      mockupAlt:
        'Mockup giao diện VLINKPAY thể hiện hệ sinh thái ví và giao dịch tài chính số',
    },
    snapshot: {
      tag: '01 · Project snapshot',
      title: 'UX tài chính không chỉ cần nhanh — nó phải giải thích được tiền đang ở\u00A0đâu',
      items: [
        ['Vai trò', 'Product Designer'],
        ['Nền tảng', 'Mobile-first Web App'],
        ['Lĩnh vực', 'Digital Wallet & P2P Exchange'],
        ['Trọng tâm', 'Trust, fees & transaction states'],
      ],
      userProblemTitle: 'Bài toán người\u00A0dùng',
      userProblem:
        'Trong giao dịch P2P, người dùng phải ra quyết định khi tiền, phí và trách nhiệm được chia giữa hệ thống với Merchant/ATM. Chỉ một trạng thái hoặc CTA không rõ cũng có thể khiến họ nghĩ tiền đã mất hoặc giao dịch đã hoàn tất sai thời điểm.',
      productProblemTitle: 'Bài toán sản\u00A0phẩm',
      productProblem:
        'Thiết kế một flow đủ đơn giản cho người dùng phổ thông nhưng vẫn thể hiện chính xác logic tài chính, điều kiện xác minh, thời gian chờ, bằng chứng thanh toán, hủy và tranh chấp.',
      contributionTitle: 'Phạm vi tôi phụ\u00A0trách',
      contribution: [
        'Phân tích logic giao dịch và tách hành động theo Customer và Merchant/ATM.',
        'Thiết kế journey, information hierarchy, fee breakdown và transaction state model.',
        'Chuẩn hóa nội dung trạng thái, CTA, confirmation, QR/OTP và proof handling.',
        'Phối hợp với Product/Engineering để giảm mơ hồ khi bàn giao các rule liên quan đến tiền.',
      ],
      boundaryTitle: 'Ranh giới bằng\u00A0chứng',
      boundary:
        'Source hiện tại có mockup và link Figma nhưng không cung cấp số lượng người test, conversion hay business metric sau launch. Case study này chỉ trình bày phạm vi thiết kế và logic sản phẩm đã được xác định, không gán impact chưa đo.',
    },
    trust: {
      tag: '02 · Trust model',
      title: 'Ba câu hỏi phải được trả lời ở mọi\u00A0bước',
      description:
        'Trong một flow tài chính, người dùng không chỉ cần biết “bấm gì”. Họ cần hiểu giá trị đang dịch chuyển, ai đang chịu trách nhiệm và hệ thống đang chờ điều kiện nào.',
      pillars: [
        {
          icon: 'money',
          title: 'Tiền',
          question: 'Tôi trả bao nhiêu và nhận bao nhiêu?',
          details: [
            'Số tiền yêu cầu',
            'System fee',
            'Merchant/ATM fee',
            'Insurance hoặc khoản bảo vệ',
            'Tổng thanh toán / tổng nhận',
          ],
        },
        {
          icon: 'state',
          title: 'Trạng thái',
          question: 'Giao dịch đang ở bước nào?',
          details: [
            'Đang chờ xác nhận',
            'Đã được tiếp nhận',
            'Đang chờ thanh toán',
            'Đã tải bằng chứng',
            'Hoàn tất / Hủy / Tranh chấp',
          ],
        },
        {
          icon: 'responsibility',
          title: 'Trách nhiệm',
          question: 'Ai cần hành động tiếp theo?',
          details: [
            'Customer xác nhận hoặc thanh toán',
            'Merchant/ATM tiếp nhận yêu cầu',
            'Hai bên xác minh QR/OTP',
            'Hệ thống cập nhật timeout và trạng thái',
            'Support xử lý dispute khi cần',
          ],
        },
      ],
    },
    journey: {
      tag: '03 · Transaction architecture',
      title: 'Một giao dịch, hai hành trình đồng\u00A0bộ',
      description:
        'Customer và Merchant/ATM nhìn cùng một giao dịch nhưng có mục tiêu, thông tin ưu tiên và CTA khác nhau. State machine là nguồn sự thật chung giữa hai phía.',
      roleLabels: {
        customer: 'Hành trình Customer',
        partner: 'Hành trình Merchant/ATM',
        system: 'Hệ thống',
      },
      roleDescriptions: {
        customer:
          'Tạo yêu cầu, hiểu phí, chọn đối tác, xác nhận đã thanh toán và nhận kết quả.',
        partner:
          'Nhận yêu cầu, đánh giá khả năng xử lý, xác minh giao dịch và hoàn tất bàn giao.',
      },
      steps: [
        {
          number: '01',
          state: 'Request created',
          customer: 'Nhập số tiền và chọn Buy/Sell.',
          partner: 'Chưa nhận hành động.',
          system: 'Kiểm tra giới hạn, điều kiện tài khoản và fee rule.',
        },
        {
          number: '02',
          state: 'Review & matching',
          customer: 'Xem breakdown phí và chọn Merchant/ATM phù hợp.',
          partner: 'Xuất hiện trong danh sách theo phạm vi và khả năng xử lý.',
          system: 'Tính tổng tiền, hiển thị rating, fee và khoảng cách/ETA.',
        },
        {
          number: '03',
          state: 'Waiting acceptance',
          customer: 'Theo dõi countdown và có thể hủy khi còn hợp lệ.',
          partner: 'Accept hoặc Decline yêu cầu.',
          system: 'Khóa điều kiện giao dịch và đồng bộ trạng thái hai phía.',
        },
        {
          number: '04',
          state: 'Payment & verification',
          customer: 'Thực hiện thanh toán hoặc giao tiền, sau đó xác nhận.',
          partner: 'Xác minh QR/secure code/OTP và số tiền nhận.',
          system: 'Ghi nhận bằng chứng, timeout và bước xác minh.',
        },
        {
          number: '05',
          state: 'Completion',
          customer: 'Nhận xác nhận hoàn tất và biên nhận.',
          partner: 'Xác nhận đã bàn giao đủ tiền/tài sản.',
          system: 'Chốt trạng thái, transaction ID và lịch sử.',
        },
        {
          number: '06',
          state: 'Exception handling',
          customer: 'Tải bằng chứng và mở dispute nếu có sai lệch.',
          partner: 'Cung cấp bằng chứng đối ứng.',
          system: 'Giữ toàn bộ audit trail cho quá trình review.',
        },
      ],
      sourceTitle: 'Source of truth',
      sourceDescription:
        'CTA không được quyết định theo tên màn hình. Mỗi CTA phải được xác định từ transaction state, role, timeout và điều kiện đã hoàn tất.',
    },
    decisions: {
      tag: '04 · Key product decisions',
      title: 'Quyết định thiết kế và đánh\u00A0đổi',
      cards: [
        {
          number: '01',
          eyebrow: 'Separate responsibilities',
          title: 'Tách rõ hành động của Customer và\u00A0Merchant/ATM',
          problem:
            'Nếu hai phía dùng cùng wording và cùng CTA, người dùng dễ thực hiện hành động thuộc trách nhiệm của bên còn lại.',
          decision:
            'Mỗi role nhận một action lane riêng, nhưng cùng tham chiếu một transaction state và transaction ID.',
          principle:
            'Hệ thống phải nói rõ “ai đang chờ ai”, không chỉ nói “đang xử lý”.',
          tradeoff:
            'Cần nhiều state copy và QA matrix hơn, đổi lại giảm nhầm lẫn liên quan đến tiền.',
          accent: 'text-sky-500',
          surface: 'border-sky-500/20 bg-sky-500/10',
        },
        {
          number: '02',
          eyebrow: 'Fee transparency',
          title: 'Hiển thị phí trước khi người dùng cam\u00A0kết',
          problem:
            'Một con số tổng không giải thích được tiền được phân bổ cho hệ thống, đối tác hay khoản bảo vệ.',
          decision:
            'Tách amount, system fee, partner fee, insurance và final total trong review details.',
          principle:
            'Không để người dùng khám phá chi phí sau khi đã tạo giao dịch.',
          tradeoff:
            'Màn review có nhiều dữ liệu hơn, nhưng đổi lại người dùng kiểm soát quyết định tốt hơn.',
          accent: 'text-orange-500',
          surface: 'border-orange-500/20 bg-orange-500/10',
        },
        {
          number: '03',
          eyebrow: 'State-driven guidance',
          title: 'Mỗi trạng thái chỉ có một hành động\u00A0chính',
          problem:
            'Nhiều CTA cùng độ ưu tiên trong flow có timeout khiến người dùng không biết bước nào ảnh hưởng trực tiếp đến tiền.',
          decision:
            'Một primary CTA theo state; cancel, proof và support được đặt theo mức độ rủi ro.',
          principle:
            'Ưu tiên hành động giúp giao dịch tiến tới trạng thái an toàn kế tiếp.',
          tradeoff:
            'Một số chức năng ít dùng phải nằm sâu hơn để bảo vệ độ rõ của flow chính.',
          accent: 'text-emerald-500',
          surface: 'border-emerald-500/20 bg-emerald-500/10',
        },
        {
          number: '04',
          eyebrow: 'Exception-ready design',
          title: 'Thiết kế tranh chấp từ đầu, không vá sau\u00A0launch',
          problem:
            'Giao dịch P2P có thể sai lệch do thanh toán chậm, bằng chứng thiếu hoặc hai bên xác nhận khác nhau.',
          decision:
            'Tích hợp proof upload, note, timestamp, status history và dispute entry point vào transaction detail.',
          principle:
            'Trust không đến từ việc không có lỗi; trust đến từ việc lỗi có thể được truy vết và xử lý.',
          tradeoff:
            'Tăng độ phức tạp dữ liệu và vận hành, đổi lại hệ thống có khả năng giải quyết ngoại lệ.',
          accent: 'text-rose-500',
          surface: 'border-rose-500/20 bg-rose-500/10',
        },
      ] as Decision[],
    },
    evidence: {
      tag: '05 · Design evidence',
      title: 'Bằng chứng hiện có trong\u00A0source',
      description:
        'Trang portfolio hiện có một mockup tổng quan và link Figma. Vì vậy phần này trình bày rõ đó là design evidence, không gọi là usability result hoặc production impact.',
      mockupTag: 'VLINKPAY product ecosystem mockup',
      mockupAlt:
        'Mockup tổng quan sản phẩm VLINKPAY được giữ nguyên từ source hiện tại',
      figmaButton: 'Mở file Figma',
      annotations: [
        {
          title: 'Wallet & assets',
          description:
            'Điểm bắt đầu để người dùng hiểu tài sản và lịch sử hoạt động.',
        },
        {
          title: 'Transaction clarity',
          description:
            'Các flow cần liên kết số tiền, phí, trạng thái và bước tiếp theo.',
        },
        {
          title: 'Role-aware operations',
          description:
            'Customer và Merchant/ATM cùng dùng một giao dịch nhưng khác trách nhiệm.',
        },
      ],
    },
    validation: {
      tag: '06 · Validation plan',
      title: 'Cách kiểm chứng trải nghiệm sau thiết\u00A0kế',
      description:
        'Không nên đánh giá flow tài chính chỉ bằng preference test. Validation cần kiểm tra người dùng có hiểu đúng tiền, trạng thái và trách nhiệm hay không.',
      measures: [
        {
          label: 'Comprehension',
          metric:
            'Tỷ lệ người dùng trả lời đúng: trả bao nhiêu, nhận bao nhiêu và phí nào được áp dụng.',
        },
        {
          label: 'State recognition',
          metric:
            'Tỷ lệ xác định đúng trạng thái hiện tại và bên cần hành động tiếp theo.',
        },
        {
          label: 'Task success',
          metric:
            'Hoàn tất Buy/Sell, xác nhận thanh toán và OTP/QR mà không cần trợ giúp.',
        },
        {
          label: 'Error rate',
          metric:
            'Nhầm CTA, xác nhận sớm, tải sai bằng chứng hoặc cố hủy khi không còn hợp lệ.',
        },
        {
          label: 'Support signal',
          metric:
            'Số ticket hỏi về phí, tiền đang ở đâu hoặc lý do giao dịch chưa hoàn tất.',
        },
      ],
      claimsTitle: 'Không nên tuyên bố khi chưa có dữ\u00A0liệu',
      claims:
        'Không sử dụng các claim như “giảm tranh chấp”, “tăng độ tin cậy”, “tăng conversion” hoặc “rút ngắn thời gian giao dịch” nếu chưa có baseline, sample size và dữ liệu sau launch.',
    },
    retrospective: {
      tag: '07 · Retrospective',
      title: 'Điều case study này chứng\u00A0minh',
      learningsTitle: 'Bài học sản\u00A0phẩm',
      learnings: [
        'Trong fintech, trạng thái giao dịch là một phần của information architecture, không chỉ là badge.',
        'Fee transparency cần xuất hiện trước commitment và tiếp tục nhất quán trong receipt.',
        'Customer journey và partner journey phải được thiết kế cùng nhau để tránh logic một phía.',
        'Dispute, proof và audit trail là thành phần cốt lõi của trust system.',
      ],
      nextTitle: 'Bước tiếp\u00A0theo',
      next: [
        'Bổ sung state diagram có đầy đủ transition, timeout và permission.',
        'Thực hiện usability test theo cả Customer và Merchant/ATM.',
        'Gắn analytics theo transaction funnel và support reason.',
        'Bổ sung production evidence khi đã có dữ liệu đo đáng tin cậy.',
      ],
      takeawayTitle: 'Takeaway',
      takeaway:
        'UX tài chính không chỉ làm thao tác nhanh hơn. Nó giúp người dùng hiểu chính xác tiền đang ở đâu, ai chịu trách nhiệm, điều kiện nào chưa hoàn tất và bước tiếp theo cần làm gì.',
    },
  },
  en: {
    hero: {
      tag: 'VLINKPAY · Fintech transaction case study',
      title: 'Making P2P',
      highlight: 'money movement\u00A0transparent',
      description:
        'A Merchant/ATM exchange experience designed to keep amount, fees, transaction status, ownership and the next action understandable at every step.',
      proof: [
        'Customer ↔ Merchant/ATM',
        'State-driven transaction',
        'Trust & dispute ready',
      ],
      mockupTag: 'Evidence · VLINKPAY ecosystem',
      mockupAlt:
        'VLINKPAY interface mockup showing its wallet and digital-finance ecosystem',
    },
    snapshot: {
      tag: '01 · Project snapshot',
      title: 'Financial UX must explain where the money is—not only move it\u00A0quickly',
      items: [
        ['Role', 'Product Designer'],
        ['Platform', 'Mobile-first Web App'],
        ['Domain', 'Digital Wallet & P2P Exchange'],
        ['Focus', 'Trust, fees & transaction states'],
      ],
      userProblemTitle: 'User\u00A0problem',
      userProblem:
        'In a P2P exchange, money, fees and responsibility are distributed across the platform and a Merchant/ATM. One unclear status or CTA can make people believe funds are lost or that a transaction completed at the wrong time.',
      productProblemTitle: 'Product\u00A0problem',
      productProblem:
        'Create a flow simple enough for everyday users while accurately communicating financial logic, verification conditions, waiting periods, payment evidence, cancellation and disputes.',
      contributionTitle: 'My\u00A0contribution',
      contribution: [
        'Analyzed transaction logic and separated Customer and Merchant/ATM actions.',
        'Designed the journey, information hierarchy, fee breakdown and transaction state model.',
        'Standardized state copy, CTAs, confirmations, QR/OTP and proof handling.',
        'Worked with Product and Engineering to reduce ambiguity in money-related handoff rules.',
      ],
      boundaryTitle: 'Evidence\u00A0boundary',
      boundary:
        'The current source contains a mockup and Figma link but no participant count, conversion data or post-launch business metrics. This case study presents defined design scope and product logic without assigning unmeasured impact.',
    },
    trust: {
      tag: '02 · Trust model',
      title: 'Three questions must be answered at every\u00A0step',
      description:
        'In a financial flow, users need more than an instruction. They need to understand the value being moved, who owns the next action and what condition the system is waiting for.',
      pillars: [
        {
          icon: 'money',
          title: 'Money',
          question: 'How much do I pay and receive?',
          details: [
            'Requested amount',
            'System fee',
            'Merchant/ATM fee',
            'Insurance or protection amount',
            'Final amount paid / received',
          ],
        },
        {
          icon: 'state',
          title: 'State',
          question: 'Where is the transaction now?',
          details: [
            'Waiting for confirmation',
            'Accepted',
            'Waiting for payment',
            'Evidence uploaded',
            'Completed / Cancelled / Disputed',
          ],
        },
        {
          icon: 'responsibility',
          title: 'Responsibility',
          question: 'Who needs to act next?',
          details: [
            'Customer confirms or pays',
            'Merchant/ATM accepts the request',
            'Both parties verify QR/OTP',
            'System updates timeout and state',
            'Support reviews a dispute when needed',
          ],
        },
      ],
    },
    journey: {
      tag: '03 · Transaction architecture',
      title: 'One transaction, two synchronized\u00A0journeys',
      description:
        'Customer and Merchant/ATM view the same transaction through different goals, information priorities and CTAs. A shared state machine is the source of truth between both sides.',
      roleLabels: {
        customer: 'Customer journey',
        partner: 'Merchant/ATM journey',
        system: 'System',
      },
      roleDescriptions: {
        customer:
          'Create a request, understand fees, select a partner, confirm payment and receive the outcome.',
        partner:
          'Receive a request, assess whether it can be fulfilled, verify payment and complete handoff.',
      },
      steps: [
        {
          number: '01',
          state: 'Request created',
          customer: 'Enter amount and select Buy or Sell.',
          partner: 'No action yet.',
          system: 'Check limits, account eligibility and fee rules.',
        },
        {
          number: '02',
          state: 'Review & matching',
          customer: 'Review fees and choose a suitable Merchant/ATM.',
          partner: 'Appear in results based on coverage and capacity.',
          system: 'Calculate totals and surface rating, fee, distance and ETA.',
        },
        {
          number: '03',
          state: 'Waiting acceptance',
          customer: 'Track the countdown and cancel while eligible.',
          partner: 'Accept or decline the request.',
          system: 'Lock transaction conditions and synchronize both sides.',
        },
        {
          number: '04',
          state: 'Payment & verification',
          customer: 'Pay or hand over cash, then confirm.',
          partner: 'Verify QR, secure code or OTP and received amount.',
          system: 'Record evidence, timeout and verification progress.',
        },
        {
          number: '05',
          state: 'Completion',
          customer: 'Receive completion confirmation and receipt.',
          partner: 'Confirm full asset or cash handoff.',
          system: 'Finalize state, transaction ID and history.',
        },
        {
          number: '06',
          state: 'Exception handling',
          customer: 'Upload evidence and open a dispute when needed.',
          partner: 'Provide corresponding evidence.',
          system: 'Retain the audit trail for review.',
        },
      ],
      sourceTitle: 'Source of truth',
      sourceDescription:
        'A CTA should not be determined by the screen name. It must derive from transaction state, role, timeout and completion conditions.',
    },
    decisions: {
      tag: '04 · Key product decisions',
      title: 'Design decisions and trade‑offs',
      cards: [
        {
          number: '01',
          eyebrow: 'Separate responsibilities',
          title: 'Separate Customer and Merchant/ATM\u00A0actions',
          problem:
            'When both parties receive the same wording and CTA, users can attempt an action owned by the other side.',
          decision:
            'Give each role a distinct action lane while referencing one shared transaction state and ID.',
          principle:
            'The system must communicate who is waiting for whom—not merely say “processing”.',
          tradeoff:
            'More state copy and QA combinations are required, but money-related ambiguity is reduced.',
          accent: 'text-sky-500',
          surface: 'border-sky-500/20 bg-sky-500/10',
        },
        {
          number: '02',
          eyebrow: 'Fee transparency',
          title: 'Show fees before\u00A0commitment',
          problem:
            'A single total does not explain how money is allocated to the platform, partner or protection.',
          decision:
            'Separate amount, system fee, partner fee, insurance and final total in review details.',
          principle:
            'Do not make people discover costs after a transaction is created.',
          tradeoff:
            'The review screen becomes denser, but users retain control of the decision.',
          accent: 'text-orange-500',
          surface: 'border-orange-500/20 bg-orange-500/10',
        },
        {
          number: '03',
          eyebrow: 'State-driven guidance',
          title: 'Give each state one primary\u00A0action',
          problem:
            'Multiple equally weighted CTAs in a timed flow make it unclear which action directly affects funds.',
          decision:
            'Use one primary CTA per state; cancel, evidence and support are positioned by risk.',
          principle:
            'Prioritize the action that moves the transaction to the next safe state.',
          tradeoff:
            'Less frequent functions move deeper to protect clarity of the primary flow.',
          accent: 'text-emerald-500',
          surface: 'border-emerald-500/20 bg-emerald-500/10',
        },
        {
          number: '04',
          eyebrow: 'Exception-ready design',
          title: 'Design disputes from the\u00A0start',
          problem:
            'P2P exchanges can diverge because of delayed payments, missing evidence or conflicting confirmations.',
          decision:
            'Include proof upload, notes, timestamps, state history and a dispute entry point in transaction detail.',
          principle:
            'Trust does not require zero errors; it requires errors to be traceable and resolvable.',
          tradeoff:
            'Data and operations become more complex, but the system can handle exceptions.',
          accent: 'text-rose-500',
          surface: 'border-rose-500/20 bg-rose-500/10',
        },
      ] as Decision[],
    },
    evidence: {
      tag: '05 · Design evidence',
      title: 'Evidence available in the current\u00A0source',
      description:
        'The current portfolio page provides one ecosystem mockup and a Figma link. This section presents them as design evidence—not usability results or production impact.',
      mockupTag: 'VLINKPAY product ecosystem mockup',
      mockupAlt:
        'VLINKPAY product overview mockup preserved from the current source',
      figmaButton: 'Open Figma file',
      annotations: [
        {
          title: 'Wallet & assets',
          description:
            'A starting point for understanding balances and recent activity.',
        },
        {
          title: 'Transaction clarity',
          description:
            'Flows must connect amount, fees, state and the next action.',
        },
        {
          title: 'Role-aware operations',
          description:
            'Customer and Merchant/ATM share one transaction but own different actions.',
        },
      ],
    },
    validation: {
      tag: '06 · Validation plan',
      title: 'How the experience should be\u00A0validated',
      description:
        'A financial flow should not be evaluated by preference alone. Validation must test whether people correctly understand money, state and responsibility.',
      measures: [
        {
          label: 'Comprehension',
          metric:
            'Percentage who correctly identify amount paid, amount received and applied fees.',
        },
        {
          label: 'State recognition',
          metric:
            'Percentage who identify the current state and the party expected to act next.',
        },
        {
          label: 'Task success',
          metric:
            'Completion of Buy/Sell, payment confirmation and OTP/QR without assistance.',
        },
        {
          label: 'Error rate',
          metric:
            'Wrong CTA, premature confirmation, incorrect evidence or invalid cancellation attempts.',
        },
        {
          label: 'Support signal',
          metric:
            'Tickets asking about fees, fund location or why a transaction has not completed.',
        },
      ],
      claimsTitle: 'Claims to avoid without\u00A0data',
      claims:
        'Do not claim reduced disputes, increased trust, improved conversion or faster transactions without a baseline, sample size and post-launch evidence.',
    },
    retrospective: {
      tag: '07 · Retrospective',
      title: 'What this case study\u00A0demonstrates',
      learningsTitle: 'Product\u00A0learnings',
      learnings: [
        'In fintech, transaction state is part of information architecture—not merely a badge.',
        'Fee transparency must appear before commitment and remain consistent in the receipt.',
        'Customer and partner journeys must be designed together to avoid one-sided logic.',
        'Disputes, proof and audit trails are core components of a trust system.',
      ],
      nextTitle: 'Next\u00A0steps',
      next: [
        'Add a complete state diagram with transitions, timeouts and permissions.',
        'Run usability testing for both Customer and Merchant/ATM.',
        'Instrument transaction-funnel and support-reason analytics.',
        'Add production evidence when reliable measurements are available.',
      ],
      takeawayTitle: 'Takeaway',
      takeaway:
        'Financial UX is not only about making actions faster. It helps people understand exactly where their money is, who owns the next action, what condition remains incomplete and what they need to do next.',
    },
  },
} as const;

const pillarIcons = {
  money: CreditCardIcon,
  state: ActivityIcon,
  responsibility: UsersIcon,
};

export const ProjectVlinkpay: React.FC = () => {
  const { isLightMode, language } = useStore();
  const reduceMotion = useReducedMotion();
  const copy = content[language as Language];
  const [activeRole, setActiveRole] = useState<JourneyRole>('customer');

  const theme = useMemo(
    () => ({
      text: isLightMode ? 'text-slate-900' : 'text-slate-100',
      textMuted: isLightMode ? 'text-slate-600' : 'text-slate-400',
      card: isLightMode
        ? 'border-slate-200 bg-white/90 shadow-sm'
        : 'border-white/10 bg-slate-900/55',
      divider: isLightMode ? 'border-slate-200' : 'border-white/10',
      soft: isLightMode ? 'bg-slate-50' : 'bg-white/[0.04]',
    }),
    [isLightMode],
  );

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
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-b ${
            isLightMode
              ? 'from-orange-50/60 via-slate-50 to-slate-100'
              : 'from-[#24130b]/40 via-[#0f111a] to-[#0f111a]'
          }`}
        />
        <div className="absolute -right-[14%] -top-[20%] h-[58vw] w-[58vw] rounded-full bg-orange-500/12 blur-[130px]" />
        <div className="absolute -left-[12%] top-[35%] h-[42vw] w-[42vw] rounded-full bg-sky-500/8 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* 00 · HERO */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={reveal}
          className="flex min-h-[82vh] flex-col justify-center pb-16 pt-8 md:pb-24"
        >
          <div className="mx-auto max-w-5xl text-center">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${
                isLightMode
                  ? 'border-orange-200 bg-orange-50 text-orange-700'
                  : 'border-orange-500/30 bg-orange-500/10 text-orange-300'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              {copy.hero.tag}
            </span>

            <h1
              className={`mt-7 text-5xl font-black uppercase tracking-tighter md:text-7xl ${theme.text}`}
            >
              {copy.hero.title}
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                {copy.hero.highlight}
              </span>
            </h1>

            <p
              className={`mx-auto mt-7 max-w-3xl text-lg leading-relaxed md:text-xl ${theme.textMuted}`}
            >
              {copy.hero.description}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {copy.hero.proof.map((item) => (
                <span
                  key={item}
                  className={`rounded-full border px-3 py-2 text-[10px] font-bold ${
                    isLightMode
                      ? 'border-slate-200 bg-white text-slate-700'
                      : 'border-white/10 bg-white/[0.05] text-slate-200'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <figure
            className={`mx-auto mt-12 w-full max-w-5xl overflow-hidden rounded-[2rem] border shadow-2xl ${theme.card}`}
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
                {copy.hero.mockupTag}
              </figcaption>
            </div>
            <img
              loading="eager"
              decoding="async"
              src="/assets/vlinkpay-thumbnail.png"
              alt={copy.hero.mockupAlt}
              className="h-auto w-full object-cover"
            />
          </figure>
        </motion.section>

        {/* 01 · SNAPSHOT */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <header className="lg:col-span-4">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-orange-500">
                {copy.snapshot.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
              >
                {copy.snapshot.title}
              </h2>
            </header>

            <div className="lg:col-span-8">
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
                  <UsersIcon className="h-7 w-7 text-sky-500" />
                  <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                    {copy.snapshot.userProblemTitle}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {copy.snapshot.userProblem}
                  </p>
                </article>

                <article className={`rounded-3xl border p-7 ${theme.card}`}>
                  <ActivityIcon className="h-7 w-7 text-orange-500" />
                  <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                    {copy.snapshot.productProblemTitle}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {copy.snapshot.productProblem}
                  </p>
                </article>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-5">
                <article
                  className={`rounded-3xl border p-7 lg:col-span-3 ${theme.card}`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                    {copy.snapshot.contributionTitle}
                  </p>
                  <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                    {copy.snapshot.contribution.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                        {item}
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
                  <FileCheckIcon className="h-7 w-7 text-amber-500" />
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

        {/* 02 · TRUST MODEL */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <header className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-orange-500">
              {copy.trust.tag}
            </p>
            <h2
              className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
            >
              {copy.trust.title}
            </h2>
            <p className={`mt-5 leading-relaxed ${theme.textMuted}`}>
              {copy.trust.description}
            </p>
          </header>

          <div className="grid gap-5 lg:grid-cols-3">
            {copy.trust.pillars.map((pillar) => {
              const Icon =
                pillarIcons[pillar.icon as keyof typeof pillarIcons];

              return (
                <article
                  key={pillar.title}
                  className={`rounded-3xl border p-7 ${theme.card}`}
                >
                  <Icon className="h-8 w-8 text-orange-500" />
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-orange-500">
                    {pillar.title}
                  </p>
                  <h3 className={`mt-2 text-xl font-black ${theme.text}`}>
                    {pillar.question}
                  </h3>
                  <ul className={`mt-5 space-y-3 text-sm ${theme.textMuted}`}>
                    {pillar.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </motion.section>

        {/* 03 · TRANSACTION ARCHITECTURE */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
            <header className="lg:col-span-7">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-sky-500">
                {copy.journey.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
              >
                {copy.journey.title}
              </h2>
            </header>
            <p className={`lg:col-span-5 ${theme.textMuted}`}>
              {copy.journey.description}
            </p>
          </div>

          <div
            className={`mb-6 inline-flex rounded-2xl border p-1 ${theme.card}`}
            role="tablist"
            aria-label={
              language === 'vi'
                ? 'Vai trò trong giao dịch VLINKPAY'
                : 'VLINKPAY transaction roles'
            }
          >
            {(['customer', 'partner'] as JourneyRole[]).map((role) => {
              const isActive = activeRole === role;

              return (
                <button
                  key={role}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveRole(role)}
                  className={`rounded-xl px-5 py-3 text-xs font-black transition-colors ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : theme.textMuted
                  }`}
                >
                  {copy.journey.roleLabels[role]}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className={`mb-6 rounded-2xl border p-5 ${theme.card}`}
            >
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
                {copy.journey.roleDescriptions[activeRole]}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-4">
            {copy.journey.steps.map((step) => (
              <article
                key={step.number}
                className={`grid gap-5 rounded-3xl border p-6 md:grid-cols-12 md:items-center ${theme.card}`}
              >
                <div className="md:col-span-2">
                  <span className="text-xs font-black text-orange-500">
                    {step.number}
                  </span>
                  <h3 className={`mt-2 text-lg font-black ${theme.text}`}>
                    {step.state}
                  </h3>
                </div>

                <div
                  className={`rounded-2xl border p-4 md:col-span-3 ${
                    activeRole === 'customer'
                      ? 'border-sky-500/30 bg-sky-500/10'
                      : isLightMode
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-500">
                    {copy.journey.roleLabels.customer}
                  </p>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {step.customer}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-4 md:col-span-3 ${
                    activeRole === 'partner'
                      ? 'border-orange-500/30 bg-orange-500/10'
                      : isLightMode
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-500">
                    {copy.journey.roleLabels.partner}
                  </p>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {step.partner}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-4 md:col-span-4 ${
                    isLightMode
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-emerald-500/20 bg-emerald-500/10'
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-500">
                    {copy.journey.roleLabels.system}
                  </p>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {step.system}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <aside
            className={`mt-6 rounded-3xl border p-7 ${
              isLightMode
                ? 'border-sky-200 bg-sky-50'
                : 'border-sky-500/20 bg-sky-500/10'
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-500">
              {copy.journey.sourceTitle}
            </p>
            <p className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}>
              {copy.journey.sourceDescription}
            </p>
          </aside>
        </motion.section>

        {/* 04 · KEY DECISIONS */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <header className="mb-12 text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-orange-500">
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
                      className={`rounded-2xl border p-5 ${theme.soft} ${theme.divider}`}
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

        {/* 05 · DESIGN EVIDENCE */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <header className="lg:col-span-4">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-amber-500">
                {copy.evidence.tag}
              </p>
              <h2
                className={`text-3xl font-black tracking-tight md:text-5xl ${theme.text}`}
              >
                {copy.evidence.title}
              </h2>
              <p className={`mt-5 leading-relaxed ${theme.textMuted}`}>
                {copy.evidence.description}
              </p>

              <a
                href={FIGMA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-7 inline-flex items-center gap-3 rounded-xl px-6 py-4 text-sm font-black transition-transform hover:scale-105 ${
                  isLightMode
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/20'
                }`}
              >
                {copy.evidence.figmaButton}
                <ExternalLinkIcon className="h-5 w-5" />
              </a>
            </header>

            <div className="lg:col-span-8">
              <figure
                className={`overflow-hidden rounded-[2rem] border shadow-2xl ${theme.card}`}
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
                    {copy.evidence.mockupTag}
                  </figcaption>
                </div>
                <img
                  loading="lazy"
                  decoding="async"
                  src="/assets/vlinkpay-thumbnail.png"
                  alt={copy.evidence.mockupAlt}
                  className="h-auto w-full object-cover"
                />
              </figure>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {copy.evidence.annotations.map((item, index) => (
                  <article
                    key={item.title}
                    className={`rounded-2xl border p-5 ${theme.card}`}
                  >
                    <span className="text-xs font-black text-orange-500">
                      0{index + 1}
                    </span>
                    <h3 className={`mt-3 text-lg font-black ${theme.text}`}>
                      {item.title}
                    </h3>
                    <p
                      className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}
                    >
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* 06 · VALIDATION PLAN */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <header className="lg:col-span-4">
              <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-emerald-500">
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

            <div className="lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {copy.validation.measures.map((item) => (
                  <article
                    key={item.label}
                    className={`rounded-3xl border p-6 ${theme.card}`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-500">
                      {item.label}
                    </p>
                    <p
                      className={`mt-3 text-sm leading-relaxed ${theme.textMuted}`}
                    >
                      {item.metric}
                    </p>
                  </article>
                ))}
              </div>

              <aside
                className={`mt-5 flex gap-4 rounded-3xl border p-7 ${
                  isLightMode
                    ? 'border-rose-200 bg-rose-50'
                    : 'border-rose-500/20 bg-rose-500/10'
                }`}
              >
                <AlertTriangleIcon className="h-7 w-7 shrink-0 text-rose-500" />
                <div>
                  <h3 className={`text-lg font-black ${theme.text}`}>
                    {copy.validation.claimsTitle}
                  </h3>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}
                  >
                    {copy.validation.claims}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </motion.section>

        {/* 07 · RETROSPECTIVE */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={reveal}
          className={`border-t py-16 md:py-24 ${theme.divider}`}
        >
          <header className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-orange-500">
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
              <ShieldCheckIcon className="h-7 w-7 text-orange-500" />
              <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                {copy.retrospective.learningsTitle}
              </h3>
              <ul className={`mt-5 space-y-4 text-sm ${theme.textMuted}`}>
                {copy.retrospective.learnings.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className={`rounded-3xl border p-7 ${theme.card}`}>
              <ArrowRightIcon className="h-7 w-7 text-sky-500" />
              <h3 className={`mt-5 text-xl font-black ${theme.text}`}>
                {copy.retrospective.nextTitle}
              </h3>
              <ul className={`mt-5 space-y-4 text-sm ${theme.textMuted}`}>
                {copy.retrospective.next.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ArrowRightIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <aside
            className={`mt-6 rounded-3xl border-l-4 border-orange-500 p-7 md:p-9 ${
              isLightMode ? 'bg-orange-50/80' : 'bg-orange-500/10'
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">
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
