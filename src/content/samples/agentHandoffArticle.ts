import type { ContentEntry, ContentDocument } from '../../cms/types/cms.types';

export const AGENT_HANDOFF_MARKDOWN = `---
title: "The Agent Handoff Problem"
slug: "agent-handoff"
category: "AI & Automation Engineering"
role: "Multi-Agent Systems Architect"
summary: "Four AI coding agents shared one rule set and one work queue. When the orchestrator ran out of quota mid-task, everything stopped. Here is what it took to fix that: leases, compare-and-swap, separate verifiers, and crash-resume drills."
date: "2026-09-14"
tags: ["Multi-Agent", "Autonomous Orchestration", "Distributed Systems", "Reliability Engineering", "Quality Gates"]
render_mode: "builder"
featured: true
sort_order: 10
pdfUrl: "/documents/agent-handoff.pdf"
---

# Field Notes: The Agent Handoff Problem

Four AI coding agents shared one rule set and one work queue. Only one of them could actually drive the workflow — so when it ran out of quota mid-task, everything stopped. Here is what it took to fix that, and the eight things that turned out to be wrong along the way.

---

## The Setup: Shared Text Was the Easy Half

The starting point was ordinary: a canonical repo holding rule files and skill definitions, symlinked into each agent's config directory. One source of truth, four consumers — a CLI-based coding agent, a second CLI agent from a different vendor, an IDE-based agent, and an editor plugin.

That part worked. What did not work was *knowing when to apply any of it*. Two of the four agents had an empty entry file — the document their runtime reads at session start to learn which rules exist. They had the whole rule library on disk and no index into it.

> **The practical result**: Every task routed back through the one agent that **did** load the rules, because it was the only one that knew they were there. That agent became the orchestrator by accident, not by design.

Fixing that is a rendering problem — generate each agent's entry file from one routing table. An afternoon's work. The interesting problem was what it exposed underneath.

---

## The Real Problem: State Lived in a Conversation, Not a File

With the routing fixed, any agent could read the rules. None of them could *pick up work in progress*. Which branch, which worktree, which step, who was holding it, what had already been verified — all of it existed only in the orchestrating agent's context window.

The obvious fix is a file-based work queue, and one already existed: a task manifest per job, with commands to claim, hand off, and close. That was the state of things when the work started, and the backlog note said the remaining job was to build exactly that queue.

> **The backlog note was wrong.** The queue existed. What it did not have was any notion of *safe* takeover — and that gap is invisible until two agents touch the same task.

---

## What Was Actually Broken: Four Holes in a Queue That Looked Finished

| Command | What it did | Why that fails |
| :--- | :--- | :--- |
| \`claim\` | Refused only when the task was in the \`in-progress\` state. | An agent dying during \`verify\` left a task owned but claimable. Two agents, one task. |
| \`handoff\` | Cleared the owner field unconditionally. | No caller check — anyone could release anyone's task. Takeover with no lock. |
| \`set --state\` | Accepted any state, including the terminal one. | Walked straight past the quality gate that the dedicated close command enforced. |
| \`gate\` | Read one global verification file. | Not bound to task, branch, commit or diff — a stale result could close an unrelated task. |

*Underneath all four*: The verification runner itself returned **pass** when every check was skipped, because it counted failures and found none. A repository with no test script configured produced a green verdict.

---

## The Fix: Borrow Primitives from Distributed Systems

Treat each agent as an unreliable worker competing for a shared record, and the standard distributed systems answers apply directly.

### Slice 1: Leases and Compare-And-Swap (CAS)
Ownership expires. Every mutation carries the version it expects; a lockfile serialises writers and the version is re-read inside the lock. Takeover requires naming the current owner *and* an expired lease. A typed manifest schema makes the required fields explicit instead of conventional.

### Slice 2: Migration, and Splitting the Verifier
The schema change needed a migration path. Separately, the verification runner was split: it now runs read-only and prints structured output, and a *different* party writes the result into the task record.

### Slice 3: A Controller That Emits the Next Action
One read-only command reads the manifest, resolves the role through the existing role-assignment tool, and emits a single machine-readable action: who acts, with which model and sandbox, which command to run, and what marks it complete. An agent joining mid-task asks the controller instead of reading the whole procedure.

### Slice 4: An Adapter That Actually Spawns the Agent
For the one agent invocable from a shell, the adapter really runs it — passing through the model, effort and sandbox named in the action, wrapping the prompt in a filesystem boundary, and applying the state change only on a \`pass\` verdict. For the agents that cannot be scripted, it writes a ready-to-paste prompt file and says so.

---

## Separation of Duties: Three Parties Touch a Verification, Never One

The original design had a single command run the checks and write the verdict. That quietly violated the project's own policy that a verifier holds no write tools — and it meant the agent that wrote the code could also record the judgement on it.

\`\`\`
verifier   →  runs checks read-only, prints JSON to stdout
controller →  ingests that JSON, writes the signed artifact
owner      →  reads the artifact, records the gate verdict

constraint:  controller ≠ executor  and  controller ≠ verifier
\`\`\`

> The artifact is bound to task id, repository, branch, commit and a hash of the diff, and expires after an hour. Feed it to a different task, a different branch, or a tree that has moved since, and the gate refuses it.

---

## Closing Condition: A Drill, Not a Checklist

The reviewing agent set the bar for calling this done: interrupt the orchestrator at *every* transition, have a different agent take over without hand-editing state, and reach completion.

\`\`\`bash
[TAKEOVER] agent-a -> agent-b   state=in-progress   PASS
AGENT_RESULT {"verdict":"pass", ...}
CAS_TRANSITION=APPLIED  expectedVersion=4
DRILL PASS  before=in-progress@4  after=verify@5  next=review
\`\`\`

---

## Eight Assumptions That Did Not Survive Review

1. **Dead configuration**: Grep for the *consumer*, not just the definition. A setting with no reader is a comment.
2. **Order of operations**: Emitting a sentinel and substituting the real text after path rewriting deletes the whole bug class.
3. **Test design**: Scan for actual invocations instead of maintaining hand-written allowlists.
4. **Control group**: A missing row means unknown, not green. Baseline suites must be fully compiled.
5. **Scope of evidence**: Validate across the entire workspace, not just the single file touched.
6. **Migration**: Count live records before enforcing strict validation on storage records.
7. **Verification boundary**: An agent cannot verify its own escape hatch — proof must come from outside the sandbox.
8. **Definition of done**: Artifact exists != failover works. Substituting "artifact is present" for "failure path works" is dangerous.

---

## Deliberate Limits: What Stays Manual

Two of the four agents cannot be driven by a script. Their task-spawning and user-prompting capabilities are runtime features of the host application, not command-line entry points.

So the adapter does not pretend. It writes a prompt file and prints a banner saying the step is manual by design. Name the seam.

Also still manual, on purpose: **committing and merging**. Committer is human.
`;

