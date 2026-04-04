# QA Document: Add Member Content to Landing Page

## Metadata
- **Feature ID**: 4
- **Branch Name**: feature/4_them-noi-dung-thanh-vien
- **Master Doc**: `00-master/them-noi-dung-thanh-vien-4_master_260404_v1.0.0.md`
- **Product Doc**: `01-product/them-noi-dung-thanh-vien-4_product_260404_v1.0.0.md`
- **Engineering Doc**: `02-engineering/them-noi-dung-thanh-vien-4_engineering_260404_v1.0.0.md`
- **Created Date**: 2026-04-04 15:55
- **Last Updated**: 2026-04-04 15:55
- **Current Version**: v1.0.0
- **Author**: @dev
- **Status**: Draft
- **Reviewed By**: TBD

## Related Documents
- **Master Doc**: `00-master/them-noi-dung-thanh-vien-4_master_260404_v1.0.0.md` [link](../00-master/them-noi-dung-thanh-vien-4_master_260404_v1.0.0.md)
- **Product Doc**: `01-product/them-noi-dung-thanh-vien-4_product_260404_v1.0.0.md` [link](../01-product/them-noi-dung-thanh-vien-4_product_260404_v1.0.0.md)
- **Engineering Doc**: `02-engineering/them-noi-dung-thanh-vien-4_engineering_260404_v1.0.0.md` [link](../02-engineering/them-noi-dung-thanh-vien-4_engineering_260404_v1.0.0.md)
- **Tasks Doc**: `04-tasks/them-noi-dung-thanh-vien-4_tasks_260404_v1.0.0.md` [link](../04-tasks/them-noi-dung-thanh-vien-4_tasks_260404_v1.0.0.md)
- **GitHub Issue**: https://github.com/PersonalProjectJob/Job360/issues/4

---

## Test Strategy

### Scope
- **In-scope**: MemberSection component rendering, i18n translations, responsive design, animations, carousel behavior
- **Out-of-scope**: Backend API testing (no API exists), performance load testing (static content)

### Testing Levels
1. **Unit testing**: Component renders correctly with mock i18n data
2. **Integration testing**: MemberSection integrates with LandingPage without errors
3. **Manual testing**: Visual verification of layout, animations, responsiveness

### Test Environment
- **Browser**: Chrome (latest), Edge (latest)
- **Device emulation**: Chrome DevTools (375px mobile, 768px tablet, 1200px desktop)
- **Node version**: Per project `package.json` requirements

---

## Test Cases

### TC-1: Component Renders Without Errors
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path |
| **Precondition** | App is running, navigate to landing page |

**Steps**:
1. Start dev server: `npm run dev`
2. Open `http://localhost:5173/`
3. Scroll down to MemberSection (between IntegrationLogos and LandingCTA)

**Expected Result**:
- ✅ Section renders without console errors
- ✅ Section label "Cộng đồng" displays (VI locale)
- ✅ Heading "Được tin dùng bởi hàng nghìn người tìm việc" displays
- ✅ Description text is visible
- ✅ No TypeScript type errors in console

---

### TC-2: Statistics Display Correctly
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path |
| **Precondition** | MemberSection is visible |

**Steps**:
1. Locate statistics grid in MemberSection
2. Verify 4 stat cards are rendered

**Expected Result**:
- ✅ Card 1: "10,000+" / "Thành viên"
- ✅ Card 2: "85%" / "Tỉ lệ đậu phỏng vấn"
- ✅ Card 3: "5,000+" / "Đã được tuyển dụng"
- ✅ Card 4: "4.8/5" / "Hài lòng"
- ✅ All cards have neumorphic shadow
- ✅ Cards are evenly spaced

---

### TC-3: Testimonials Carousel Works
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path |
| **Precondition** | MemberSection is visible |

**Steps**:
1. Locate testimonials section
2. Verify first testimonial is visible
3. Wait 5 seconds for auto-scroll
4. Click navigation dots to manually switch

**Expected Result**:
- ✅ First testimonial: "Nguyễn Minh Anh" quote is visible
- ✅ After 5s, carousel transitions to next testimonial
- ✅ Clicking dot #2 shows "Trần Đức Hoàng"
- ✅ Clicking dot #3 shows "Lê Thị Hương"
- ✅ Clicking dot #4 shows "Phạm Văn Long"
- ✅ Transition animation is smooth (400ms)
- ✅ Carousel loops back to first after last

---

### TC-4: Benefits Grid Renders
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path |
| **Precondition** | MemberSection is visible |

**Steps**:
1. Scroll to benefits section
2. Verify 6 benefit cards are rendered

**Expected Result**:
- ✅ Card 1: "Phân tích JD thông minh" with target icon
- ✅ Card 2: "CV Review bởi AI" with fileCheck icon
- ✅ Card 3: "Luyện phỏng vấn" with messageSquare icon
- ✅ Card 4: "Tham khảo lương" with trendingUp icon
- ✅ Card 5: "Lộ trình cá nhân hóa" with route icon
- ✅ Card 6: "Cộng đồng hỗ trợ" with users icon
- ✅ Grid is 3 columns on desktop, 1 column on mobile

---

### TC-5: Language Switching (VI ↔ EN)
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path |
| **Precondition** | App is running, language switcher accessible |

