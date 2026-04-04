# System Documentation Rules

## Overview
This document defines the rules and conventions for organizing system documentation, particularly for new features and plans created during plan mode.

---

## Rule 1: Documentation Location & Structure

### 1.1 Location
- **All DOCS files** from new features or documents created from plan mode **MUST** be stored in the `Docs/` folder
- This folder is the **single source of truth** for product designers, developers, and testers
- Reference: `.qwen/skills/product-design-doc/SKILL.md` for creating product/UX documentation

### 1.2 Purpose
The `Docs/` folder serves as the central hub containing:
- Master documents (Feature overview & tracking)
- Product design documents (Part 1 - Product/UX)
- Engineering documentation (Part 2 - Technical implementation)
- QA documentation (Part 3 - Testing strategy)
- Task breakdowns and tracking

---

## Rule 2: File Naming Convention from Git Branch

### 2.1 Branch Name Parsing
**Format branch:** `feature/<ticket-id>_<feature-description>`

**Example:**
- Branch: `feature/1_push-code`
- Extract: `ticket-id = 1`, `feature-description = push-code`

### 2.2 File Naming Format
```
<feature-description>-<ticket-id>_<description>_<yymmdd>_v<major>.<month>.<day>.md
```

**Components:**
- `<feature-description>`: Từ branch name (kebab-case)
- `<ticket-id>`: Số ticket từ branch
- `<description>`: Mô tả ngắn gọn nội dung (kebab-case)
- `<yymmdd>`: Ngày tạo file (năm 2 số + tháng 2 số + ngày 2 số)
- `<major>`: Version major hiện tại của hệ thống
- `<month>`: Tháng update (01-12)
- `<day>`: Ngày update (01-31)

### 2.3 Examples

**Branch:** `feature/1_push-code`
**Created:** April 4, 2026
**System Version:** 1.x.x

```
Master Doc:      push-code-1_master_260404_v1.0.0.md
Product Doc:     push-code-1_product_260404_v1.0.0.md
Engineering Doc: push-code-1_engineering_260404_v1.0.0.md
QA Doc:          push-code-1_qa_260404_v1.0.0.md
Tasks Doc:       push-code-1_tasks_260404_v1.0.0.md
Changelog:       push-code-1_changelog_260404_v1.0.0.md
```

**Update ngày 5/4/2026:**
```
push-code-1_engineering_260405_v1.0.1.md
```

**Update tháng 5/2026:**
```
push-code-1_engineering_260501_v1.5.0.md
```

### 2.4 Versioning Scheme

**Format:** `v<major>.<month>.<day>`

- **Major**: Version hiện tại của hệ thống (tăng khi có release lớn)
- **Month**: Tháng update (01-12, reset khi sang major mới)
- **Day**: Ngày update (01-31, reset khi sang tháng mới)

**Rules tăng version:**
- Mỗi lần update doc → tăng `day`
- Sang tháng mới → reset `day = 0`, tăng `month`
- Major release → reset `month = 0, day = 0`, tăng `major`

**Examples:**
- `v1.0.0` → Initial (major 1)
- `v1.4.4` → Update ngày 4, tháng 4
- `v1.4.5` → Update ngày 5, tháng 4
- `v1.5.0` → Update ngày 1, tháng 5
- `v2.0.0` → Major release 2

---

## Rule 3: Folder Structure

### 3.1 Complete Structure
```
Docs/
├── 00-master/                    # Master documents (create FIRST)
│   └── push-code-1_master_260404_v1.0.0.md
│
├── 01-product/                   # Product Designer reads
│   └── push-code-1_product_260404_v1.0.0.md
│
├── 02-engineering/               # Developers read
│   └── push-code-1_engineering_260404_v1.0.0.md
│
├── 03-qa/                        # QA/Testing reads
│   └── push-code-1_qa_260404_v1.0.0.md
│
├── 04-tasks/                     # Task breakdown (PM/Lead reads)
│   └── push-code-1_tasks_260404_v1.0.0.md
│
└── 05-changelog/                 # Tracking changes
    └── push-code-1_changelog_260404_v1.0.0.md
```

### 3.2 Naming Rules
- Use **kebab-case**: `push-code-1_product.md`
- Prefix by **feature**: `<feature-name>-<ticket>-<type>.md`
- No spaces, no special characters
- Always include version and date suffix

---

## Rule 4: Master Document Template (MANDATORY - Create FIRST)

### 4.1 Master Doc Structure

**File:** `00-master/<feature>-<ticket>_master_<yymmdd>_v<major>.<month>.<day>.md`

