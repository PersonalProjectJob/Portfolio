# Design Token Specification

> **Single Source of Truth** — Tài liệu này là chuẩn duy nhất cho mọi quyết định spacing, typography, và layout trong dự án Portfolio.
> 
> Chuẩn tham chiếu: [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)

---

## 1. Layout Margins (Apple HIG: "Margins")

Apple HIG quy định **layout margins** (khoảng cách từ rìa màn hình đến nội dung):

| Size Class | Apple HIG | Tailwind Mobile | Tailwind Desktop |
|---|---|---|---|
| **Compact** (iPhone Portrait) | **16pt** leading/trailing | `px-4` (16px) | — |
| **Regular** (iPhone Landscape / iPad) | **20pt** leading/trailing | — | `sm:px-6` (24px) |
| **Wide** (Desktop / Large iPad) | **Centered max-width** | — | `md:px-12` (48px) |

### Áp dụng cho dự án:

```
Container padding chuẩn = px-4 sm:px-6 md:px-12
```

> [!IMPORTANT]
> Đây là giá trị đã dùng trong `CaseStudyLayout.tsx`. Tất cả trang content phải tuân theo pattern này.

---

## 2. Safe Areas (Apple HIG: "Safe Area")

| Vùng | Giá trị | CSS | Ghi chú |
|---|---|---|---|
| **Top** (Status Bar + Dynamic Island) | 59pt (iPhone 15 Pro) | `env(safe-area-inset-top)` | Áp dụng cho sticky headers |
| **Bottom** (Home Indicator) | 34pt | `env(safe-area-inset-bottom)` | Áp dụng cho Bottom Tab Bar |
| **Left/Right** (Landscape notch) | 0-47pt | `env(safe-area-inset-left/right)` | Không cần cho portrait-only |

### Prerequisite:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### Áp dụng cho dự án:

| Component | CSS | Status |
|---|---|---|
| `CaseStudyLayout` header | `style={{ paddingTop: 'env(safe-area-inset-top)' }}` | ✅ |
| `MobileNavigation` | `paddingBottom: 'env(safe-area-inset-bottom, 0px)'` | ✅ |
| `CaseStudyLayout` content | `pb-[calc(3rem+env(safe-area-inset-bottom))]` | ✅ |

---

## 3. Touch Targets (Apple HIG: "Pointing & Clicking")

| Quy tắc | Giá trị | Tailwind |
|---|---|---|
| **Minimum tap area** | **44×44pt** | `min-h-[44px] min-w-[44px]` hoặc `.touch-target` |
| **Comfortable tap area** | 48×48pt | `min-h-[48px] min-w-[48px]` |
| **Minimum gap** giữa 2 targets | **8pt** | `gap-2` (8px) trở lên |

---

## 4. Typography Scale (Apple HIG: "Typography")

Apple HIG Dynamic Type scale mapping sang web (Plus Jakarta Sans):

| HIG Style | Apple Size | Web Mobile | Web Desktop | Tailwind Mobile | Tailwind Desktop | Dùng cho |
|---|---|---|---|---|---|---|
| **Large Title** | 34pt | 30px | 48-60px | `text-3xl` | `text-5xl`/`text-6xl` | Hero headings |
| **Title 1** | 28pt | 24px | 36px | `text-2xl` | `text-4xl` | Page titles |
| **Title 2** | 22pt | 20px | 28px | `text-xl` | `text-2xl` | Section titles |
| **Title 3** | 20pt | 18px | 24px | `text-lg` | `text-xl` | Sub-section headers |
| **Headline** | 17pt bold | 16px bold | 18px bold | `text-base font-bold` | `text-lg font-bold` | Card headers |
| **Body** | 17pt | 16px | 18px | `text-base` | `text-lg` | Paragraph text |
| **Callout** | 16pt | 15px | 16px | `text-[15px]` | `text-base` | Descriptions |
| **Subheadline** | 15pt | 14px | 15px | `text-sm` | `text-[15px]` | Metadata |
| **Footnote** | 13pt | 13px | 14px | `text-[13px]` | `text-sm` | Helper text |
| **Caption 1** | 12pt | 12px | 13px | `text-xs` | `text-[13px]` | Tags, labels |
| **Caption 2** | 11pt | 11px | 12px | `text-[11px]` | `text-xs` | **Minimum legible** |

> [!CAUTION]
> **Font size dưới 11px KHÔNG ĐƯỢC SỬ DỤNG.** Apple HIG xác định 11pt là ngưỡng tối thiểu.

---

