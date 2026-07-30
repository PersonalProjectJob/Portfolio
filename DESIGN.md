# Portfolio Workspace — Design System

> Single source of truth for every visual decision in the portfolio workspace.
> Last updated: 2026-07-06

---

## 1. Color Palette

### Primary — Teal

| Token              | Dark Mode (default) | Light Mode          |
| ------------------- | ------------------- | ------------------- |
| `--color-primary`       | `#0d9488` (teal-600)  | `#0f766e` (teal-700)  |
| `--color-primary-light` | `#2dd4bf` (teal-400)  | `#14b8a6` (teal-500)  |
| `--color-primary-dark`  | `#0f766e` (teal-700)  | `#115e59` (teal-800)  |

### Accent — Amber

| Token              | Dark Mode           | Light Mode          |
| ------------------- | ------------------- | ------------------- |
| `--color-accent`       | `#f59e0b` (amber-500) | `#d97706` (amber-600) |
| `--color-accent-light` | `#fcd34d` (amber-300) | `#fbbf24` (amber-400) |
| `--color-accent-dark`  | `#d97706` (amber-600) | `#b45309` (amber-700) |

### Neutral — Slate

| Token                    | Dark Mode                      | Light Mode               |
| ------------------------- | ------------------------------ | ------------------------ |
| `--color-surface`            | `#0f172a` (slate-900)            | `#ffffff`                  |
| `--color-surface-elevated`   | `rgba(30, 41, 59, 0.75)` (slate-800/75) | `rgba(255, 255, 255, 0.9)` |
| `--color-border`             | `rgba(255, 255, 255, 0.10)`      | `#e2e8f0` (slate-200)     |
| `--color-text`               | `#e2e8f0` (slate-200)           | `#1e293b` (slate-800)     |
| `--color-text-muted`         | `#94a3b8` (slate-400)           | `#64748b` (slate-500)     |

### Glow

| Token          | Dark Mode                          | Light Mode                         |
| --------------- | ---------------------------------- | ---------------------------------- |
| `--color-glow` | `rgba(13, 148, 136, 0.25)` (teal)   | `rgba(13, 148, 136, 0.15)` (teal)   |
| `--color-glow-accent` | `rgba(245, 158, 11, 0.20)` (amber) | `rgba(245, 158, 11, 0.12)` (amber) |

---

## 2. Typography

### Font Families

| Role     | Family          | Import                                              |
| -------- | --------------- | ---------------------------------------------------- |
| Display  | **Space Grotesk** | `fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700` |
| Body     | **DM Sans**       | `fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400` |

### Type Scale

| Token      | Size    | Line Height | Weight | Usage                    |
| ---------- | ------- | ----------- | ------ | ------------------------ |
| `text-xs`  | 0.75rem | 1rem        | 400    | Captions, labels         |
| `text-sm`  | 0.875rem| 1.25rem     | 400    | Secondary body, metadata |
| `text-base`| 1rem    | 1.5rem      | 400    | Default body text        |
| `text-lg`  | 1.125rem| 1.75rem     | 500    | Subheadings, emphasis    |
| `text-xl`  | 1.25rem | 1.75rem     | 500    | Card titles              |
| `text-2xl` | 1.5rem  | 2rem        | 600    | Section headings         |
| `text-3xl` | 1.875rem| 2.25rem     | 700    | Page headings            |
| `text-4xl` | 2.25rem | 2.5rem      | 700    | Hero / display headings  |

- **Headings** (`h1`–`h6`): `'Space Grotesk', sans-serif`
- **Body / UI**: `'DM Sans', sans-serif`

### Vietnamese Typography & Semantic Wrapping

- **Semantic Wrapping (Widow/Orphan Control)**: Never allow compound words or meaningful semantic clusters in Vietnamese (e.g., "Thế giới", "Giao dịch", "Sản phẩm") to be broken across lines.
- **Rule**: Use non-breaking spaces (`\u00A0` in TS/JS or `&nbsp;` in HTML) to bind words within a semantic cluster together. Do NOT rely solely on automated css `text-wrap: balance` for Vietnamese texts, as it may incorrectly split semantic clusters.
  - *Correct:* `với thế\u00A0giới\u00A0thực`
  - *Incorrect:* `với thế giới\u00A0thực` (can break "thế" and "giới")

---

## 3. Spacing Scale

Base unit: **4px**

| Token | Value |
| ----- | ----- |
| `1`   | 4px   |
| `2`   | 8px   |
| `3`   | 12px  |
| `4`   | 16px  |
| `5`   | 20px  |
| `6`   | 24px  |
| `8`   | 32px  |
| `10`  | 40px  |
| `12`  | 48px  |
| `16`  | 64px  |