```markdown
# Master Document: [Feature Name]

## Metadata
- **Feature ID**: <ticket-number>
- **Branch Name**: feature/<id>_<feature-name>
- **File Naming Convention**: <feature>-<ticket>_<type>_<yymmdd>_v<major>.<month>.<day>.md
- **Created Date**: YYYY-MM-DD HH:mm
- **Last Updated**: YYYY-MM-DD HH:mm
- **Current Version**: v<major>.<month>.<day>
- **Author**: @name
- **Status**: Draft | Review | Approved
- **Approved By**: @name (YYYY-MM-DD)

## 1. Feature Overview
### Problem Statement
[What problem are we solving?]

### Business Context
[Why is this important for the business?]

### Goals & Objectives
- Goal 1
- Goal 2

## 2. Scope
### In-Scope
- Feature 1
- Feature 2

### Out-of-Scope
- Not including X
- Not including Y

## 3. Key Personas (Summary)
### Primary Users
- Persona 1: [Brief description]

### Secondary Users
- Persona 2: [Brief description]

## 4. Success Metrics (KPIs)
- Metric 1: [How to measure]
- Metric 2: [Target value]

## 5. High-Level Timeline
- **Phase 1**: [Description] - [Date range]
- **Phase 2**: [Description] - [Date range]
- **Phase 3**: [Description] - [Date range]

## 6. Stakeholders & Responsibilities
- **Product**: @name
- **Design**: @name
- **Development**: @name
- **QA**: @name
- **Project Manager**: @name

## 7. Related Documents
- **Product Doc**: `01-product/<filename>.md` [link]
- **Engineering Doc**: `02-engineering/<filename>.md` [link]
- **QA Doc**: `03-qa/<filename>.md` [link]
- **Tasks Doc**: `04-tasks/<filename>.md` [link]
- **GitHub Issue**: [URL]
- **Pull Request**: [URL]

## 8. Changelog
| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-04-04 | 10:30 | @dev-name | Initial draft | @lead | Approved |
| v1.4.4 | 2026-04-04 | 15:00 | @dev-name | Added API specs | @tech-lead | Review |

**IMPORTANT**: 
- Every update MUST include time (HH:mm format)
- Track all changes with version increments
- Get reviewer approval for each version

## 9. Approval & Sign-off
- [ ] **Product Lead**: @name - Date: YYYY-MM-DD
- [ ] **Tech Lead**: @name - Date: YYYY-MM-DD
- [ ] **QA Lead**: @name - Date: YYYY-MM-DD
- [ ] **Project Manager**: @name - Date: YYYY-MM-DD

## 10. Notes & Assumptions
- Note 1
- Assumption 1
```

### 4.2 Master Doc Rules
- **MUST** be created BEFORE any detailed docs
- **MUST** be approved before implementation starts
- **MUST** have links to all child docs
- **MUST** maintain changelog with time stamps
- **MUST** have all stakeholder sign-offs

---

## Rule 5: Document Content Standards

### 5.1 Product Design Document (Part 1)
**Reference**: `.qwen/skills/product-design-doc/SKILL.md`

**File:** `01-product/<feature>-<ticket>_product_<yymmdd>_v<major>.<month>.<day>.md`

Must include:
- [ ] Persona definitions (Primary & Secondary users)
- [ ] Scenario (Current state → Desired state → Business impact)
- [ ] Audit (Problem/root cause analysis)
- [ ] Solution (Product goals, UX principles, scope)
- [ ] User Flow (**Mermaid diagram required**)
- [ ] Wireframe (Component layout, responsive breakpoints)
- [ ] Changelog table (with HH:mm timestamps)

### 5.2 Engineering Document (Part 2)
**Reference**: `.qwen/skills/engineering-doc/SKILL.md`

**File:** `02-engineering/<feature>-<ticket>_engineering_<yymmdd>_v<major>.<month>.<day>.md`

Must include:
- [ ] Architecture overview
- [ ] Technical decisions & rationale
- [ ] File-level changes (detailed)
- [ ] API specifications (endpoints, request/response schema)
- [ ] Database schema changes (if applicable)
- [ ] Security considerations
- [ ] Performance implications
- [ ] Migration strategy (if needed)
- [ ] Changelog table (with HH:mm timestamps)

### 5.3 QA Document (Part 3)
**Reference**: `.qwen/skills/qa-doc/SKILL.md`

**File:** `03-qa/<feature>-<ticket>_qa_<yymmdd>_v<major>.<month>.<day>.md`

Must include:
- [ ] Test strategy
- [ ] Test cases (happy path & edge cases)
- [ ] Acceptance criteria (Definition of Done)
- [ ] Performance benchmarks (if applicable)
- [ ] Security tests (if needed)
- [ ] Test data requirements
- [ ] Environment setup
- [ ] Changelog table (with HH:mm timestamps)

