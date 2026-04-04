# Member Section Wireframe Spec

## Status
- Requested workflow: Pencil MCP wireframe creation
- Actual environment result on 2026-04-04 18:10: Pencil MCP tool calls returned `user cancelled MCP tool call`
- Fallback artifact in this folder is the implementation-ready wireframe package for Feature #4

## Feature Scope
- Insert new `MemberSection` between `IntegrationLogos` and `LandingCTA`
- Sequence inside section: intro header -> stats row -> testimonial carousel -> benefits grid
- Preserve existing landing page rhythm: large section padding, centered container, neumorphic cards, motion/react entry animations

## Reuse vs New
- Reuse visual patterns from: `FeatureCards`, `IntegrationLogos`, `LandingCTA`
- Reuse tokens from: `src/styles/theme.css`
- New React components:
  - `MemberSection`
  - `StatCard`
  - `TestimonialCard`
  - `BenefitCard`

## Desktop Layout
- Container width: `max-width: 1200px`
- Vertical spacing:
  - Section top/bottom padding: `6rem`
  - Header to stats: `2rem`
  - Stats to testimonials: `3rem`
  - Testimonials to benefits: `3rem`
- Header block:
  - Section label aligned center
  - H2 headline max width about `720px`
  - Supporting paragraph max width about `560px`
- Stats row:
  - 4 equal cards in one row
  - Card order: Members, Success Rate, Placements, Satisfaction
  - Each card contains number, short label, optional helper line
- Testimonial area:
  - One featured card visible at a time
  - Left: avatar circle and member meta
  - Right: quote block with navigation arrows and dot indicators
  - Carousel should not change section height between slides
- Benefits grid:
  - 3 columns x 2 rows
  - Card content: icon, benefit title, 2-line explanation

## Mobile Layout
- Container side padding: `24px`
- Sequence preserved, all content stacks vertically
- Stats row becomes 2 columns x 2 rows
- Testimonial card collapses into single-column card:
  - avatar + name + role
  - quote
  - dots below quote
- Benefits grid becomes 1 column x 6 rows

## Tablet Layout
- Stats row stays 2 columns x 2 rows
- Testimonial card remains single featured card
- Benefits grid becomes 2 columns x 3 rows

## Interaction Notes
- Stats animate count-up on first scroll into view only
- Testimonial carousel supports:
  - auto-advance
  - previous/next arrows
  - dot navigation
- Benefit cards use subtle hover lift on desktop only
- Section reveal order:
  - header
  - stats stagger
  - testimonial card
  - benefits stagger

## Copy Inventory
- Section label
- Section headline
- Section description
- 4 stat labels
- 3 or 4 testimonial objects: quote, name, role
- 6 benefit titles + descriptions

## Implementation Guardrails
- No hardcoded hex colors in new component
- Reuse existing neumorphic shadow values already present in landing components
- Keep testimonials text length bounded to avoid layout jump
- Keep mobile quote length within 4-5 lines before truncation strategy is needed

## Files In This Fallback Package
- `member-section-wireframe.svg`
- `member-section-wireframe-spec.md`
