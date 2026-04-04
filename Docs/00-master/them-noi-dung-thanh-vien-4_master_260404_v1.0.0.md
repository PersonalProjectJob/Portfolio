# Master Document: Add Member Content to Landing Page

## Metadata
- **Feature ID**: 4
- **Branch Name**: feature/4_them-noi-dung-thanh-vien
- **File Naming Convention**: them-noi-dung-thanh-vien-4_<type>_260404_v<major>.<month>.<day>.md
- **Created Date**: 2026-04-04 15:30
- **Last Updated**: 2026-04-04 15:30
- **Current Version**: v1.0.0
- **Author**: @dev
- **Status**: Draft
- **Approved By**: TBD

## 1. Feature Overview
### Problem Statement
The landing page currently showcases features, integrations, and a CTA, but lacks social proof and member-focused content. Visitors cannot see the value of joining the community or understand membership benefits.

### Business Context
Adding member content to the landing page will:
- Build trust through social proof (member count, success stories)
- Increase conversion rates by showcasing membership benefits
- Provide transparency about what users gain from joining Job360

### Goals & Objectives
- Add a compelling "Member Section" to the landing page
- Display key member statistics (total members, success rate, etc.)
- Showcase member testimonials with avatars and quotes
- Highlight membership benefits in a structured grid
- Maintain design consistency with existing landing page sections

## 2. Scope
### In-Scope
- Create new `MemberSection` component (`src/app/components/landing/MemberSection.tsx`)
- Add i18n translations for Vietnamese and English
- Integrate component into `LandingPage.tsx`
- Member statistics with animated counters
- Testimonials carousel with 3-4 sample testimonials
- Benefits grid (6 benefits cards)
- Scroll-driven animations (motion/react)
- Responsive design (mobile + desktop)

### Out-of-Scope
- Backend integration for real member data (will use static data for now)
- Authentication-gated member features
- Real-time member count updates
- Video testimonials
- Member profile pages

## 3. Key Personas (Summary)
### Primary Users
- **Job Seekers (25-40 years old)**: Want to see if others have succeeded with Job360 before committing time
- **Career Changers**: Need reassurance that the platform helps people transition successfully

### Secondary Users
- **HR Recruiters**: Want to understand the community size and engagement level
- **Tech Leads**: Reviewing platform credibility before recommending to team members

## 4. Success Metrics (KPIs)
- Member section visible on landing page without console errors
- Smooth animations at 60fps (no jank on scroll)
- Mobile responsive (tested on 375px viewport)
- Bilingual support (VI/EN) with proper translations
- Lighthouse performance score maintained above 90

## 5. High-Level Timeline
- **Phase 1**: Create Master Doc & plan component structure - 2026-04-04
- **Phase 2**: Implement MemberSection component with static data - 2026-04-04
- **Phase 3**: Add i18n translations (VI + EN) - 2026-04-04
- **Phase 4**: Integrate into LandingPage and test - 2026-04-04
- **Phase 5**: QA testing and polish - 2026-04-04

## 6. Stakeholders & Responsibilities
- **Product**: @dev
- **Design**: @dev (using existing design system)
- **Development**: @dev
- **QA**: TBD
- **Project Manager**: @dev

## 7. Related Documents
- **Product Doc**: `01-product/them-noi-dung-thanh-vien-4_product_260404_v1.0.0.md` [link](../01-product/them-noi-dung-thanh-vien-4_product_260404_v1.0.0.md)
- **Engineering Doc**: `02-engineering/them-noi-dung-thanh-vien-4_engineering_260404_v1.0.0.md` [link](../02-engineering/them-noi-dung-thanh-vien-4_engineering_260404_v1.0.0.md)
- **QA Doc**: `03-qa/them-noi-dung-thanh-vien-4_qa_260404_v1.0.0.md` [link](../03-qa/them-noi-dung-thanh-vien-4_qa_260404_v1.0.0.md)
- **Tasks Doc**: `04-tasks/them-noi-dung-thanh-vien-4_tasks_260404_v1.0.0.md` [link](../04-tasks/them-noi-dung-thanh-vien-4_tasks_260404_v1.0.0.md)
- **GitHub Issue**: https://github.com/PersonalProjectJob/Job360/issues/4
- **Pull Request**: TBD

## 8. Changelog
| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-04-04 | 15:30 | @dev | Initial master doc, plan approved | TBD | Draft |
| v1.0.1 | 2026-04-04 | 16:00 | @dev | Added links to all child docs (Product, Engineering, QA, Tasks) | TBD | Review |

## 9. Approval & Sign-off
- [ ] **Product Lead**: @name - Date: YYYY-MM-DD
- [ ] **Tech Lead**: @name - Date: YYYY-MM-DD
- [ ] **QA Lead**: @name - Date: YYYY-MM-DD
- [ ] **Project Manager**: @name - Date: YYYY-MM-DD

## 10. Notes & Assumptions
- Using static data for member statistics and testimonials (no API integration yet)
- Design will follow existing patterns from `FeatureCards`, `IntegrationLogos`, and `LandingCTA`
- Animations will use `motion/react` library (already in dependencies)
- Component will be placed between `IntegrationLogos` and `LandingCTA` sections
- Member count will be displayed as "10,000+" (placeholder until real data)
- Testimonials will be sample data created by the team