### 5.4 Tasks Document
**File:** `04-tasks/<feature>-<ticket>_tasks_<yymmdd>_v<major>.<month>.<day>.md`

```markdown
# Tasks: [Feature Name]

## Metadata
- **Master Doc**: [link]
- **Created**: YYYY-MM-DD HH:mm
- **Last Updated**: YYYY-MM-DD HH:mm

## Phase 1: Setup
- [ ] Task 1.1: [Description] - **Assignee**: @name - **Est**: Xh - **Issue**: [URL]
- [ ] Task 1.2: ...

## Phase 2: Implementation
- [ ] Task 2.1: ...

## Phase 3: Testing & QA
- [ ] Task 3.1: ...

## Phase 4: Deployment
- [ ] Task 4.1: ...

## Dependencies & Blockers
- Dependency 1
- Blocker 1 (if any)

## Changelog
| Version | Date | Time | Author | Changes |
|---------|------|------|--------|---------|
| v1.0.0 | 2026-04-04 | 10:30 | @pm | Initial task breakdown |
```

### 5.5 Changelog Document (Optional - can embed in each doc)
**File:** `05-changelog/<feature>-<ticket>_changelog_<yymmdd>_v<major>.<month>.<day>.md`

If maintaining separate changelog (in addition to embedded changelogs):

```markdown
# Changelog: [Feature Name]

## Master Doc: [link]

| Version | Date | Time | Author | Doc Updated | Description | Reviewed By |
|---------|------|------|--------|-------------|-------------|-------------|
| v1.0.0 | 2026-04-04 | 10:30 | @dev | All | Initial draft | @lead |
| v1.4.4 | 2026-04-04 | 15:00 | @dev | Engineering | Added API specs | @tech-lead |
```

---

## Rule 6: Workflow - Creating Docs from Branch Name

### 6.1 Step-by-Step Workflow

```
Step 1: Parse branch name
  Branch: feature/1_push-code
  → ticket-id = 1
  → feature-description = push-code
  → Date: 260404 (April 4, 2026)
  → Version: v1.0.0

Step 2: Create Master Doc
  → 00-master/push-code-1_master_260404_v1.0.0.md
  → Fill complete template
  → Get stakeholder approval

Step 3: Create Product Doc (after Master approved)
  → 01-product/push-code-1_product_260404_v1.0.0.md
  → Follow product-design-doc skill

Step 4: Create Engineering Doc
  → 02-engineering/push-code-1_engineering_260404_v1.0.0.md
  → Follow engineering-doc skill

Step 5: Create QA Doc
  → 03-qa/push-code-1_qa_260404_v1.0.0.md
  → Follow qa-doc skill

Step 6: Create Tasks Doc
  → 04-tasks/push-code-1_tasks_260404_v1.0.0.md
  → Break down into phases & assign

Step 7: Cross-link all docs
  → Update Master Doc with links to all child docs
  → Add "Related Documents" section in each doc

Step 8: Update version on each change
  → Increment day for each update
  → Log in changelog table with HH:mm timestamp
```

### 6.2 Sequential Order (MANDATORY)

```
1. Master Doc (create & approve FIRST)
       ↓
2. Product Doc (Part 1 - UX)
       ↓
3. Engineering Doc (Part 2 - Tech)
       ↓
4. QA Doc (Part 3 - Testing)
       ↓
5. Tasks Doc (Breakdown & assign)
       ↓
6. Continuous updates with changelog
```

**CRITICAL RULES:**
- ❌ **NEVER** create Product/Engineering/QA docs without Master Doc
- ✅ Master Doc **MUST** be approved before detailed docs
- ✅ Every doc **MUST** have "Related Documents" section with links
- ✅ Every update **MUST** increment version and log in changelog

---

## Rule 7: Cross-References & Links

### 7.1 Related Documents Section (Required in Every Doc)

Every document MUST have this section near the top:

```markdown
## Related Documents
- **Master Doc**: `00-master/<filename>.md` [link]
- **Product Doc**: `01-product/<filename>.md` [link] (if applicable)
- **Engineering Doc**: `02-engineering/<filename>.md` [link] (if applicable)
- **QA Doc**: `03-qa/<filename>.md` [link] (if applicable)
- **Tasks Doc**: `04-tasks/<filename>.md` [link] (if applicable)
- **GitHub Issue**: [URL]
- **Pull Request**: [URL] (during implementation)
```

