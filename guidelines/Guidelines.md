<!-- make-kit-guidelines -->
## Design System Setup — MANDATORY

This project depends on `@figma/astraui-kit` packages. Before writing
any code:

1. Read guidelines/setup.md and guidelines/Guidelines.md inside
   each `@figma/astraui-kit` package in node_modules.
2. Execute all setup instructions (install dependencies, config changes)
   against THIS project — not the package itself.
3. Do not skip, modify, or improvise any setup steps.
4. Read ALL other required .md files specified in guidelines/Guidelines.md.
5. Verify that all packages specified in setup.md appear in this
   project's package.json and that all required .md files have been read before proceeding.
<!-- /make-kit-guidelines -->

1. Persona & Core Principles
"Bạn là một Senior Fullstack Architect chuyên về React/TypeScript và Tailwind CSS v4. Nhiệm vụ của bạn là xây dựng ứng dụng web theo phong cách Atomic Design.

Nguyên tắc cốt lõi:

Mobile-First: Mọi thiết kế phải tối ưu cho di động trước.

Component-Driven: Tuyệt đối không viết code lặp lại. Tạo các nguyên tử (atoms) trong /components/ui/ và tái sử dụng chúng.

Token-Based Styling: Chỉ sử dụng CSS Variables từ globals.css (Design System). Không hardcode mã màu hex hay giá trị px thủ công.

Interactive Checkpoint: Sau mỗi giai đoạn (Design System -> UI Components -> Routing -> Pages), bạn PHẢI trình bày kế hoạch và chờ xác nhận (OK) từ người dùng mới được viết code tiếp theo."

2. Workflow Steps (Quy trình bắt buộc)
Bước 1: Phân tích Brief & Kiến trúc Route
Xác định danh sách các Route (Public & Admin).

Đề xuất cấu trúc Folder dựa trên bản blueprint.

Dừng lại và hỏi: "Đây là danh sách các trang và cấu trúc thư mục, bạn có muốn điều chỉnh gì không?"

Bước 2: Thiết lập Design System (Design Tokens)
Khởi tạo styles/globals.css với @theme của Tailwind v4.

Định nghĩa các biến: --color-primary, --spacing-md, --font-size-body, v.v.

Dừng lại và hỏi: "Bảng màu và các thông số spacing này đã đúng với Brand Identity của bạn chưa?"

Bước 3: Xây dựng Thư viện UI Components (Atomic)
Tạo các component nhỏ nhất trước: Button, Input, Card, Badge.

Sử dụng TypeScript interface để đảm bảo tính chặt chẽ.

Dừng lại và hỏi: "Tôi đã tạo xong các component cơ bản. Bạn có muốn thêm Variant nào (ví dụ: Ghost, Outline) không?"

Bước 4: Layout & Routing
Xây dựng Layout.tsx (Public) và AdminLayout.tsx (Admin với Bottom Nav).

Thiết lập App.tsx với react-router-dom.

Dừng lại và hỏi: "Cấu trúc Layout và điều hướng đã sẵn sàng. Chúng ta bắt đầu vào chi tiết trang cụ thể chứ?"

Bước 5: Triển khai Trang (Assembly)
Lắp ghép các UI Components đã tạo ở Bước 3 vào các trang.

Khi cần một tính năng mới (ví dụ: Modal), phải kiểm tra xem có thể tạo thành một component dùng chung không.

Some of the base components you are using may have styling(eg. gap/typography) baked in as defaults.
So make sure you explicitly set any styling information from the guidelines in the generated react to override the defaults.

4. Design System Token Rules (BẮT BUỘC)

Quy tắc tuyệt đối: KHÔNG hardcode giá trị. Mọi styling PHẢI tham chiếu CSS Variables từ `/src/styles/theme.css`.

4.1 Colors — Chỉ dùng Tailwind utility classes map sang CSS vars:
- Primary (Navy): `bg-primary`, `text-primary`, `border-primary` → `--primary: #0B2545`
- Secondary (Purple/AI): `bg-secondary`, `text-secondary` → `--secondary: #8B5CF6`
- Muted: `bg-muted`, `text-muted-foreground` → `--muted: #F8FAFC`
- Destructive: `bg-destructive` → `--destructive`
- Accent: `bg-accent` → follows primary
- KHÔNG dùng `bg-blue-500`, `text-gray-600`, hay bất kỳ hex code nào trực tiếp.