export const AGENT_HANDOFF_BLOCKS: ContentDocument = {
  schemaVersion: 1,
  blocks: [
    {
      id: 'block-hero-handoff',
      type: 'Hero',
      visible: true,
      data: {
        eyebrow: 'FIELD NOTES // AUTOMATION 04',
        title: {
          en: 'The Agent Handoff Problem',
          vi: 'Bài toán Bàn giao Agent (The Agent Handoff Problem)',
        },
        subtitle: {
          en: 'Four AI coding agents shared one rule set and one work queue. When the orchestrator ran out of quota mid-task, everything stopped. Here is what it took to fix that.',
          vi: 'Bốn AI agent chia sẻ chung một bộ quy tắc và hàng đợi nhiệm vụ. Khi agent điều phối cạn quota giữa chừng, toàn bộ bị đóng băng. Đây là giải pháp giải quyết triệt để.',
        },
        category: 'AI & Automation Engineering',
        role: 'Multi-Agent Systems Architect',
        date: '2026-09-14',
        tags: [
          'Multi-Agent Systems',
          'Distributed Primitives',
          'Lease & CAS',
          'Crash-Resume Drill',
          'Separation of Duties',
        ],
      },
    },
    {
      id: 'block-stats-handoff',
      type: 'Stats',
      visible: true,
      data: {
        sectionTitle: {
          en: 'System Architecture Metrics',
          vi: 'Các Chỉ số Kiến trúc Hệ thống',
        },
        items: [
          {
            id: 'stat-agents',
            value: '4',
            label: {
              en: 'AI Agents Sharing One Rule Layer',
              vi: 'AI Agent Dùng chung 1 Lớp Quy tắc',
            },
            note: 'Claude Code, Codex, Gemini/Antigravity, Cursor',
            changeType: 'positive',
          },
          {
            id: 'stat-slices',
            value: '4',
            label: {
              en: 'Slices to Make Handoff Safe',
              vi: 'Lát cắt Kiến tạo Handoff An toàn',
            },
            note: 'Leases, CAS, Ingestion separation, Subagent Adapters',
            changeType: 'positive',
          },
          {
            id: 'stat-lessons',
            value: '8',
            label: {
              en: 'Hard Assumptions Invalidated by QA',
              vi: 'Giả định Sai lầm Bị Bác bỏ qua Kiểm thử',
            },
            note: '100% Closed via End-to-End Drills',
            changeType: 'neutral',
          },
        ],
      },
    },
    {
      id: 'block-overview-handoff',
      type: 'Overview',
      visible: true,
      data: {
        sectionTitle: {
          en: 'Problem Statement & The SPOF Vulnerability',
          vi: 'Đặt vấn đề & Điểm nghẽn SPOF Của Quá trình Điều phối',
        },
        problem: {
          en: 'All agents could read shared rules on disk, but none could pick up work in progress. Branch state, lease, active step, and verification records existed solely in the orchestrator context window. A single quota timeout or session disconnect halted the entire software delivery pipeline.',
          vi: 'Mọi agent đều đọc được bộ quy tắc chung trên ổ đĩa, nhưng không agent nào có thể tiếp quản công việc đang dở. Trạng thái branch, lease, bước hiện tại và chứng cứ verify chỉ nằm trong context window của orchestrator. Khi orchestrator cạn quota hoặc ngắt phiên, toàn bộ quy trình giao hàng bị tê liệt.',
        },
        solution: {
          en: 'Borrowed battle-tested primitives from distributed systems: File-backed state machine, expiring leases, Compare-And-Swap (CAS) version concurrency, strict separation of duties (verifier != controller != executor), and an automated crash-resume interruption drill.',
          vi: 'Mượn các nguyên mẫu kiểm chứng từ hệ phân tán: State machine lưu trữ trên file, hợp đồng thuê (lease) có thời hạn, kiểm soát đồng thời qua Compare-And-Swap (CAS), phân định ranh giới nghiêm ngặt (verifier != controller != executor) và diễn tập ngắt quãng khôi phục tự động.',
        },
        role: 'Multi-Agent Systems Architect & Prompt Engineer',
        timeline: 'Q3 2026',
        coreMetric: '0 Unsafe Takeovers · 100% Drill Pass Rate',
      },
    },
    {
      id: 'block-callout-state',
      type: 'Callout',
      visible: true,
      data: {
        sectionTitle: {
          en: 'Architectural Epiphany',
          vi: 'Nhận thức Kiến trúc Cốt lõi',
        },
        text: {
          en: 'State must live in a verifiable file, never in an agent conversational context. The backlog note was wrong: the queue existed, but lacked safe takeover semantics — a vulnerability completely invisible until two agents touch the same task.',
          vi: 'Trạng thái công việc phải nằm trong file có thể kiểm chứng, tuyệt đối không được nằm trong bộ nhớ hội thoại của agent. Hàng đợi đã có từ trước, nhưng thiếu cơ chế tiếp quản an toàn — lỗ hổng này vô hình cho đến khi hai agent cùng chạm vào một nhiệm vụ.',
        },
        variant: 'warning',
        glowColor: 'amber',
      },
    },
    {
      id: 'block-process-slices',
      type: 'ProcessSteps',
      visible: true,
      data: {
        sectionTitle: {
          en: 'The 4 Distributed System Slices',
          vi: '4 Lát cắt Kiến trúc Hệ thống Phân tán',
        },
        steps: [
          {
            id: 'slice-1',
            stepNumber: 1,
            title: {
              en: 'Leases and Compare-And-Swap (CAS)',
              vi: 'Lease Thời hạn & Compare-And-Swap (CAS)',
            },
            description: {
              en: 'Ownership expires. Every mutation carries the version it expects. A filesystem lock serializes writers and the version is re-read inside the lock. Takeover requires naming the current owner AND an expired lease.',
              vi: 'Quyền sở hữu có thời hạn hết hạn. Mọi thao tác thay đổi trạng thái đều mang theo version kỳ vọng. File lock tuần tự hóa các bên ghi. Tiếp quản bắt buộc phải chỉ định đúng chủ sở hữu hiện tại và lease đã hết hạn.',
            },
            deliverables: ['Schema v2 Manifest', 'Lockfile Mutex', 'Lease Heartbeat'],
            icon: 'Lock',
          },
          {
            id: 'slice-2',
            stepNumber: 2,
            title: {
              en: 'Data Migration & Verifier Splitting',
              vi: 'Di trú Dữ liệu & Tách biệt Quyền Verifier',
            },
            description: {
              en: 'Schema tightening froze live tasks. Added safe migration commands. Split verification runner: verification is strictly read-only and outputs JSON; an independent party writes the verdict into the manifest.',
              vi: 'Siết chặt schema từng làm đóng băng task đang chạy. Bổ sung lệnh migrate an toàn. Tách bộ chạy verify: verifier chạy chỉ đọc (read-only) và xuất JSON; bên thứ ba độc lập mới được ghi kết quả vào bản ghi.',
            },
            deliverables: ['harness-task migrate', 'Read-only Verifier', 'Signed Gate Artifact'],
            icon: 'ShieldCheck',
          },
          {
            id: 'slice-3',
            stepNumber: 3,
            title: {
              en: 'Action Controller',
              vi: 'Bộ Điều phối Hành động Tự động (Controller)',
            },
            description: {
              en: 'Single read-only command reads the manifest, resolves roles dynamically, and emits a single machine-readable action: who acts, model, sandbox, command, and completion condition.',
              vi: 'Lệnh đọc duy nhất phân tích manifest, tự động phân vai và phát ra hành động định dạng JSON: ai thực hiện, model nào, sandbox ra sao, lệnh cần chạy là gì và tiêu chí hoàn thành.',
            },
            deliverables: ['harness-dispatch next <id>', 'Dynamic Role Assignment', 'Zero Blind Takeover'],
            icon: 'Cpu',
          },
          {
            id: 'slice-4',
            stepNumber: 4,
            title: {
              en: 'Subagent Spawn Adapter & Manual Seam',
              vi: 'Adapter Kích hoạt Agent & Ranh giới Thủ công Rõ ràng',
            },
            description: {
              en: 'Scriptable agents are invoked directly via CLI with sandboxed boundaries and CAS validation. Unscriptable GUI agents get clean, pre-rendered prompt files labeled "Manual by design" — zero fake automation.',
              vi: 'Agent hỗ trợ CLI được gọi thực thi tự động kèm ranh giới sandbox và kiểm tra CAS. Agent trên giao diện GUI nhận file prompt sinh sẵn kèm nhãn "Thủ công có chủ đích" — tuyệt đối không tạo mock giả mạo.',
            },
            deliverables: ['harness-agent-adapter', 'Honest Manual Seams', 'Human Committer Guard'],
            icon: 'Terminal',
          },
        ],
      },
    },
    {
      id: 'block-decisions-lessons',
      type: 'Decision',
      visible: true,
      data: {
        sectionTitle: {
          en: 'What Went Wrong: 8 Hard Lessons From Production',
          vi: 'Bài học Xương máu: 8 Giả định Sụp đổ Sau Review',
        },
        decisions: [
          {
            id: 'lesson-1',
            problem: {
              en: 'Dead Configuration: A restrictive setting was patched, but changed nothing.',
              vi: 'Cấu hình Chết: Vá một thiết lập nhưng hành vi runtime không đổi.',
            },
            choice: {
              en: 'Grep for the consumer, not just the definition. A setting with no reader is just a comment.',
              vi: 'Luôn tìm kiếm nơi tiêu thụ (consumer), không chỉ nơi khai báo. Thiết lập không có ai đọc chỉ là comment.',
            },
            rationale: {
              en: 'The live string was hardcoded elsewhere entirely.',
              vi: 'Chuỗi thực tế đang chạy bị hardcode ở một vị trí hoàn toàn khác.',
            },
            impact: {
              en: 'Eliminated ghost configurations across the harness.',
              vi: 'Dọn sạch các cấu hình rác và đảm bảo tính nhất quán của source code.',
            },
          },
          {
            id: 'lesson-2',
            problem: {
              en: 'Order of Operations: Templates resolved placeholders before per-agent path rewriting.',
              vi: 'Thứ tự Thực thi: Template thay thế biến trước khi viết lại đường dẫn theo từng agent.',
            },
            choice: {
              en: 'Emit a sentinel marker and substitute the real text after path rewriting.',
              vi: 'Dùng sentinel đánh dấu và thay thế chuỗi thật sau khi đã rewrite đường dẫn xong.',
            },
            rationale: {
              en: 'A boundary path was rewritten per agent, causing one agent to be forbidden from reading its own working directory.',
              vi: 'Đường dẫn boundary bị rewrite khiến agent bị cấm đọc chính thư mục làm việc của nó.',
            },
            impact: {
              en: 'Deleted an entire class of path-rewriting race conditions.',
              vi: 'Xóa sổ hoàn toàn lỗi logic phân giải đường dẫn.',
            },
          },
          {
            id: 'lesson-3',
            problem: {
              en: 'Test Design: Allowlist silently excused missing boundary callsites.',
              vi: 'Thiết kế Test: Allowlist viết tay vô tình bỏ qua các vị trí gọi thiếu boundary.',
            },
            choice: {
              en: 'Scan the codebase for actual invocations rather than checking a static list.',
              vi: 'Quét toàn bộ mã nguồn tìm lời gọi thực tế thay vì duy trì allowlist thủ công.',
            },
            rationale: {
              en: 'Four call sites had shipped without boundary checks, silently excused by not being on the list.',
              vi: 'Bốn vị trí gọi đã ship mà không có ranh giới, bị che giấu vì không có tên trong danh sách.',
            },
            impact: {
              en: '100% invocation coverage discovered and verified.',
              vi: 'Phát hiện ngay vị trí thứ năm mà hai lượt review trước đều bỏ sót.',
            },
          },
          {
            id: 'lesson-4',
            problem: {
              en: 'Definition of Done: Artifact exists != failover works.',
              vi: 'Định nghĩa Hoàn thành: Có file artifact != cơ chế phục hồi khi lỗi hoạt động.',
            },
            choice: {
              en: 'Mandate automated crash-resume drills that interrupt the orchestrator at every transition.',
              vi: 'Bắt buộc diễn tập ngắt-phục hồi tự động tại mọi điểm chuyển giao trạng thái.',
            },
            rationale: {
              en: 'A state file existing does not prove another agent can successfully resume without manual edits.',
              vi: 'File state tồn tại không chứng minh được agent khác có thể tiếp quản trơn tru không cần sửa tay.',
            },
            impact: {
              en: 'Drill verified with 6 simulated crash points + 1 live end-to-end LLM call.',
              vi: 'Vượt qua 6 kịch bản ngắt cưỡng bức và 1 lượt gọi agent thật với CAS_TRANSITION=APPLIED.',
            },
          },
        ],
      },
    },
    {
      id: 'block-callout-limits',
      type: 'Callout',
      visible: true,
      data: {
        sectionTitle: {
          en: 'Deliberate Limits & Ethical Safeguards',
          vi: 'Giới hạn Cố ý & Hàng rào Bảo vệ Đạo đức Kỹ thuật',
        },
        text: {
          en: 'Committing and merging remain manual by human design. The role table lists a human for commit/merge, and the controller halts rather than handing code to production. A stub that looks like automation is worse than an honest manual step — name the seam.',
          vi: 'Commit và merge được cố ý giữ quyền kiểm soát của con người. Bảng vai trò chỉ định Human cho bước commit/merge, và controller dừng lại thay vì tự ý đẩy mã nguồn. Một công cụ tự động giả mạo nguy hiểm hơn nhiều so với một bước thủ công trung thực — hãy gọi tên ranh giới đó.',
        },
        variant: 'info',
        glowColor: 'cyan',
      },
    },
  ],
};