### 7.2 Referencing Skills
- Always reference the appropriate skill file when creating documentation
- Primary skills:
  - `.qwen/skills/product-design-doc/SKILL.md`
  - `.qwen/skills/engineering-doc/SKILL.md`
  - `.qwen/skills/qa-doc/SKILL.md`

---

## Rule 8: Documentation Updates & Version Control

### 8.1 Version Increment Rules

**When to update version:**
- Every content change → increment `day` by 1
- New month → reset `day = 0`, increment `month`
- Major release → reset `month = 0, day = 0`, increment `major`

**Examples:**
- `v1.4.4` → `v1.4.5` (next day update)
- `v1.4.9` → `v1.5.0` (new month, day reset)
- `v1.12.9` → `v2.0.0` (major release)

### 8.2 Changelog Requirements

**Every doc MUST have:**
- [ ] Changelog table at the end of the file
- [ ] Timestamp in HH:mm format (24-hour)
- [ ] Author name (@mention)
- [ ] Reviewer name (@mention)
- [ ] Brief description of changes
- [ ] Version number incremented

### 8.3 Review Process

1. **Draft** → Author creates/updates content
2. **Review** → Reviewer approves or requests changes
3. **Approved** → Reviewer signs off
4. **Update** → If changes needed, increment version and repeat

**Approval flow:**
- Product Doc → Product Lead reviews
- Engineering Doc → Tech Lead reviews
- QA Doc → QA Lead reviews
- Tasks Doc → Project Manager reviews
- Master Doc → All stakeholders approve

---

## Quick Reference Checklist

### When Creating New Feature Documentation:

**Phase 1: Master Doc**
- [ ] Parse branch name: `feature/<id>_<feature-name>`
- [ ] Create folder: `00-master/`
- [ ] Create file: `<feature>-<id>_master_<yymmdd>_v<major>.<month>.<day>.md`
- [ ] Fill complete Master Doc template
- [ ] Add metadata (version, date, time, author)
- [ ] Add empty changelog table
- [ ] Get stakeholder approval

**Phase 2: Detailed Docs**
- [ ] Create Product Doc (follow product-design-doc skill)
- [ ] Create Engineering Doc (follow engineering-doc skill)
- [ ] Create QA Doc (follow qa-doc skill)
- [ ] Create Tasks Doc (break down & assign)
- [ ] Each doc has changelog with HH:mm timestamps

**Phase 3: Cross-Link & Track**
- [ ] Add "Related Documents" section to each doc
- [ ] Update Master Doc with links to all child docs
- [ ] Create optional separate changelog file
- [ ] Verify all naming conventions match

**Phase 4: Maintenance**
- [ ] Increment version on each update
- [ ] Log all changes with timestamps
- [ ] Get reviews/approvals
- [ ] Update Master Doc when child docs change

---

## Complete Example: "Push Code" Feature

### Branch Info
- **Branch**: `feature/1_push-code`
- **Date**: April 4, 2026
- **System Version**: 1.x.x
- **Initial Version**: v1.0.0

### File Structure
```
Docs/
├── 00-master/
│   └── push-code-1_master_260404_v1.0.0.md
├── 01-product/
│   └── push-code-1_product_260404_v1.0.0.md
├── 02-engineering/
│   └── push-code-1_engineering_260404_v1.0.0.md
├── 03-qa/
│   └── push-code-1_qa_260404_v1.0.0.md
├── 04-tasks/
│   └── push-code-1_tasks_260404_v1.0.0.md
└── 05-changelog/
    └── push-code-1_changelog_260404_v1.0.0.md
```

### Update Example (April 5, 2026)
```
Docs/
├── 02-engineering/
│   ├── push-code-1_engineering_260404_v1.0.0.md  (original)
│   └── push-code-1_engineering_260405_v1.0.1.md  (updated)
└── 05-changelog/
    └── push-code-1_changelog_260405_v1.0.1.md    (updated)
```

---

## References
- Skill templates:
  - `.qwen/skills/product-design-doc/SKILL.md`
  - `.qwen/skills/engineering-doc/SKILL.md`
  - `.qwen/skills/qa-doc/SKILL.md`
- Workflow rules: `.cursor/rules/plan-workflow.mdc` (if applicable)
- Project conventions: `README.md`, `CONTRIBUTING.md`

---

## Appendix: Template Quick Links

- **Master Doc Template**: See Rule 4.1
- **Product Doc Template**: See `.qwen/skills/product-design-doc/SKILL.md`
- **Engineering Doc Template**: See `.qwen/skills/engineering-doc/SKILL.md`
- **QA Doc Template**: See `.qwen/skills/qa-doc/SKILL.md`
- **Tasks Doc Template**: See Rule 5.4
- **Changelog Format**: See Rule 5.5