**Steps**:
1. Verify default language is Vietnamese
2. Switch to English via language switcher
3. Verify all text updates to English
4. Switch back to Vietnamese

**Expected Result**:
- ✅ VI: Section label = "Cộng đồng"
- ✅ EN: Section label = "Community"
- ✅ VI: Heading = "Được tin dùng bởi hàng nghìn người tìm việc"
- ✅ EN: Heading = "Trusted by thousands of job seekers"
- ✅ VI: Stat label = "Thành viên"
- ✅ EN: Stat label = "Members"
- ✅ VI: Testimonial names in Vietnamese format
- ✅ EN: Testimonial names in English format
- ✅ VI: Benefit titles in Vietnamese
- ✅ EN: Benefit titles in English
- ✅ No missing translation keys (no `undefined` or raw keys displayed)

---

### TC-6: Responsive Design — Mobile (375px)
| Property | Value |
|----------|-------|
| **Priority** | P1 (High) |
| **Type** | Happy path |
| **Precondition** | Chrome DevTools open, viewport set to 375px |

**Steps**:
1. Set viewport to 375x667 (iPhone SE)
2. Scroll to MemberSection
3. Verify layout adapts

**Expected Result**:
- ✅ Statistics grid: 2 columns (2x2)
- ✅ Benefits grid: 1 column
- ✅ Testimonials: single card visible, horizontally scrollable or swipeable
- ✅ No horizontal overflow
- ✅ Text is readable (no font-size too small)
- ✅ Touch targets are at least 44x44px (navigation dots)

---

### TC-7: Responsive Design — Tablet (768px)
| Property | Value |
|----------|-------|
| **Priority** | P1 (High) |
| **Type** | Happy path |
| **Precondition** | Chrome DevTools open, viewport set to 768px |

**Steps**:
1. Set viewport to 768x1024 (iPad)
2. Scroll to MemberSection
3. Verify layout adapts

**Expected Result**:
- ✅ Statistics grid: 4 columns (single row)
- ✅ Benefits grid: 2 columns
- ✅ Testimonials: 1-2 cards visible depending on width
- ✅ No horizontal overflow
- ✅ Proper padding on left/right edges

---

### TC-8: Scroll Animations Trigger
| Property | Value |
|----------|-------|
| **Priority** | P1 (High) |
| **Type** | Happy path |
| **Precondition** | MemberSection is initially off-screen |

**Steps**:
1. Reload page, stay at top
2. Slowly scroll down to MemberSection
3. Observe entrance animations

**Expected Result**:
- ✅ Section fades in as it enters viewport
- ✅ Stat cards stagger-animate (each appears slightly after previous)
- ✅ Benefits cards fade in with stagger effect
- ✅ No layout shift (CLS < 0.1)
- ✅ Animations are smooth (no jank)

---

### TC-9: No Console Errors
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Edge case |
| **Precondition** | DevTools console open |

**Steps**:
1. Load landing page
2. Scroll through entire page
3. Check browser console for errors/warnings

**Expected Result**:
- ✅ Zero red errors
- ✅ Zero yellow warnings related to MemberSection
- ✅ No "useI18n must be used within I18nProvider" errors
- ✅ No "Cannot read property of undefined" errors

---

### TC-10: Build Succeeds
| Property | Value |
|----------|-------|
| **Priority** | P0 (Critical) |
| **Type** | Happy path |
| **Precondition** | All code committed |

**Steps**:
1. Run `npm run build`
2. Verify build completes without errors

**Expected Result**:
- ✅ Build completes successfully
- ✅ No TypeScript compilation errors
- ✅ No missing imports
- ✅ Output files generated in `dist/` folder

---

## Acceptance Criteria (Definition of Done)

- [ ] All P0 test cases pass (TC-1 through TC-5, TC-9, TC-10)
- [ ] All P1 test cases pass (TC-6 through TC-8)
- [ ] No console errors in development or production build
- [ ] `npm run build` completes successfully
- [ ] Component renders in both VI and EN locales
- [ ] Responsive design verified on mobile (375px), tablet (768px), desktop (1200px)
- [ ] Code follows existing patterns (motion/react, i18n, neumorphic design)
- [ ] No hardcoded values — all text from i18n translations
- [ ] Master Doc, Product Doc, Engineering Doc, QA Doc all created and linked

---

## Performance Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Lighthouse Performance** | > 90 | Run `npm run build` then audit with Lighthouse |
| **First Contentful Paint** | < 1.5s | Lighthouse report |
| **Cumulative Layout Shift (CLS)** | < 0.1 | No layout shifts from animations |
| **Bundle Size Increase** | < 15KB gzipped | Compare `dist/` size before/after |

---

## Security Tests

Not applicable — this feature has no user input, no API calls, and no data storage.

---

## Test Data Requirements

All test data is embedded in i18n translation files:
- Vietnamese: `src/app/lib/locales/vi.ts` → `members` section
- English: `src/app/lib/locales/en.ts` → `members` section

No external test data or mock servers needed.

---

## Environment Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Changelog

| Version | Date | Time (HH:mm) | Author | Description | Reviewed By | Status |
|---------|------|--------------|--------|-------------|-------------|--------|
| v1.0.0 | 2026-04-04 | 15:55 | @dev | Initial QA test plan with 10 test cases | TBD | Draft |
