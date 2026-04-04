# Product Design với GPT-5.4 + Pencil Extension qua Codex CLI

## 📋 Tổng quan

Tài liệu này mô tả cách **Product Designer subagent** sử dụng **2-stage design process** với **Pencil Extension** trong Cursor thông qua **Codex CLI**:

- **Stage 1 (Wireframe):** `GPT-5.4 Mini (xhigh)` — Layout & structure
- **Stage 2 (Visual UI):** `GPT-5.4 (xhigh)` — Colors, typography, visual polish

**⚠️ Quan trọng:** Stage 2 chỉ bắt đầu SAU KHI user đã approve wireframe từ Stage 1.

## 🏗️ Kiến trúc hoạt động

```
┌─────────────────────────────────────────────────────────────────┐
│  Cursor IDE                                                     │
│                                                                 │
│  ┌──────────────┐    ┌──────────┐    ┌───────────────┐         │
│  │ Qwen Code    │───▶│ Codex    │───▶│ Pencil        │         │
│  │ Terminal     │    │ CLI      │    │ Extension     │         │
│  └──────────────┘    └──────────┘    └───────────────┘         │
│         │                   │                   │               │
│         │  Stage 1:         │  Wireframe        │               │
│         │  GPT-5.4 Mini     │  layout           │               │
│         │  (xhigh)          │                   │               │
│         │                   │                   │               │
│         │  ⏸️ USER APPROVAL │                   │               │
│         │                   │                   │               │
│         │  Stage 2:         │  Visual UI        │               │
│         │  GPT-5.4 (xhigh)  │  mockup           │               │
│         ▼                   ▼                   ▼               │
└─────────────────────────────────────────────────────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
  Wireframe.png  ──▶  ui-mockup.png  ──▶  final-mockup.png
  (Structure)        (Visual polish)      (Final design)
```

## 🎯 Two-Stage Design Process

### **Stage 1: Wireframe (GPT-5.4 Mini xhigh)**

**Mục tiêu:** Tạo layout structure, component placement, spacing

**Focus:**
- ✅ Component hierarchy và layout
- ✅ Responsive breakpoints (mobile, tablet, desktop)
- ✅ Spacing và alignment
- ✅ User flow và navigation structure

**Không focus vào:**
- ❌ Colors (sử dụng grayscale)
- ❌ Typography details
- ❌ Icons và visual elements
- ❌ Shadows, gradients, effects

**Output:**
- `wireframe.pencil` — Editable Pencil file
- `wireframe.png` — PNG export cho review

**Command:**
```bash
codex exec --full-auto -m "gpt-5.4-mini" \
  --prompt "Create Pencil wireframe layout for <feature>.
  Focus: Structure, layout, component placement, spacing.
  Use grayscale colors only. No visual polish needed."
```

### **⏸️ WAIT FOR USER APPROVAL**

Sau khi wireframe hoàn thành:
1. Present wireframe cho user review
2. Document feedback (nếu có)
3. Revise nếu cần (vẫn dùng GPT-5.4 Mini xhigh)
4. ✅ **CHỈ proceed sang Stage 2 khi user approve**

### **Stage 2: Visual UI Design (GPT-5.4 xhigh)**

**Trigger:** User đã approve wireframe từ Stage 1

**Mục tiêu:** Transform wireframe thành visual UI hoàn chỉnh

**Focus:**
- ✅ Color palette và design tokens
- ✅ Typography (font families, sizes, weights)
- ✅ Icons và visual elements
- ✅ Visual hierarchy và contrast
- ✅ Shadows, gradients, borders
- ✅ Micro-interactions (hover states, transitions)

**Output:**
- `ui-mockup.pencil` — Editable Pencil file
- `final-mockup.png` — Final visual design

