# Wireframe: Member Section - Feature #4

## Metadata
- **Feature:** Add Member Content to Landing Page
- **Ticket:** #4
- **Branch:** feature/4_them-noi-dung-thanh-vien
- **Design Name:** member-section-feature-4-wireframe
- **Created:** 2026-04-04
- **Model:** ChatGPT-5-4-Mini Extra-high (via Codex CLI - fallback to Qwen)
- **Status:** ⏸️ Pending User Approval

---

## Desktop Wireframe (> 1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Max Width: 1200px | Padding: 80px vertical, 24px horizontal        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  [LABEL] CONG DONG  (small, uppercase, primary color)          │ │
│  │                                                                │ │
│  │  [H2] Duoc tin dung boi hang nghin nguoi tim viec               │ │
│  │  (large, bold, 32px)                                           │ │
│  │                                                                │ │
│  │  [P] Tham gia cong dong professionals da thanh cong...          │ │
│  │  (muted-foreground, 16px)                                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  STATISTICS ROW (4 columns, gap: 24px)                               │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │              │ │              │ │              │ │              ││
│  │   10,000+    │ │     85%      │ │    5,000+    │ │    4.8/5     ││
│  │  (48px bold) │ │  (48px bold) │ │  (48px bold) │ │  (48px bold) ││
│  │              │ │              │ │              │ │              ││
│  │   Members    │ │  Success     │ │   Placed     │ │  Satisfied   ││
│  │  (14px)      │ │   Rate       │ │              │ │              ││
│  │              │ │  (14px)      │ │  (14px)      │ │  (14px)      ││
│  │              │ │              │ │              │ │              ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
│   (neumorphic card, rounded-lg)                                      │
├──────────────────────────────────────────────────────────────────────┤
│  TESTIMONIALS SECTION                                                │
│                                                                      │
│  [H3] Thanh vien noi gi ve chung toi  (24px, centered)               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  ◄  ┌──────┐                                                   │ │
│  │     │      │  "Nho Job360, toi da nhan duoc offer mong muon     │ │
│  │     │ AVT  │   chi sau 2 tuan. AI phan tich JD cua ho cuc       │ │
│  │     │      │   chi tiet, giup toi chuan bi CV va phong van..."  │ │
│  │     └──────┘                                                   │ │
│  │                — Nguyen Minh Anh, Frontend Developer           │ │
│  │                   at VNG Corporation                           │ │
│  │                                                                │ │
│  │                  ◄  ●  ○  ○  ○  ○  ►                          │ │
│  │            (5 carousel dots, current filled)                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│   (wide testimonial card, neumorphic shadow)                         │
├──────────────────────────────────────────────────────────────────────┤
│  BENEFITS GRID (3 columns x 2 rows, gap: 24px)                       │
│                                                                      │
│  [H3] Loi ich khi tham gia  (24px, centered)                         │
│                                                                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │      🎯         │ │      📄         │ │      💬         │        │
│  │                 │ │                 │ │                 │        │
│  │  JD Analysis    │ │   CV Review     │ │  Interview      │        │
│  │                 │ │                 │ │   Practice      │        │
│  │  Phan tich JD   │ │  Danh gia CV    │ │  Luyen phong    │        │
│  │  chi tiet       │ │  tu dong        │ │  van AI         │        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │      📈         │ │      🗺️         │ │      👥         │        │
│  │                 │ │                 │ │                 │        │
│  │  Salary         │ │   Roadmap       │ │  Community      │        │
│  │  Reference      │ │   Personalized  │ │  Supportive     │        │
│  │  Tham khao luong│ │  Lo trinh ca nhan│ │  Ho tro cong    │        │
│  │                 │ │                 │ │  dong            │        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│   (each card: neumorphic, hover effect, icon + title + description)  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Mobile Wireframe (< 768px)

