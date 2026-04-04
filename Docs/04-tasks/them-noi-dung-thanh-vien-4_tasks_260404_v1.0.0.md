# Tasks: Add Member Content to Landing Page

## Metadata
- **Master Doc**: `00-master/them-noi-dung-thanh-vien-4_master_260404_v1.0.0.md`
- **Created**: 2026-04-04 15:30
- **Last Updated**: 2026-04-04 15:30

## Phase 1: Component Setup
- [ ] Task 1.1: Create MemberSection.tsx component skeleton - **Assignee**: @dev - **Est**: 0.5h
- [ ] Task 1.2: Set up component structure with proper imports - **Assignee**: @dev - **Est**: 0.25h

## Phase 2: Implementation
- [ ] Task 2.1: Build member statistics section with animated counters - **Assignee**: @dev - **Est**: 1h
  - Stats: Total members, success rate, job placements, satisfaction rate
  - Use motion/react for number animation on scroll
- [ ] Task 2.2: Build testimonials carousel - **Assignee**: @dev - **Est**: 1.5h
  - 3-4 testimonial cards with avatar, name, role, quote
  - Auto-scroll + manual navigation
  - Smooth transitions
- [ ] Task 2.3: Build benefits grid - **Assignee**: @dev - **Est**: 1h
  - 6 benefit cards with icons
  - Grid layout (3 columns desktop, 1 column mobile)
  - Hover effects and animations
- [ ] Task 2.4: Add scroll-driven entrance animations - **Assignee**: @dev - **Est**: 0.5h
  - UseInView hooks for fade-in on scroll
  - Staggered animations for cards

## Phase 3: i18n & Translations
- [ ] Task 3.1: Add Vietnamese translations to vi.ts - **Assignee**: @dev - **Est**: 0.5h
  - Section label, heading, description
  - Statistics labels and values
  - Testimonial content
  - Benefits grid items
- [ ] Task 3.2: Add English translations to en.ts - **Assignee**: @dev - **Est**: 0.5h
  - Mirror VI structure with EN content

## Phase 4: Integration
- [ ] Task 4.1: Import MemberSection into LandingPage.tsx - **Assignee**: @dev - **Est**: 0.25h
- [ ] Task 4.2: Position between IntegrationLogos and LandingCTA - **Assignee**: @dev - **Est**: 0.25h
- [ ] Task 4.3: Verify responsive design on mobile/tablet/desktop - **Assignee**: @dev - **Est**: 0.5h

## Phase 5: Testing & QA
- [ ] Task 5.1: Test component renders without errors - **Assignee**: @dev - **Est**: 0.25h
- [ ] Task 5.2: Test language switching (VI ↔ EN) - **Assignee**: @dev - **Est**: 0.25h
- [ ] Task 5.3: Test animations and scroll behavior - **Assignee**: @dev - **Est**: 0.25h
- [ ] Task 5.4: Test mobile responsiveness (375px viewport) - **Assignee**: @dev - **Est**: 0.25h
- [ ] Task 5.5: Run build to ensure no compile errors - **Assignee**: @dev - **Est**: 0.25h

## Dependencies & Blockers
- No external dependencies (all libraries already installed)
- No API integration required (static data only)
- Design tokens available via CSS variables

## Changelog
| Version | Date | Time | Author | Changes |
|---------|------|------|--------|---------|
| v1.0.0 | 2026-04-04 | 15:30 | @dev | Initial task breakdown |