**Command:**
```bash
codex exec --full-auto -m "gpt-5.4" \
  --prompt "Design visual UI from approved wireframe.
  Wireframe: Docs/01-product/wireframes/<feature>/wireframe.pencil
  Focus: Colors, typography, icons, visual hierarchy, polish.
  Use design tokens: var(--color-primary), var(--spacing-md), etc."
```

## 🔧 Setup Requirements

### 1. **Yêu cầu bắt buộc**

- ✅ **Cursor IDE** đang chạy với Pencil Extension được cài đặt
- ✅ **Qwen Code** chạy trong Cursor Terminal (không phải terminal ngoài)
- ✅ **Codex CLI** đã được cài đặt và hoạt động
- ✅ **Models**: GPT-5.4 (xhigh) và GPT-5.4 Mini (xhigh) được cấu hình

### 2. **Kiểm tra setup**

```bash
# Trong Cursor Terminal, kiểm tra:

# 1. Codex CLI hoạt động
codex --version

# 2. Pencil Extension available trong Cursor
# (Kiểm tra trong Cursor Extensions panel)

# 3. Qwen Code đang chạy trong Cursor
# (Phải mở từ Cursor, không phải terminal riêng)
```

## 🚀 Workflow chi tiết

### **Step 0-2: Chuẩn bị** (Design System Audit, Requirements, Library)

```bash
# Product Designer subagent tự động chạy
# Audit design tokens, đọc requirements, check component library
```

### **STAGE 1: Wireframe Creation**

```bash
# Step 3: Tạo wireframe layout
codex exec --full-auto -m "gpt-5.4-mini" \
  --prompt "Create Pencil wireframe design for <feature-name> (Ticket: #<number>).

  REQUIREMENTS:
  - Use existing component library: Docs/01-product/design-system/job360-library.pencil
  - Reuse components: Button, Input, Card, Modal, Navbar
  - Design name: <feature-name>-<ticket-id>-wireframe
  - Open in new Pencil tab in Cursor

  FOCUS (Structure & Layout ONLY):
  - Component hierarchy và layout structure
  - Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
  - Spacing và alignment
  - User flow và navigation

  CONSTRAINTS:
  - Use GRAYSCALE colors only (no color polish)
  - No shadows, gradients, or visual effects
  - Focus on structure, not visual design
  - Keep it simple and clear"

# Step 4: Export wireframe
codex exec --full-auto -m "gpt-5.4-mini" \
  --prompt "Export wireframe to:
  - PNG: Docs/01-product/wireframes/<feature>/wireframe.png
  - Pencil: Docs/01-product/wireframes/<feature>/wireframe.pencil"
```

### **⏸️ STEP 5: WAIT FOR USER APPROVAL**

```markdown
📋 **Wireframe Review Request**

Wireframe đã hoàn thành với **ChatGPT-5-4-Mini Extra-high**.

📁 **File:** `Docs/01-product/wireframes/<feature>/wireframe.png`
🔗 **Edit:** [Open in Pencil via Codex CLI](<path>)

**Xin vui lòng review và:**
1. ✅ Approve → Sẽ proceed sang Stage 2 (Visual UI)
2. ❌ Request changes → Sẽ revise wireframe
```

### **STAGE 2: Visual UI Design** (AFTER APPROVAL)

```bash
# Step 6: Transform wireframe thành visual UI
codex exec --full-auto -m "gpt-5.4" \
  --prompt "Design visual UI from APPROVED wireframe.

  INPUT:
  - Approved wireframe: Docs/01-product/wireframes/<feature>/wireframe.pencil
  - Feature: <feature-name> (Ticket: #<number>)
  - Design name: <feature-name>-<ticket-id>-visual

  VISUAL DESIGN FOCUS:
  - Color palette: Use design tokens (var(--color-primary), var(--color-secondary))
  - Typography: Font families, sizes, weights, line-height
  - Icons: Material Design icons hoặc custom icons
  - Visual hierarchy: Contrast, emphasis, whitespace
  - Effects: Shadows, borders, gradients (if needed)

  DESIGN SYSTEM:
  - Use existing tokens from Docs/01-product/design-system/
  - Follow component variants (primary, secondary, danger buttons)
  - Maintain accessibility (contrast ratio >= 4.5:1)

  OUTPUT:
  - Save to: Docs/01-product/mockups/<feature>/ui-mockup.pencil
  - Export PNG: Docs/01-product/mockups/<feature>/ui-mockup.png"

# Step 7: Visual polish
codex exec --full-auto -m "gpt-5.4" \
  --prompt "Polish visual design:
  - Refine spacing, alignment, visual balance
  - Add hover states và transition details
  - Optimize visual hierarchy
  - Export final: Docs/01-product/mockups/<feature>/final-mockup.png"
```