```
┌────────────────────────────┐
│  Padding: 48px vertical,  │
│  16px horizontal           │
│                            │
│  [LABEL] CONG DONG         │
│                            │
│  [H2] Duoc tin dung        │
│  boi hang nghin            │
│  nguoi tim viec            │
│  (24px, may wrap)          │
│                            │
│  [P] Tham gia cong dong... │
│  (14px)                    │
├────────────────────────────┤
│  STATISTICS (2x2 grid)     │
│                            │
│  ┌──────────┐ ┌──────────┐│
│  │  10,000+ │ │   85%    ││
│  │ Members  │ │ Success  ││
│  └──────────┘ └──────────┘│
│  ┌──────────┐ ┌──────────┐│
│  │  5,000+  │ │  4.8/5   ││
│  │ Placed   │ │ Satisfied││
│  └──────────┘ └──────────┘│
├────────────────────────────┤
│  TESTIMONIALS              │
│  (horizontal scroll)       │
│                            │
│  ┌──────────────────────┐ │
│  │ [AVT] "Nho Job360.." │◄┘
│  │         - Minh Anh   │
│  └──────────────────────┘
│         ● ○ ○ ○          │
├────────────────────────────┤
│  BENEFITS (1 column)       │
│                            │
│  ┌──────────────────────┐ │
│  │ 🎯 JD Analysis       │ │
│  │ Phan tich JD...      │ │
│  └──────────────────────┘ │
│  ┌──────────────────────┐ │
│  │ 📄 CV Review         │ │
│  │ Danh gia CV...       │ │
│  └──────────────────────┘ │
│  ┌──────────────────────┐ │
│  │ 💬 Interview Practice│ │
│  │ Luyen phong van...   │ │
│  └──────────────────────┘ │
│  ... (3 more cards)       │
└────────────────────────────┘
```

---

## Component Hierarchy

```
MemberSection (container)
├── SectionHeader
│   ├── Label ("CONG DONG")
│   ├── Heading (H2)
│   └── Description (P)
├── StatisticsRow
│   ├── StatCard (x4)
│   │   ├── Value (large number)
│   │   └── Label (description)
├── TestimonialsCarousel
│   ├── Heading (H3)
│   ├── TestimonialCard (active)
│   │   ├── Avatar
│   │   ├── Quote
│   │   └── Author
│   └── CarouselNavigation (dots + arrows)
└── BenefitsGrid
    ├── Heading (H3)
    └── BenefitCard (x6)
        ├── Icon
        ├── Title
        └── Description
```

---

## Responsive Breakpoints

| Breakpoint | Width | Statistics | Benefits | Testimonials |
|-----------|-------|------------|----------|--------------|
| **Mobile** | < 768px | 2x2 grid | 1 column | Horizontal scroll |
| **Tablet** | 768px - 1024px | 4 columns | 2 columns | Single card |
| **Desktop** | > 1024px | 4 columns | 3 columns | Single wide card |

---

## Spacing & Layout Specs

| Element | Desktop | Mobile |
|---------|---------|--------|
| Section padding | 80px vertical | 48px vertical |
| Container max width | 1200px | 100% - 32px |
| Gap between cards | 24px | 16px |
| Stat card padding | 24px | 16px |
| Benefit card padding | 24px | 20px |
| Heading margin bottom | 16px | 12px |

---

## Neumorphic Shadow Reference

From existing `FeatureCards.tsx`:

```css
/* Outer shadow for cards */
box-shadow: 6px 6px 16px rgba(0,0,0,0.06), -4px -4px 12px rgba(255,255,255,0.8);

/* Hover state (inner shadow) */
box-shadow: inset 4px 4px 12px rgba(0,0,0,0.05), inset -4px -4px 12px rgba(255,255,255,0.8);
```

---

## CSS Variables to Use

All styling must use existing CSS variables from `theme.css`:

```css
/* Colors */
var(--primary)         /* #0B2545 - Navy */
var(--secondary)       /* #4AADE6 - Sky Blue */
var(--muted)           /* #F8FAFC - Light gray */
var(--foreground)      /* Text color */
var(--muted-foreground) /* Secondary text */
var(--background)      /* Page background */

/* Spacing */
var(--spacing-xs)      /* 4px */
var(--spacing-sm)      /* 8px */
var(--spacing-md)      /* 16px */
var(--spacing-lg)      /* 24px */
var(--spacing-xl)      /* 32px */

/* Typography */
var(--font-size-h2)    /* Section heading */
var(--font-size-body)  /* Regular text */
var(--font-size-small) /* Labels, captions */
var(--font-weight-semibold)

/* Other */
var(--radius)          /* Default border radius */
var(--radius-card)     /* Card border radius */
```

---

## Notes for Implementation

1. **Animated counters:** Stat values should animate from 0 on scroll into view
2. **Testimonials:** Use static data for now (4-5 sample testimonials)
3. **Benefits icons:** Use emoji or Lucide icons
4. **Accessibility:** Ensure contrast ratio >= 4.5:1
5. **Performance:** Animations at 60fps, no layout shifts

---

## Changelog

| Version | Date | Time | Author | Description | Status |
|---------|------|------|--------|-------------|--------|
| v1.0.0 | 2026-04-04 | 18:50 | Product-Designer Agent | Initial wireframe layout (ChatGPT-5-4-Mini Extra-high) | ⏸️ Pending Approval |
