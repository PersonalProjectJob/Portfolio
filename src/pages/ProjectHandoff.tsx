import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CaseStudyLayout } from '../components/layout/CaseStudyLayout';
import { ZoomableImage } from '../components/ZoomableImage';

const SvgIcon = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
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
  arrow: <SvgIcon><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></SvgIcon>,
  source: <SvgIcon><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/></SvgIcon>,
  figma: <SvgIcon><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5Z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2Z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0Z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0Z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5Z"/></SvgIcon>,
  code: <SvgIcon><path d="m8 9-3 3 3 3"/><path d="m16 9 3 3-3 3"/><path d="m14 5-4 14"/></SvgIcon>,
  review: <SvgIcon><path d="M9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></SvgIcon>,
  browser: <SvgIcon><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18"/><path d="M7 6h.01M10 6h.01"/></SvgIcon>,
  ship: <SvgIcon><path d="M12 2 8 8l4 2 4-2-4-6Z"/><path d="M8 8 5 18l7 4 7-4-3-10"/><path d="M12 10v12"/></SvgIcon>,
  check: <SvgIcon><path d="m5 12 4 4L19 6"/></SvgIcon>,
  loop: <SvgIcon><path d="M20 7h-7a4 4 0 0 0-4 4v1"/><path d="m17 4 3 3-3 3"/><path d="M4 17h7a4 4 0 0 0 4-4v-1"/><path d="m7 20-3-3 3-3"/></SvgIcon>,
};

type Content = {
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    repoPrimary: string;
    repoSecondary: string;
    explore: string;
    meta: string[];
  };
  problem: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{ title: string; description: string }>;
  };
  combination: {
    eyebrow: string;
    title: string;
    description: string;
    figmaTitle: string;
    figmaDescription: string;
    figmaItems: Array<{ title: string; description: string }>;
    gstackTitle: string;
    gstackDescription: string;
    gstackItems: Array<{ title: string; description: string }>;
    bridge: string;
  };
  architecture: {
    eyebrow: string;
    title: string;
    description: string;
    stages: Array<{ title: string; description: string }>;
  };
  workflow: {
    eyebrow: string;
    title: string;
    description: string;
    steps: Array<{ title: string; description: string; artifact: string; gate: string }>;
  };
  package: {
    eyebrow: string;
    title: string;
    description: string;
    columns: { stage: string; artifacts: string; owner: string; gate: string };
    rows: Array<{ stage: string; artifacts: string; owner: string; gate: string }>;
  };
  responsibility: {
    eyebrow: string;
    title: string;
    description: string;
    designerTitle: string;
    designerItems: string[];
    agentTitle: string;
    agentItems: string[];
    principle: string;
  };
  value: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{ title: string; value: string; description: string }>;
    closing: string;
  };
};