---

## 4. Border Radius

| Token | Value | Usage              |
| ----- | ----- | ------------------ |
| `sm`  | 8px   | Buttons, chips     |
| `md`  | 12px  | Inputs, small cards|
| `lg`  | 16px  | Cards, panels      |
| `xl`  | 24px  | Premium cards, modals |

---

## 5. Shadows

### Card Shadows

```
--shadow-card:        0 10px 40px rgba(0, 0, 0, 0.6),
                      inset 0 1px 1px rgba(255, 255, 255, 0.05);
--shadow-card-hover:  0 15px 50px rgba(0, 0, 0, 0.8),
                      inset 0 1px 1px rgba(255, 255, 255, 0.1);
--shadow-card-light:  0 10px 40px rgba(0, 0, 0, 0.1),
                      inset 0 1px 1px rgba(255, 255, 255, 0.8);
```

### Button Shadows

```
--shadow-button:       0 10px 20px -5px rgba(13, 148, 136, 0.3);
--shadow-button-hover: 0 15px 25px -5px rgba(13, 148, 136, 0.4);
```

### Glow Shadows

```
--shadow-glow-teal:    0 0 30px rgba(13, 148, 136, 0.25);
--shadow-glow-amber:   0 0 30px rgba(245, 158, 11, 0.20);
```

---

## 6. Component Tokens

### `premium-card`

| Property        | Dark Mode                                    | Light Mode                                    |
| --------------- | -------------------------------------------- | --------------------------------------------- |
| Background      | `var(--color-surface-elevated)`               | `rgba(255, 255, 255, 0.8)`                     |
| Backdrop Filter | `blur(40px)`                                  | `blur(40px)`                                   |
| Border          | `1px solid var(--color-border)`               | `1px solid rgba(0, 0, 0, 0.08)`                |
| Border Radius   | `xl` (24px)                                   | `xl` (24px)                                    |
| Box Shadow      | `var(--shadow-card)`                          | `var(--shadow-card-light)`                      |
| Hover Shadow    | `var(--shadow-card-hover)`                    | Lighter elevation                               |
| Transition      | `all 0.5s cubic-bezier(0.4, 0, 0.2, 1)`      | Same                                            |

### `premium-button`

| Property        | Dark Mode                                    | Light Mode                                    |
| --------------- | -------------------------------------------- | --------------------------------------------- |
| Background      | `var(--color-primary)` (#0d9488)              | `#ffffff`                                       |
| Color           | `#ffffff`                                     | `var(--color-primary)`                          |
| Border Radius   | `9999px` (pill)                               | Same                                            |
| Padding         | `1rem 2rem`                                   | Same                                            |
| Box Shadow      | `var(--shadow-button)`                        | `0 10px 20px -5px rgba(0, 0, 0, 0.1)`          |
| Hover Transform | `translateY(-2px)`                            | Same                                            |
| Disabled        | `slate-300` bg, `slate-400` text, no shadow    | `slate-300` bg, `slate-500` text                |

### `cosmic-navbar`

| Property        | Value                                                  |
| --------------- | ------------------------------------------------------ |
| Background      | `var(--color-surface-elevated)` with `blur(20px)`       |
| Border Bottom   | `1px solid var(--color-border)`                         |
| Position        | `fixed` top, full width, `z-50`                         |
| Height          | `64px`                                                  |
| Active Link     | `var(--color-primary)` text + bottom border glow         |
| Inactive Link   | `var(--color-text-muted)` → `var(--color-text)` on hover |

---

## 7. Motion

All animations use **Framer Motion** defaults unless otherwise specified.

### Default Transitions

| Property   | Value                                |
| ---------- | ------------------------------------ |
| Duration   | `0.5s` (page transitions), `0.3s` (micro-interactions) |
| Ease       | `[0.4, 0, 0.2, 1]` (ease-out cubic) |
| Spring     | `{ stiffness: 300, damping: 24 }`    |

### Common Variants

```js
// Fade-up entrance
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
};

// Scale-in
const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

// Stagger children
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};
```

### Hover Micro-interactions

| Element       | Effect                               |
| ------------- | ------------------------------------ |
| Cards         | `scale: 1.02`, shadow elevation      |
| Buttons       | `translateY: -2px`, shadow increase   |
| Links / Icons | `color` transition `0.2s ease`        |
| Nav Items     | Bottom-border glow slide-in           |

---

## 8. Accessibility

- All interactive elements must have `focus-visible` outlines:
  ```css
  *:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  ```
- Minimum contrast ratio: **4.5:1** for body text, **3:1** for large text.
- Theme toggle must be keyboard-accessible and announce state via `aria-label`.
