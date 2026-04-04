# Engineering Document: Add Member Content to Landing Page

## Metadata
- **Feature ID**: 4
- **Branch Name**: feature/4_them-noi-dung-thanh-vien
- **Master Doc**: `00-master/them-noi-dung-thanh-vien-4_master_260404_v1.0.0.md`
- **Product Doc**: `01-product/them-noi-dung-thanh-vien-4_product_260404_v1.0.0.md`
- **Created Date**: 2026-04-04 15:50
- **Last Updated**: 2026-04-04 15:50
- **Current Version**: v1.0.0
- **Author**: @dev
- **Status**: Draft
- **Reviewed By**: TBD

## Related Documents
- **Master Doc**: `00-master/them-noi-dung-thanh-vien-4_master_260404_v1.0.0.md` [link](../00-master/them-noi-dung-thanh-vien-4_master_260404_v1.0.0.md)
- **Product Doc**: `01-product/them-noi-dung-thanh-vien-4_product_260404_v1.0.0.md` [link](../01-product/them-noi-dung-thanh-vien-4_product_260404_v1.0.0.md)
- **QA Doc**: `03-qa/them-noi-dung-thanh-vien-4_qa_260404_v1.0.0.md` (TBD)
- **Tasks Doc**: `04-tasks/them-noi-dung-thanh-vien-4_tasks_260404_v1.0.0.md` [link](../04-tasks/them-noi-dung-thanh-vien-4_tasks_260404_v1.0.0.md)
- **GitHub Issue**: https://github.com/PersonalProjectJob/Job360/issues/4

---

## Architecture Overview

### Component Hierarchy
```
LandingPage
├── LandingNav
├── HeroSection
├── FeatureCards
├── StreamingDemo
├── IntegrationLogos
├── MemberSection (NEW)
│   ├── StatisticsGrid (4 StatCards)
│   ├── TestimonialsCarousel
│   │   └── TestimonialCard (×4)
│   └── BenefitsGrid
│       └── BenefitCard (×6)
├── LandingCTA
└── LandingFooter
```

### Technical Approach
- **Frontend-only feature**: No backend API calls, all data from i18n translations
- **Static content**: Member statistics, testimonials, and benefits defined in translation files
- **Animation library**: `motion/react` (already in `package.json` as `motion: 12.23.24`)
- **Responsive**: CSS Grid + media queries via Tailwind classes
- **i18n**: Extend existing `Translations` type in `vi.ts` / `en.ts`

---

## Frontend Section (Frontend-Developer chịu trách nhiệm)

### Components to Create

#### 1. `src/app/components/landing/MemberSection.tsx` (NEW)

**Purpose**: Main container for member section content

**Structure**:
```tsx
export function MemberSection() {
  // useI18n for translations
  // useScroll + useInView for animations
  // useTransform for parallax effects
  
  return (
    <section ref={sectionRef}>
      {/* Header */}
      <motion.div> {/* sectionLabel, heading, description */}</motion.div>
      
      {/* Statistics Grid */}
      <div className="grid">
        {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>
      
      {/* Testimonials */}
      <div>
        <h2>{t.members.testimonials.heading}</h2>
        {/* Carousel with navigation dots */}
      </div>
      
      {/* Benefits Grid */}
      <div>
        <h2>{t.members.benefits.heading}</h2>
        <div className="grid">
          {benefits.map(benefit => <BenefitCard {...benefit} />)}
        </div>
      </div>
    </section>
  )
}
```

**Props**: None (reads from i18n context)

**Dependencies**:
- `motion/react` — animations
- `../../lib/i18n` — translations
- `lucide-react` — icons for benefits
- `../ui/utils` — `cn` utility

#### 2. Sub-components (inline in MemberSection.tsx or separate files)

**StatCard**:
```tsx
interface StatCardProps {
  value: string;
  label: string;
  index: number;
}
```
- Neumorphic card with large value and small label
- Animated entrance (stagger by index)

**TestimonialCard**:
```tsx
interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  isActive: boolean;
}
```
- Avatar placeholder (gradient circle with initials)
- Quote text with quotation marks
- Name and role below

**BenefitCard**:
```tsx
interface BenefitCardProps {
  title: string;
  description: string;
  icon: string; // lucide icon name
  index: number;
}
```
- Icon from lucide-react (mapped by string key)
- Title and description
- Hover effect: lift + shadow change