const content: Record<'vi' | 'en', Content> = {
  vi: {
    hero: {
      eyebrow: 'Design Handoff · Verified Delivery System',
      title: 'Từ Figma đến Production bằng',
      highlight: 'một vòng lặp có kiểm chứng',
      description: 'Kết hợp hạ tầng Figma Agentic trong personal-skill-and-plugin với quy trình Review → QA → Ship của gstack để biến handoff từ một lần bàn giao tĩnh thành hệ thống delivery liên tục, có bằng chứng và có cổng kiểm soát chất lượng.',
      repoPrimary: 'Figma skills repository',
      repoSecondary: 'gstack repository',
      explore: 'Xem workflow',
      meta: [
        'Vai trò: Product Designer · Design System Architect',
        'Phạm vi: Figma · Code · Review · QA · Release',
        'Đầu ra: Tokens · Components · Test evidence · Production verification',
      ],
    },
    problem: {
      eyebrow: '01. Vì sao handoff truyền thống thất bại',
      title: 'File thiết kế đúng không đảm bảo sản phẩm được triển khai đúng',
      description: 'Khoảng trống xuất hiện sau khi Developer bắt đầu code: quyết định thiết kế bị diễn giải lại, state bị bỏ sót, component bị tạo trùng và không có vòng quay trở lại để so sánh implementation với ý định ban đầu.',
      cards: [
        {
          title: 'Bàn giao dưới dạng snapshot',
          description: 'Figma và tài liệu chỉ phản ánh một thời điểm. Khi code thay đổi, bản thiết kế và implementation bắt đầu lệch nhau.',
        },
        {
          title: 'Thiếu trạng thái và tiêu chí chấp nhận',
          description: 'Happy path được mô tả rõ, nhưng loading, empty, error, responsive và accessibility thường bị để lại cho giai đoạn triển khai.',
        },
        {
          title: 'Không có bằng chứng trước khi ship',
          description: 'Build thành công không chứng minh flow hoạt động, giao diện không vỡ hoặc trải nghiệm trên trình duyệt đúng như thiết kế.',
        },
      ],
    },
    combination: {
      eyebrow: '02. Hai hệ thống, một vòng lặp',
      title: 'Repo của tôi quản lý tính đúng của thiết kế; gstack quản lý tính đúng của delivery',
      description: 'Hai repository không thay thế nhau. Chúng giải quyết hai nửa khác nhau của cùng một bài toán và được nối lại bằng artifact, review gate và evidence.',
      figmaTitle: 'Design Infrastructure · personal-skill-and-plugin',
      figmaDescription: 'Chuẩn hóa nguồn sự thật và cấu trúc Figma trước khi code bắt đầu.',
      figmaItems: [
        {
          title: '/create-design-system',
          description: 'Trích xuất token từ codebase hoặc DESIGN.md để tạo Variables, Styles và foundational components trong Figma.',
        },
        {
          title: '/generate-figma-kit',
          description: 'Đồng bộ product flow bằng component instance, Auto Layout và kiểm tra regression trên master lẫn màn hình mục tiêu.',
        },
        {
          title: '/figma-pattern-advisor',
          description: 'Audit selection, so khớp với pattern chuẩn và hỗ trợ thay layer thủ công bằng component tuân thủ Design System.',
        },
        {
          title: '/frontend-code-standards',
          description: 'Giữ Atomic Design, component reuse và data boundary nhất quán giữa thiết kế với code.',
        },
        {
          title: '/feature-focused-tester',
          description: 'Kiểm tra UI, data boundary và E2E flow theo đúng phạm vi feature đã thay đổi.',
        },
      ],
      gstackTitle: 'Delivery Operating System · gstack',
      gstackDescription: 'Đặt cổng review và kiểm chứng từ trước implementation đến sau production.',
      gstackItems: [
        {
          title: '/plan-design-review',
          description: 'Review plan qua Information Architecture, interaction states, user journey, AI slop, Design System, responsive và accessibility.',
        },
        {
          title: '/review + /design-review',
          description: 'Kiểm tra code và audit live UI; sửa theo finding nhỏ, có before/after screenshot và lịch sử thay đổi rõ ràng.',
        },
        {
          title: '/qa',
          description: 'Dùng trình duyệt thật để đi qua flow, form, breakpoint và console; tạo report cùng bằng chứng ảnh.',
        },
        {
          title: '/ship',
          description: 'Đồng bộ branch, chạy test, rà coverage, push và tạo PR với trạng thái release rõ ràng.',
        },
        {
          title: '/land-and-deploy + /canary',
          description: 'Merge, chờ CI/deploy và xác minh production bằng health check, console và performance baseline.',
        },
      ],
      bridge: 'Điểm nối giữa hai hệ thống là một chuỗi artifact dùng chung: Design System → Design plan → Component implementation → Review evidence → QA report → Release verification.',
    },
    architecture: {
      eyebrow: '03. Kiến trúc nguồn sự thật',
      title: 'Handoff được tổ chức thành năm lớp có thể truy vết',
      description: 'Mỗi lớp có đầu vào, đầu ra và cổng kiểm tra riêng. Không layer nào được xem là hoàn tất chỉ vì Agent báo “done”.',
      stages: [
        {
          title: '01 · Product intent',
          description: 'Mục tiêu người dùng, phạm vi, ưu tiên, acceptance criteria và các quyết định không được phép tự suy diễn.',
        },
        {
          title: '02 · Design source of truth',
          description: 'DESIGN.md, token source, Figma Variables, Styles, components, variants, state matrix và responsive rules.',
        },
        {
          title: '03 · Implementation contract',
          description: 'Component mapping, props, data states, accessibility behavior và quy tắc reuse giữa Figma với code.',
        },
        {
          title: '04 · Verification evidence',
          description: 'Diff, test plan, test result, before/after screenshots, QA findings và danh sách vấn đề được defer.',
        },
        {
          title: '05 · Production truth',
          description: 'PR đã review, CI pass, deployment thành công, canary check và documentation phản ánh đúng sản phẩm đã ship.',
        },
      ],
    },
    workflow: {
      eyebrow: '04. Workflow end-to-end',
      title: 'Một feature đi qua tám bước trước khi được xem là đã bàn giao',
      description: 'Workflow lấy cấu trúc Figma từ repo cá nhân và đưa nó qua chuỗi Think → Plan → Build → Review → Test → Ship → Verify.',
      steps: [
        {
          title: 'Định nghĩa vấn đề và nguồn sự thật',
          description: 'Chốt user outcome, feature scope, DESIGN.md/token source và màn hình nằm trong phạm vi.',
          artifact: 'Product brief · DESIGN.md · Acceptance criteria',
          gate: 'Designer/Product approval',
        },
        {
          title: 'Tạo hoặc đồng bộ Design System',
          description: 'Dùng create-design-system để đảm bảo mọi màu, spacing, radius và typography ánh xạ về token.',
          artifact: 'Variables · Styles · Foundation components',
          gate: 'Token adherence',
        },
        {
          title: 'Chuẩn hóa product flow trong Figma',
          description: 'Dùng generate-figma-kit để ưu tiên component có sẵn, tạo missing master khi cần và thay duplicate bằng instance.',
          artifact: 'Dev Mode-ready Figma flow',
          gate: 'Component + Auto Layout audit',
        },
        {
          title: 'Review kế hoạch thiết kế trước khi code',
          description: 'Dùng plan-design-review để khóa IA, state coverage, user journey, responsive, accessibility và các quyết định còn mở.',
          artifact: 'Design-complete implementation plan',
          gate: 'Design score + unresolved decisions',
        },
        {
          title: 'Triển khai theo component contract',
          description: 'Code tuân theo Atomic Design, shared component, data boundary và behavior đã thống nhất từ Figma.',
          artifact: 'Implementation diff · Component mapping',
          gate: 'Code standards + build',
        },
        {
          title: 'So sánh live implementation với thiết kế',
          description: 'Dùng review và design-review để phát hiện completeness gap, visual drift, AI slop và lỗi interaction.',
          artifact: 'Review findings · Before/after evidence',
          gate: 'Design and code review',
        },
        {
          title: 'Kiểm tra feature và flow bằng trình duyệt thật',
          description: 'Feature-focused-tester kiểm tra UI/data/E2E; gstack QA đi qua URL thật, breakpoint, form và console.',
          artifact: 'Test plan · Test result · QA report',
          gate: 'P0/P1 resolved or accepted',
        },
        {
          title: 'Ship, deploy và xác minh production',
          description: 'Ship tạo PR và coverage evidence; land-and-deploy cùng canary xác nhận production vẫn hoạt động sau merge.',
          artifact: 'PR · CI · Deploy log · Canary result',
          gate: 'Production verified',
        },
      ],
    },
    package: {
      eyebrow: '05. Handoff package',
      title: 'Mỗi giai đoạn bàn giao một bộ artifact khác nhau',
      description: 'Không còn một “handoff file” duy nhất. Team nhận đúng thông tin cần thiết tại đúng thời điểm và biết điều kiện để chuyển sang bước kế tiếp.',
      columns: {
        stage: 'Trạng thái',
        artifacts: 'Artifact bắt buộc',
        owner: 'Chủ sở hữu',
        gate: 'Điều kiện qua cổng',
      },
      rows: [
        {
          stage: 'Design-ready',
          artifacts: 'DESIGN.md, token source, IA, state matrix, responsive/accessibility rules',
          owner: 'Product Designer',
          gate: 'Không còn quyết định UX quan trọng bị để mở',
        },
        {
          stage: 'Dev-ready',
          artifacts: 'Figma Variables, Styles, master components, instances, component mapping',
          owner: 'Designer + Figma Agent',
          gate: 'Flow dùng token và component có thể truy vết',
        },
        {
          stage: 'Review-ready',
          artifacts: 'Implementation diff, build result, review findings, before/after screenshots',
          owner: 'Developer/Agent + Reviewer',
          gate: 'Không còn completeness gap hoặc visual drift nghiêm trọng',
        },
        {
          stage: 'Release-ready',
          artifacts: 'Test plan, UI/data/E2E results, browser QA report, resolved/deferred list',
          owner: 'QA Agent + Human approver',
          gate: 'P0/P1 được xử lý hoặc chấp nhận có chủ đích',
        },
        {
          stage: 'Production-verified',
          artifacts: 'PR, CI result, deploy result, canary, updated documentation',
          owner: 'Release Agent + Product owner',
          gate: 'Production hoạt động và nguồn sự thật đã được cập nhật',
        },
      ],
    },
    responsibility: {
      eyebrow: '06. Human-in-the-loop',
      title: 'Agent thực thi quy trình; con người chịu trách nhiệm cho quyết định',
      description: 'Tự động hóa chỉ đáng tin khi ranh giới quyền quyết định được mô tả rõ.',
      designerTitle: 'Product Designer sở hữu',
      designerItems: [
        'Mục tiêu và giá trị người dùng',
        'Information hierarchy và interaction model',
        'Ngoại lệ nào được phép phá Design System',
        'Trade-off giữa tốc độ, chất lượng và phạm vi',
        'Phê duyệt cuối cùng đối với UX và visual fidelity',
      ],
      agentTitle: 'AI Agent đảm nhiệm',
      agentItems: [
        'Trích xuất và đồng bộ token',
        'Tạo component, instance và Auto Layout',
        'Rà state coverage, duplicate và implementation drift',
        'Chạy test, browser QA và thu thập screenshot',
        'Chuẩn bị PR, release evidence và production check',
      ],
      principle: 'Nguyên tắc cốt lõi: báo cáo của Agent là dữ liệu cần được kiểm chứng, không phải kết luận cuối cùng.',
    },
    value: {
      eyebrow: '07. Giá trị mang lại',
      title: 'Handoff trở thành năng lực vận hành, không còn phụ thuộc vào một cá nhân',
      description: 'Quy trình có thể được dùng lại cho feature mới, thành viên mới hoặc Agent mới mà không phải giải thích lại toàn bộ tiêu chuẩn từ đầu.',
      cards: [
        {
          title: 'Single source of truth',
          value: 'Traceable',
          description: 'Từ token đến production đều có nguồn và artifact để truy ngược khi phát sinh sai lệch.',
        },
        {
          title: 'Delivery confidence',
          value: 'Evidence-based',
          description: 'Quyết định release dựa trên review, test, browser QA và production verification thay vì cảm giác.',
        },
        {
          title: 'Team scalability',
          value: 'Reusable',
          description: 'Skill, gate và handoff package giữ quy trình ổn định khi số lượng feature, thành viên hoặc Agent tăng lên.',
        },
      ],
      closing: 'Handoff tốt không kết thúc khi Developer nhận được Figma. Nó kết thúc khi sản phẩm trên production vẫn giữ đúng ý định thiết kế, hoạt động đúng flow và có đủ bằng chứng để team tự tin tiếp tục mở rộng.',
    },
  },
  en: {
    hero: {
      eyebrow: 'Design Handoff · Verified Delivery System',
      title: 'From Figma to production through',
      highlight: 'a verified delivery loop',
      description: 'Combining the Figma agentic infrastructure in personal-skill-and-plugin with gstack’s Review → QA → Ship lifecycle to turn handoff from a static delivery event into a continuous, evidence-backed quality system.',
      repoPrimary: 'Figma skills repository',
      repoSecondary: 'gstack repository',
      explore: 'Explore workflow',
      meta: [
        'Role: Product Designer · Design System Architect',
        'Scope: Figma · Code · Review · QA · Release',
        'Deliverables: Tokens · Components · Test evidence · Production verification',
      ],
    },
    problem: {
      eyebrow: '01. Why traditional handoff fails',
      title: 'A correct design file does not guarantee a correct implementation',
      description: 'The gap opens after development begins: design decisions get reinterpreted, states disappear, components are duplicated, and there is no return loop to compare implementation with the original intent.',
      cards: [
        {
          title: 'Handoff is treated as a snapshot',
          description: 'Figma and documentation represent one moment. Once code changes, design and implementation begin to drift.',
        },
        {
          title: 'States and acceptance criteria are missing',
          description: 'The happy path is specified, while loading, empty, error, responsive, and accessibility behavior is deferred to implementation.',
        },
        {
          title: 'There is no evidence before shipping',
          description: 'A successful build does not prove that the flow works, the layout holds, or the browser experience matches the design.',
        },
      ],
    },
    combination: {
      eyebrow: '02. Two systems, one loop',
      title: 'My repository protects design integrity; gstack protects delivery integrity',
      description: 'The repositories do not replace each other. They solve different halves of the same problem and connect through shared artifacts, review gates, and evidence.',
      figmaTitle: 'Design Infrastructure · personal-skill-and-plugin',
      figmaDescription: 'Standardizes the source of truth and Figma structure before implementation starts.',
      figmaItems: [
        {
          title: '/create-design-system',
          description: 'Extracts tokens from the codebase or DESIGN.md to create Figma Variables, Styles, and foundational components.',
        },
        {
          title: '/generate-figma-kit',
          description: 'Synchronizes product flows through component instances, Auto Layout, and regression checks on masters and target screens.',
        },
        {
          title: '/figma-pattern-advisor',
          description: 'Audits selections, matches canonical patterns, and replaces manual layers with Design System-compliant components.',
        },
        {
          title: '/frontend-code-standards',
          description: 'Maintains Atomic Design, component reuse, and data-boundary alignment between Figma and code.',
        },
        {
          title: '/feature-focused-tester',
          description: 'Tests UI, data-boundary, and end-to-end behavior within the exact scope of a changed feature.',
        },
      ],
      gstackTitle: 'Delivery Operating System · gstack',
      gstackDescription: 'Adds review and verification gates from pre-implementation planning through production.',
      gstackItems: [
        {
          title: '/plan-design-review',
          description: 'Reviews information architecture, interaction states, user journey, AI slop, Design System alignment, responsiveness, and accessibility.',
        },
        {
          title: '/review + /design-review',
          description: 'Reviews code and the live UI, applies small traceable fixes, and captures before/after evidence.',
        },
        {
          title: '/qa',
          description: 'Uses a real browser to test flows, forms, breakpoints, and console health, producing a report with screenshots.',
        },
        {
          title: '/ship',
          description: 'Synchronizes the branch, runs tests, audits coverage, pushes, and creates a release-ready pull request.',
        },
        {
          title: '/land-and-deploy + /canary',
          description: 'Merges, waits for CI and deployment, then verifies production health, console output, and performance.',
        },
      ],
      bridge: 'The systems connect through a shared artifact chain: Design System → Design plan → Component implementation → Review evidence → QA report → Release verification.',
    },
    architecture: {
      eyebrow: '03. Source-of-truth architecture',
      title: 'Handoff is organized into five traceable layers',
      description: 'Each layer has its own inputs, outputs, and quality gate. No layer is complete merely because an agent reports “done.”',
      stages: [
        {
          title: '01 · Product intent',
          description: 'User outcomes, scope, priorities, acceptance criteria, and decisions that must not be inferred.',
        },
        {
          title: '02 · Design source of truth',
          description: 'DESIGN.md, token sources, Figma Variables, Styles, components, variants, state matrix, and responsive rules.',
        },
        {
          title: '03 · Implementation contract',
          description: 'Component mapping, props, data states, accessibility behavior, and reuse rules between Figma and code.',
        },
        {
          title: '04 · Verification evidence',
          description: 'Diffs, test plans, test results, before/after screenshots, QA findings, and explicitly deferred issues.',
        },
        {
          title: '05 · Production truth',
          description: 'Reviewed PR, passing CI, successful deployment, canary checks, and documentation that matches what shipped.',
        },
      ],
    },
    workflow: {
      eyebrow: '04. End-to-end workflow',
      title: 'A feature passes eight steps before handoff is considered complete',
      description: 'The workflow takes structured Figma output from the personal repository and moves it through Think → Plan → Build → Review → Test → Ship → Verify.',
      steps: [
        {
          title: 'Define the problem and source of truth',
          description: 'Lock the user outcome, feature scope, DESIGN.md/token source, and screens included in the work.',
          artifact: 'Product brief · DESIGN.md · Acceptance criteria',
          gate: 'Designer/Product approval',
        },
        {
          title: 'Create or synchronize the Design System',
          description: 'Use create-design-system so every color, spacing value, radius, and type style maps to a token.',
          artifact: 'Variables · Styles · Foundation components',
          gate: 'Token adherence',
        },
        {
          title: 'Standardize the Figma product flow',
          description: 'Use generate-figma-kit to prioritize existing components, create missing masters, and replace duplicates with instances.',
          artifact: 'Dev Mode-ready Figma flow',
          gate: 'Component + Auto Layout audit',
        },
        {
          title: 'Review the design plan before coding',
          description: 'Use plan-design-review to lock information architecture, state coverage, journey, responsiveness, accessibility, and open decisions.',
          artifact: 'Design-complete implementation plan',
          gate: 'Design score + unresolved decisions',
        },
        {
          title: 'Implement against the component contract',
          description: 'Code follows Atomic Design, shared components, data boundaries, and behavior agreed in Figma.',
          artifact: 'Implementation diff · Component mapping',
          gate: 'Code standards + build',
        },
        {
          title: 'Compare the live implementation with design intent',
          description: 'Use review and design-review to find completeness gaps, visual drift, AI slop, and interaction defects.',
          artifact: 'Review findings · Before/after evidence',
          gate: 'Design and code review',
        },
        {
          title: 'Test the feature and flow in a real browser',
          description: 'Feature-focused-tester covers UI/data/E2E; gstack QA traverses the real URL, breakpoints, forms, and console.',
          artifact: 'Test plan · Test result · QA report',
          gate: 'P0/P1 resolved or accepted',
        },
        {
          title: 'Ship, deploy, and verify production',
          description: 'Ship creates the PR and coverage evidence; land-and-deploy plus canary confirms production after merge.',
          artifact: 'PR · CI · Deploy log · Canary result',
          gate: 'Production verified',
        },
      ],
    },
    package: {
      eyebrow: '05. Handoff package',
      title: 'Each delivery stage requires a different artifact package',
      description: 'There is no single “handoff file.” The team receives the right information at the right time and knows the condition for moving forward.',
      columns: {
        stage: 'State',
        artifacts: 'Required artifacts',
        owner: 'Owner',
        gate: 'Exit condition',
      },
      rows: [
        {
          stage: 'Design-ready',
          artifacts: 'DESIGN.md, token source, IA, state matrix, responsive/accessibility rules',
          owner: 'Product Designer',
          gate: 'No critical UX decision remains open',
        },
        {
          stage: 'Dev-ready',
          artifacts: 'Figma Variables, Styles, master components, instances, component mapping',
          owner: 'Designer + Figma Agent',
          gate: 'Flow is traceable to tokens and reusable components',
        },
        {
          stage: 'Review-ready',
          artifacts: 'Implementation diff, build result, review findings, before/after screenshots',
          owner: 'Developer/Agent + Reviewer',
          gate: 'No critical completeness gap or visual drift',
        },
        {
          stage: 'Release-ready',
          artifacts: 'Test plan, UI/data/E2E results, browser QA report, resolved/deferred list',
          owner: 'QA Agent + Human approver',
          gate: 'P0/P1 issues are resolved or consciously accepted',
        },
        {
          stage: 'Production-verified',
          artifacts: 'PR, CI result, deploy result, canary, updated documentation',
          owner: 'Release Agent + Product owner',
          gate: 'Production is healthy and sources of truth are current',
        },
      ],
    },
    responsibility: {
      eyebrow: '06. Human in the loop',
      title: 'Agents execute the process; people remain accountable for decisions',
      description: 'Automation is trustworthy only when decision rights are explicit.',
      designerTitle: 'Product Designer owns',
      designerItems: [
        'User goals and product value',
        'Information hierarchy and interaction model',
        'Which exceptions may break the Design System',
        'Trade-offs between speed, quality, and scope',
        'Final approval of UX and visual fidelity',
      ],
      agentTitle: 'AI Agent handles',
      agentItems: [
        'Extracting and synchronizing tokens',
        'Creating components, instances, and Auto Layout',
        'Auditing state coverage, duplication, and implementation drift',
        'Running tests, browser QA, and screenshot capture',
        'Preparing PRs, release evidence, and production checks',
      ],
      principle: 'Core principle: an agent report is evidence to verify, not a final conclusion.',
    },
    value: {
      eyebrow: '07. Value created',
      title: 'Handoff becomes an operational capability rather than individual knowledge',
      description: 'The workflow can be reused for a new feature, teammate, or agent without explaining every standard again from scratch.',
      cards: [
        {
          title: 'Single source of truth',
          value: 'Traceable',
          description: 'Every production decision can be traced back through implementation, components, and tokens.',
        },
        {
          title: 'Delivery confidence',
          value: 'Evidence-based',
          description: 'Release decisions rely on review, tests, browser QA, and production verification instead of intuition.',
        },
        {
          title: 'Team scalability',
          value: 'Reusable',
          description: 'Skills, gates, and artifact packages keep delivery consistent as features, teammates, and agents increase.',
        },
      ],
      closing: 'Good handoff does not end when a developer receives Figma. It ends when the production product preserves the design intent, works through the intended flow, and carries enough evidence for the team to keep scaling with confidence.',
    },
  },
};