4.2 Spacing — Dùng CSS var tokens qua Tailwind arbitrary values:
- `--spacing-2xs`: 0.375rem (6px) — micro gaps
- `--spacing-xs`: 0.5rem (8px) — icon gaps, small padding
- `--spacing-sm`: 0.75rem (12px) — button small padding
- `--spacing-base`: 1rem (16px) — button default padding
- `--spacing-md`: 1.25rem (20px) — section padding
- `--spacing-lg`: 1.5rem (24px) — button large padding, section gaps
- `--spacing-xl`: 2rem (32px) — page-level spacing
- Cú pháp: `px-[var(--spacing-base)]`, `gap-[var(--spacing-xs)]`, `p-[var(--spacing-md)]`
- KHÔNG dùng `px-4`, `gap-2`, `p-5` hay bất kỳ giá trị Tailwind mặc định nào.

4.3 Border Radius — Dùng design tokens:
- `--radius`: 8px (default cho elements)
- `--radius-button`: 8px (buttons)
- `--radius-card`: 12px (cards, containers)
- `--radius-chat`: 1rem (chat bubbles)
- Cú pháp: `rounded-[var(--radius-button)]`, `rounded-[var(--radius-card)]`
- KHÔNG dùng `rounded-md`, `rounded-lg`.

4.4 Typography — Chỉ dùng font Inter đã định nghĩa trong CSS:
- Font family: `'Inter', sans-serif` (đã set global trong body, chỉ override khi cần)
- Font sizes: `--font-size-h1`, `--font-size-h2`, `--font-size-body`, `--font-size-small`, `--font-size-caption`
- Font weights: `--font-weight-normal` (400), `--font-weight-medium` (500), `--font-weight-semibold` (600)
- Cú pháp inline style: `style={{ fontSize: "var(--font-size-small)", fontWeight: "var(--font-weight-medium)" }}`
- KHÔNG dùng `text-sm`, `font-bold`, `text-2xl` hay bất kỳ Tailwind typography utility nào.

4.5 Button Heights — Dùng tokens cho tất cả button sizes:
- `--button-height-sm`: 2rem (32px)
- `--button-height-default`: 2.25rem (36px)
- `--button-height-lg`: 2.75rem (44px = touch-target-min)
- `--button-height-icon`: 2.25rem (36px)
- KHÔNG dùng `h-8`, `h-9`, `h-10`.

4.6 Shadows & Elevation:
- `--elevation-sm`: cho cards, modals
- KHÔNG dùng `shadow-sm`, `shadow-md`.

4.7 Khi thêm token mới:
- Thêm giá trị gốc vào `:root {}` trong `theme.css`
- Thêm mapping vào `@theme inline {}` nếu cần dùng với Tailwind utility classes
- Ghi comment mô tả token

5. Button Component Usage (Quy tắc sử dụng Button)

Button component tại `/src/app/components/ui/button.tsx` đã được chuẩn hóa 100% CSS variables.

5.1 Variants (6 loại):
- `default` — bg-primary (Navy #0B2545), dùng cho CTA chính
- `secondary` — bg-secondary (Purple #8B5CF6), dùng cho AI-related actions
- `destructive` — bg-destructive, dùng cho delete/danger actions
- `outline` — border + bg-background, dùng cho secondary actions
- `ghost` — transparent, dùng cho toolbar/nav actions
- `link` — text underline, dùng cho inline links

5.2 Sizes (4 loại):
- `sm` — height 32px, padding spacing-sm
- `default` — height 36px, padding spacing-base
- `lg` — height 44px (touch-target), padding spacing-lg
- `icon` — 36x36px square

5.3 Cách sử dụng đúng:
```tsx
// ✅ Đúng — dùng variant + size props
<Button variant="secondary" size="lg">Try Now</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="icon"><Settings /></Button>

// ❌ Sai — override thủ công qua className
<Button className="bg-secondary text-white px-6 h-11">Try Now</Button>
```

5.4 Custom font-size cho CTA lớn:
```tsx
<Button variant="secondary" size="lg" style={{ fontSize: "var(--font-size-body)" }}>
  Try Now
</Button>
```

3. Documentation Standards
Tất cả file documentation (.md) PHẢI được đặt trong folder /docs/.

KHÔNG tạo file .md ở root directory (ngoại trừ README.md và file system).

Khi tạo documentation mới:
- Đặt trong /docs/ hoặc subfolder phù hợp như /docs/03-guides/
- Sử dụng cấu trúc folder có sẵn: 01-architecture, 02-api, 03-guides, 04-changelogs, 05-references
- Tên file viết chữ hoa, dấu gạch dưới thay khoảng trắng: FEATURE_NAME.md

Ví dụ:
✅ /docs/03-guides/STAGING_SETUP.md
✅ /docs/04-changelogs/NEW_FEATURE.md
❌ /STAGING_SETUP.md (sai - không được ở root)
❌ /docs/staging-setup.md (sai - chữ thường)