export const AGENT_HANDOFF_ENTRY: ContentEntry = {
  id: 'agent-handoff',
  slug: 'agent-handoff',
  route: '/project/agent-handoff',
  title: {
    en: 'The Agent Handoff Problem',
    vi: 'Bài toán Bàn giao Agent (The Agent Handoff Problem)',
  },
  summary: {
    en: 'Four AI coding agents shared one rule set and one work queue. When the orchestrator ran out of quota mid-task, everything stopped. Here is what it took to fix that: leases, compare-and-swap, separate verifiers, and crash-resume drills.',
    vi: 'Bốn AI agent chia sẻ chung một bộ quy tắc và hàng đợi nhiệm vụ. Khi agent điều phối cạn quota giữa chừng, toàn bộ bị đóng băng. Đây là giải pháp giải quyết triệt để: lease, CAS, tách quyền verifier và diễn tập crash-resume.',
  },
  category: 'AI & Automation Engineering',
  role: 'Multi-Agent Systems Architect',
  status: 'published',
  render_mode: 'builder',
  legacy_key: 'agent-handoff',
  template_key: 'standard',
  featured: true,
  sort_order: 10,
  graph_config: {
    shortName: 'Agent Handoff',
    zone: 'automation',
    parentId: 'sync-task-badge',
    edgeType: 'automation-sequence',
    order: 4,
    eyebrow: 'Automation 04',
    positionOverride: { x: 0.28, y: 0.38 },
    noteAnchor: 'top',
  },
  seo: {
    title: 'The Agent Handoff Problem — Multi-Agent Takeover Architecture',
    description: 'Deep architectural dive into solving the multi-agent handoff SPOF using leases, CAS, separate verifiers, and crash-resume drills.',
    og_image: '/images/og-product-figma.jpg',
    keywords: ['AI Agents', 'Multi-Agent Systems', 'Distributed Systems', 'CAS', 'Reliability Engineering'],
  },
  published_document: AGENT_HANDOFF_BLOCKS,
  draft_document: AGENT_HANDOFF_BLOCKS,
  published_at: '2026-09-14T00:00:00Z',
  created_at: '2026-09-14T00:00:00Z',
  updated_at: '2026-09-14T00:00:00Z',
};