export const ProjectHandoff: React.FC = () => {
  const { isLightMode, language } = useStore();
  const c = content[language];

  const theme = {
    bg: isLightMode ? 'bg-slate-50' : 'bg-[#0f172a]',
    text: isLightMode ? 'text-slate-800' : 'text-slate-100',
    textMuted: isLightMode ? 'text-slate-500' : 'text-slate-400',
    card: isLightMode ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800',
    accent: isLightMode ? 'text-sky-600' : 'text-sky-400',
    accentBg: isLightMode ? 'bg-sky-50' : 'bg-sky-900/20',
    border: isLightMode ? 'border-slate-200' : 'border-slate-800',
    glow: isLightMode ? 'shadow-[0_0_30px_rgba(14,165,233,0.15)]' : 'shadow-[0_0_30px_rgba(14,165,233,0.1)]',
    tableHeader: isLightMode ? 'bg-slate-100/80' : 'bg-white/5',
  };

  const fadeInUp: any = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  return (
    <CaseStudyLayout>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${isLightMode ? 'from-sky-100/50 via-transparent to-transparent' : 'from-sky-900/20 via-transparent to-transparent'}`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 pt-4">
              <p className={`text-sm font-bold tracking-widest uppercase mb-4 ${theme.accent}`}>{c.hero.eyebrow}</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
                {c.hero.title}<br />
                <span className={theme.accent}>{c.hero.highlight}</span>
              </h1>
              <p className={`text-lg md:text-xl mb-8 leading-relaxed ${theme.textMuted}`}>{c.hero.description}</p>

              <div className="flex flex-wrap gap-3 mb-8">
                <a
                  href="https://github.com/PersonalProjectJob/personal-skill-and-plugin"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-colors"
                >
                  {c.hero.repoPrimary}{icons.arrow}
                </a>
                <a
                  href="https://github.com/garrytan/gstack"
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-semibold transition-colors ${theme.card}`}
                >
                  {c.hero.repoSecondary}
                </a>
                <a
                  href="#handoff-workflow"
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-semibold transition-colors ${theme.card}`}
                >
                  {c.hero.explore}
                </a>
              </div>

              <div className="flex flex-col gap-2">
                {c.hero.meta.map((item) => <p key={item} className={`text-sm ${theme.textMuted}`}>{item}</p>)}
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-sky-500 rounded-3xl blur-3xl opacity-20" />
              <ZoomableImage
                src="/images/case-study/handoff_cs_1.jpg"
                alt="Verified design handoff workflow"
                className="relative z-10 w-full rounded-3xl shadow-2xl object-cover border border-slate-200/20"
              />
            </div>
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.problem.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.problem.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.problem.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {c.problem.cards.map((card, index) => (
              <article key={card.title} className={`p-6 rounded-2xl border-l-4 border-l-sky-500 ${theme.card}`}>
                <span className={`inline-flex w-9 h-9 items-center justify-center rounded-lg ${theme.accentBg} ${theme.accent} font-black mb-5`}>0{index + 1}</span>
                <h3 className={`font-bold text-lg mb-3 ${theme.accent}`}>{card.title}</h3>
                <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{card.description}</p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.combination.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.combination.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.combination.description}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <article className={`p-6 md:p-8 rounded-2xl border ${theme.card}`}>
              <div className={`inline-flex w-12 h-12 items-center justify-center rounded-2xl ${theme.accentBg} ${theme.accent} mb-5`}>{icons.figma}</div>
              <h3 className="text-2xl font-bold mb-3">{c.combination.figmaTitle}</h3>
              <p className={`leading-relaxed ${theme.textMuted} mb-6`}>{c.combination.figmaDescription}</p>
              <div className="space-y-4">
                {c.combination.figmaItems.map((item) => (
                  <div key={item.title} className={`border-l-2 border-sky-500 pl-4`}>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{item.description}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className={`p-6 md:p-8 rounded-2xl border ${theme.card}`}>
              <div className={`inline-flex w-12 h-12 items-center justify-center rounded-2xl ${theme.accentBg} ${theme.accent} mb-5`}>{icons.loop}</div>
              <h3 className="text-2xl font-bold mb-3">{c.combination.gstackTitle}</h3>
              <p className={`leading-relaxed ${theme.textMuted} mb-6`}>{c.combination.gstackDescription}</p>
              <div className="space-y-4">
                {c.combination.gstackItems.map((item) => (
                  <div key={item.title} className={`border-l-2 border-emerald-500 pl-4`}>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{item.description}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className={`p-6 md:p-8 rounded-2xl ${theme.accentBg} ${theme.accent} font-medium`}>
            {c.combination.bridge}
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
              {c.architecture.stages.map((stage) => (
                <div key={stage.title} className={`relative p-5 rounded-2xl ${theme.accentBg} border ${theme.border}`}>
                  <h3 className="font-bold mb-2">{stage.title}</h3>
                  <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{stage.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="handoff-workflow"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeInUp}
          className="mb-20 md:mb-32 scroll-mt-24"
        >
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.workflow.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.workflow.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.workflow.description}</p>
          </div>

          <div className="relative pl-6 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-12">
            {c.workflow.steps.map((step) => (
              <div key={step.title} className="relative">
                <div className={`absolute -left-[31px] md:-left-[39px] w-4 h-4 rounded-full bg-sky-500 ring-4 ${isLightMode ? 'ring-white' : 'ring-[#0f172a]'}`}></div>
                <div className="grid lg:grid-cols-[1fr_280px] gap-4 items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className={theme.textMuted}>{step.description}</p>
                  </div>
                  <div className="space-y-3 mt-2 lg:mt-0">
                    <div className={`p-3 rounded-xl ${theme.card} border-l-4 border-l-sky-500`}>
                      <p className="text-xs uppercase tracking-widest text-sky-500 font-bold mb-1">Artifact</p>
                      <p className={`text-sm font-medium ${theme.text}`}>{step.artifact}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${theme.card} border-l-4 border-l-emerald-500`}>
                      <p className="text-xs uppercase tracking-widest text-emerald-500 font-bold mb-1">Gate</p>
                      <p className={`text-sm font-medium ${theme.text}`}>{step.gate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.package.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.package.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.package.description}</p>
          </div>

          <div className={`overflow-x-auto rounded-2xl border ${theme.card}`}>
            <table className="w-full min-w-[900px] text-left">
              <thead className={theme.tableHeader}>
                <tr>
                  <th className="p-4 text-sm font-bold">{c.package.columns.stage}</th>
                  <th className="p-4 text-sm font-bold">{c.package.columns.artifacts}</th>
                  <th className="p-4 text-sm font-bold">{c.package.columns.owner}</th>
                  <th className="p-4 text-sm font-bold">{c.package.columns.gate}</th>
                </tr>
              </thead>
              <tbody>
                {c.package.rows.map((row) => (
                  <tr key={row.stage} className="border-t border-slate-200/70 dark:border-slate-800 align-top">
                    <td className="p-4 font-black text-sky-500">{row.stage}</td>
                    <td className={`p-4 text-sm leading-relaxed ${theme.textMuted}`}>{row.artifacts}</td>
                    <td className={`p-4 text-sm leading-relaxed ${theme.text}`}>{row.owner}</td>
                    <td className={`p-4 text-sm leading-relaxed ${theme.textMuted}`}>{row.gate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.responsibility.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.responsibility.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.responsibility.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <article className={`p-6 md:p-8 rounded-2xl border-t-4 border-t-emerald-500 ${theme.card}`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-emerald-500">{icons.review}</span>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500">{c.responsibility.designerTitle}</h3>
              </div>
              <ul className="space-y-4 list-disc list-inside">
                {c.responsibility.designerItems.map((item) => (
                  <li key={item} className={theme.textMuted}>{item}</li>
                ))}
              </ul>
            </article>

            <article className={`p-6 md:p-8 rounded-2xl border-t-4 border-t-sky-500 ${theme.card}`}>
              <div className="flex items-center gap-3 mb-6">
                <span className={theme.accent}>{icons.code}</span>
                <h3 className={`text-xl font-bold ${theme.accent}`}>{c.responsibility.agentTitle}</h3>
              </div>
              <ul className="space-y-4 list-disc list-inside">
                {c.responsibility.agentItems.map((item) => (
                  <li key={item} className={theme.textMuted}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <blockquote className={`p-6 md:p-8 rounded-2xl border-l-4 border-l-sky-500 ${theme.accentBg} italic text-xl font-medium leading-relaxed ${theme.text}`}>
            {c.responsibility.principle}
          </blockquote>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeInUp} className="mb-20 md:mb-32">
          <div className="mb-12">
            <p className={`text-sm font-bold tracking-widest uppercase mb-3 ${theme.accent}`}>{c.value.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{c.value.title}</h2>
            <p className={`text-lg ${theme.textMuted}`}>{c.value.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {c.value.cards.map((card) => (
              <article key={card.title} className={`p-6 rounded-2xl border-t-4 border-t-sky-500 ${theme.card}`}>
                <p className={`text-sm uppercase tracking-widest font-bold mb-3 ${theme.accent}`}>{card.title}</p>
                <p className="text-3xl font-black mb-3">{card.value}</p>
                <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{card.description}</p>
              </article>
            ))}
          </div>

          <div className={`mt-10 p-6 md:p-8 rounded-xl ${theme.accentBg} ${theme.accent} font-medium text-center text-lg md:text-xl`}>
            {c.value.closing}
          </div>
        </motion.section>
      </div>
    </CaseStudyLayout>
  );
};
