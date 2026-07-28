# Portfolio case-study visual refresh

1. Keep the completed NEXORA system map, interactive state lab, and verified coverage evidence.
2. Reframe CryptoMap360 around spatial discovery, trust, verified supply, and measured performance.
3. Reframe Nailhub.ai as a role-based nail-industry marketplace with a focused matching journey.
4. Remove unsupported or misleading evidence and align copy with the displayed product screens.
5. Verify type checking, production build, lint, and responsive rendering for all three case studies.

## Mobile case-study remediation

### Design specification

1. Treat every case study as an independent full-screen reading surface on mobile and desktop.
2. Remove the portfolio header and bottom navigation while a case study is open so they cannot obstruct the story.
3. Replace the floating Back control with a sticky, translucent top bar that occupies layout space and respects device safe areas.
4. Keep all primary controls at least 44 x 44 px and expose clear accessible names and current-page state.
5. Preserve the case-study visual themes while using a full-screen loading surface during lazy route transitions.

### Engineering specification

1. Render `CASE_STUDY_*` routes outside `DesktopWorkspace` to remove the parent stacking context instead of adding more z-index overrides.
2. Keep the shared `CaseStudyLayout` responsible for scrolling, safe-area padding, the sticky Back bar, and footer navigation.
3. Add semantic labels to global navigation controls and correct the NEXORA state numbering at the data source.
4. Shorten the Project Journey entrance timing on mobile to reduce the perceived blank transition.
5. Verify lint, TypeScript/build output, console errors, horizontal overflow, overlays, touch targets, and state-tab labels at 360 x 800 and 390 x 844.