## ⚠️ Lưu ý quan trọng

### 1. **PHẢI chạy trong Cursor Terminal**

```bash
# ✅ ĐÚNG: Chạy trong Cursor Terminal
# (Terminal tích hợp trong Cursor IDE)

# ❌ SAI: Chạy trong terminal riêng (CMD, PowerShell ngoài)
# → Sẽ không access được Pencil Extension
```

### 2. **Model Specification - Two-Stage Process**

| Stage | Model | Purpose | When to Use |
|-------|-------|---------|-------------|
| **Wireframe** | `gpt-5.4-mini` (xhigh) | Layout, structure, component placement | Stage 1 (before approval) |
| **Visual UI** | `gpt-5.4` (xhigh) | Colors, typography, icons, polish | Stage 2 (after approval) |

**⚠️ KHÔNG dùng model sai stage:**
- ❌ Không dùng `gpt-5.4` (xhigh) cho wireframe (tốn tokens, không cần thiết)
- ❌ Không dùng `gpt-5.4-mini` cho visual UI (thiếu chi polish)

### 3. **WAIT FOR APPROVAL - Critical Step**

```bash
# Product Designer PHẢI dừng lại sau Stage 1
# Hiển thị wireframe cho user review
# CHỈ continue sang Stage 2 khi user approve

# Nếu user request changes:
# → Revise wireframe (vẫn dùng mini-extra-high)
# → Show lại cho user review
# → Lặp lại đến khi approve
```

### 4. **Component Library Reuse**

```bash
# LUÔN check library trước
if [ -f "Docs/01-product/design-system/job360-library.pencil" ]; then
  echo "✅ Library exists - reuse components"
  codex exec --full-auto -m "gpt-5.4-mini" \
    --prompt "Import from library and reuse..."
else
  echo "🆕 First feature - create base library"
  codex exec --full-auto -m "gpt-5.4-mini" \
    --prompt "Create component library first..."
fi
```

## 🐛 Troubleshooting

### **Error: "Pencil extension not found"**

```bash
# Nguyên nhân: Không chạy trong Cursor Terminal
# Giải pháp:
# 1. Mở Cursor IDE
# 2. Mở terminal trong Cursor (Ctrl+` hoặc View → Terminal)
# 3. Chạy lại command
```

### **Error: "Model not available"**

```bash
# Kiểm tra model specification
# Đảm bảo -m được chỉ định đúng cho từng stage

# Stage 1 - Wireframe:
codex exec --full-auto -m "gpt-5.4-mini" --prompt "..."

# Stage 2 - Visual UI:
codex exec --full-auto -m "gpt-5.4" --prompt "..."
```

### **Error: "Cannot create wireframe"**

```bash
# Kiểm tra:
# 1. Component library đã được import chưa?
# 2. Design spec có đủ thông tin không?
# 3. Pencil extension có đang active trong Cursor không?

# Thử lại với spec chi tiết hơn
codex exec --full-auto -m "gpt-5.4-mini" \
  --prompt "Create Pencil wireframe with DETAILED spec: <very-specific-description>"