### UI Specifications (từ Product Doc)

#### Statistics Grid
| Property | Desktop | Mobile |
|----------|---------|--------|
| Columns | 4 | 2 |
| Gap | `var(--spacing-md)` | `var(--spacing-sm)` |
| Value font size | `var(--font-size-h2)` | `var(--font-size-h3)` |
| Label font size | `var(--font-size-body)` | `var(--font-size-small)` |

#### Testimonials Carousel
| Property | Value |
|----------|-------|
| Max cards visible | 1 (mobile) / 3 (desktop) |
| Navigation | Dots + auto-scroll |
| Auto-scroll interval | 5 seconds |
| Transition duration | 400ms |
| Card padding | `var(--spacing-xl)` |

#### Benefits Grid
| Property | Desktop | Tablet | Mobile |
|----------|---------|--------|--------|
| Columns | 3 | 2 | 1 |
| Gap | `var(--spacing-md)` | `var(--spacing-sm)` | `var(--spacing-xs)` |
| Card padding | `var(--spacing-lg)` | `var(--spacing-md)` | `var(--spacing-base)` |

### Icon Mapping

```tsx
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  target: Target,
  fileCheck: FileCheck,
  messageSquare: MessageSquare,
  trendingUp: TrendingUp,
  route: Route,
  users: Users,
};
```

### Implementation Details

#### Animation Strategy
```tsx
// Section entrance
const sectionRef = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
const y = useTransform(scrollYProgress, [0, 0.3], [40, 0]);

// Card entrance (staggered)
const isInView = useInView(cardRef, { once: true, margin: "-40px" });
// CSS class toggled for animation trigger
```

#### Carousel State Management
```tsx
const [activeIndex, setActiveIndex] = useState(0);

// Auto-scroll
useEffect(() => {
  const timer = setInterval(() => {
    setActiveIndex(prev => (prev + 1) % testimonials.length);
  }, 5000);
  return () => clearInterval(timer);
}, [testimonials.length]);
```

#### Responsive Design
- Use Tailwind's `md:` and `lg:` breakpoints
- CSS Grid for layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Statistics: `grid-cols-2 md:grid-cols-4`

### Changelog (Frontend updates)

| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-04-04 | 15:50 | @dev | Initial engineering spec | TBD | Draft |

---

## Backend Section

### API Endpoints
None required for this feature. All data is static (from i18n translations).

### Database Schema
No changes required.

### Business Logic
No server-side logic. Future enhancement may fetch real member statistics from an API.

### Changelog (Backend updates)
No backend changes.

---

## Shared Section (Cả FE & BE cùng tham khảo)

### Security Considerations
- No user input → no XSS risk from testimonials (static content)
- No PII stored → no data privacy concerns
- Avatar placeholders use initials, not real photos (no external image dependencies)

### Performance Implications
- **Bundle size impact**: ~8-12KB gzipped (new component + translations)
- **Animation performance**: Use CSS transforms only (no layout thrashing)
- **Lazy loading**: Not required — component is part of initial page load
- **Lighthouse target**: Maintain score > 90 after addition

### Migration Strategy
Not applicable — this is a new feature, not a migration.

### File Changes Summary

| File | Action | Type | Description |
|------|--------|------|-------------|
| `src/app/components/landing/MemberSection.tsx` | **Create** | Frontend | Main member section component |
| `src/app/lib/locales/vi.ts` | **Modify** | Shared | Add `members` translation keys |
| `src/app/lib/locales/en.ts` | **Modify** | Shared | Add `members` translation keys |
| `src/app/pages/LandingPage.tsx` | **Modify** | Frontend | Import and render MemberSection |

### Type Definitions

Add to `vi.ts` (TypeScript will infer `Translations` type):

```typescript
members: {
  sectionLabel: string;
  heading: string;
  description: string;
  statistics: {
    totalMembersValue: string;
    totalMembersLabel: string;
    successRateValue: string;
    successRateLabel: string;
    jobPlacementsValue: string;
    jobPlacementsLabel: string;
    satisfactionValue: string;
    satisfactionLabel: string;
  };
  testimonials: {
    heading: string;
    items: Array<{
      name: string;
      role: string;
      quote: string;
    }>;
  };
  benefits: {
    heading: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
};
```

---

## Changelog

| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-04-04 | 15:50 | @dev | Initial engineering spec with component architecture | TBD | Draft |