## 5. Spacing Scale (Apple HIG: 8pt Grid)

### 5.1 Base Scale

| Token | Value | Tailwind | Dùng cho |
|---|---|---|---|
| `space-xxs` | 4px | `gap-1` | Icon-to-text |
| `space-xs` | 8px | `gap-2` | Tight inline |
| `space-sm` | 12px | `gap-3` | Button padding, list gap |
| `space-md` | 16px | `gap-4` | Container margin (compact), card gap |
| `space-lg` | 24px | `gap-6` | Card padding mobile, section gap |
| `space-xl` | 32px | `gap-8` | Card padding desktop, grid gap |
| `space-2xl` | 48px | `gap-12` | Section inner gap |
| `space-3xl` | 64px | `p-16` | Section padding mobile |
| `space-4xl` | 96px | `p-24` | Section padding desktop |

### 5.2 Section Spacing

| Context | Mobile | Desktop | **Tailwind chuẩn** |
|---|---|---|---|
| Section padding | 64px | 96px | **`py-16 md:py-24`** |
| Hero top clearance | 80px | 96px | **`pt-20 md:pt-24`** |
| Page bottom | 80px | 128px | **`pb-20 md:pb-32`** |
| Header-to-content gap | 48px | 64px | **`mb-12 md:mb-16`** |

### 5.3 Card Spacing

| Context | Mobile | Desktop | **Tailwind chuẩn** |
|---|---|---|---|
| Card padding (standard) | 24px | 32px | **`p-6 md:p-8`** |
| Card padding (large) | 32px | 48px | **`p-8 md:p-12`** |
| Card-to-card gap | 16-24px | 24-32px | **`gap-4 md:gap-6`** |
| Card inner element gap | 8-12px | 12-16px | **`gap-2 md:gap-3`** |

### 5.4 Component Spacing

| Context | Mobile | Desktop | **Tailwind chuẩn** |
|---|---|---|---|
| Button padding (primary) | 12px 20px | 16px 24px | **`px-5 py-3 md:px-6 md:py-4`** |
| Badge/tag padding | 4px 12px | 8px 12px | **`px-3 py-1 md:py-2`** |
| List item gap | 8px | 12px | **`space-y-2 md:space-y-3`** |
| Paragraph spacing | 24px | 24px | **`mb-6`** |
| Heading to paragraph | 16-24px | 24px | **`mb-4 md:mb-6`** |

---

## 6. Navigation (Apple HIG: "Tab Bars")

| Property | Apple HIG | Dự án |
|---|---|---|
| Tab Bar height | 49pt (compact) | 54px + safe area |
| Total with safe area | 83pt | 88px |
| Max tabs | 5 | 3 ✅ |
| Icon + Label | Required | ✅ |
| Active distinction | Filled/tint | Glow + color ✅ |

---

## 7. Content Width

| Breakpoint | Width | Tailwind |
|---|---|---|
| Mobile (< 640px) | Full - margins | `w-full px-4` |
| Tablet (640-768px) | Full - margins | `w-full sm:px-6` |
| Desktop (768-1280px) | Max 1152px | `max-w-6xl mx-auto md:px-12` |
| Wide (> 1280px) | Max 1280px | `max-w-7xl mx-auto` |

---

## 8. CSS Utility Classes

Implement trong `index.css`:

```css
@layer utilities {
  .section-padding   { @apply py-16 md:py-24; }
  .hero-padding      { @apply pt-20 md:pt-24; }
  .page-bottom       { @apply pb-20 md:pb-32; }
  .container-padding { @apply px-4 sm:px-6 md:px-12; }
  .card-padding      { @apply p-6 md:p-8; }
  .card-padding-lg   { @apply p-8 md:p-12; }
  .touch-target      { min-height: 44px; min-width: 44px; }
}
```

---

## 9. Checklist cho mỗi trang mới

- [ ] Hero có `hero-padding` (`pt-20 md:pt-24`)?
- [ ] Mỗi section dùng `section-padding` (`py-16 md:py-24`)?
- [ ] Container dùng `container-padding` (`px-4 sm:px-6 md:px-12`)?
- [ ] Cuối trang có `page-bottom` (`pb-20 md:pb-32`)?
- [ ] Cards dùng `card-padding` (`p-6 md:p-8`) hoặc `card-padding-lg` (`p-8 md:p-12`)?
- [ ] Font nhỏ nhất ≥ `text-[11px]`?
- [ ] Buttons/links có `.touch-target` hoặc `min-h-[44px]`?
- [ ] `viewport-fit=cover` trong index.html?