```

### **User chưa approve nhưng đã auto sang Stage 2**

```bash
# ⚠️ Đây là workflow error
# Product Designer PHẢI dừng lại ở Step 5 (WAIT FOR APPROVAL)
# Fix: Quay lại wireframe, wait cho user approve
# Sau đó mới run Stage 2 command
```

## 📊 Reporting Template

```markdown
🎨 **Product-Designer Report** (Two-Stage Process)

**Feature:** <feature-name>
**Branch:** <branch-name>
**Issue:** #<issue-number>

## Completed Tasks
✅ Design system audit completed
✅ Component library checked
✅ STAGE 1: Wireframe created (GPT-5.4 Mini xhigh)
⏸️  WAITING for user approval on wireframe
✅ STAGE 2: Visual UI design (GPT-5.4 xhigh) [AFTER APPROVAL]
✅ UI Mockups generated
✅ Design specifications documented
✅ User Flow diagram (Mermaid)
✅ Product Doc updated
✅ Pencil design files saved

## Stage 1: Wireframe (GPT-5.4 Mini xhigh)
📁 Wireframe File: `Docs/01-product/wireframes/<feature>/wireframe.pencil`
📁 Wireframe PNG: `Docs/01-product/wireframes/<feature>/wireframe.png`
🔗 **View/Edit Wireframe:** [Open in Pencil via Codex CLI](<pencil-wireframe-url-or-path>)
- **Model:** GPT-5.4 Mini (xhigh)
- **Focus:** Structure, layout, component placement
- **Approval Status:** ⏸️ Pending / ✅ Approved / ❌ Needs Revision

### Creation Command (Wireframe)
```bash
codex exec --full-auto -m "gpt-5.4-mini" \
  --prompt "Create Pencil wireframe layout: <layout-spec>"
```

## Stage 2: Visual UI Design (GPT-5.4 xhigh)
📁 Mockup File: `Docs/01-product/mockups/<feature>/ui-mockup.pencil`
📁 Final Mockup: `Docs/01-product/mockups/<feature>/final-mockup.png`
🔗 **View/Edit Visual UI:** [Open in Pencil via Codex CLI](<pencil-visual-url-or-path>)
- **Model:** GPT-5.4 (xhigh)
- **Focus:** Colors, typography, icons, visual hierarchy
- **Status:** ⏳ Not started (waiting for wireframe approval) / ✅ Completed

### Creation Command (Visual UI)
```bash
codex exec --full-auto -m "gpt-5.4" \
  --prompt "Design visual UI from approved wireframe: <visual-spec>"
```

## Component Library
- **Status:** Created / Reused / Updated
- **Library File:** `Docs/01-product/design-system/<project>-library.pencil`
- **Components Reused:** <list>
- **New Components Added:** <list or "None">

## Models Used
| Stage | Model | Purpose | Status |
|-------|-------|---------|--------|
| Wireframe | GPT-5.4 Mini (xhigh) | Layout, structure, component placement | ✅ Completed |
| Visual UI | GPT-5.4 (xhigh) | Colors, typography, icons, polish | ⏳ Waiting for approval |

## Key Design Decisions
- Decision 1: <rationale>

## Next Steps
⏳ Waiting for user approval → Frontend/Backend development

## Timestamp
📅 Date: YYYY-MM-DD
⏰ Time: HH:mm
👤 Designer: Product-Designer Agent (via Codex CLI → Pencil)
```

## 📚 Tài liệu tham khảo

- [Subagent Product Designer Rules](../../.qwen/rules/subagent-product-designer.mdc)
- [Product Designer Documentation Rules](../../.qwen/rules/doc-product-designer-rules.md)
- [Product Design Doc Skill](../../.qwen/skills/product-design-doc/SKILL.md)
- [UX/UI Design Skills](../../.qwen/skills/ux-ui/design/SKILL.md)

---

**Cập nhật cuối:** 2026-04-04
**Version:** 1.1.0
**Changes:** Updated model names to GPT-5.4 (xhigh) and GPT-5.4 Mini (xhigh), codex exec commands
