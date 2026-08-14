/**
 * High-Fidelity Sample Markdown Case Study Content
 * Demonstrates frontmatter ingestion, headings, typography, code blocks, tables, and zoomable imagery.
 */
export const SAMPLE_MARKDOWN_CASE_STUDY = `---
title: "AI-Augmented Design Tokens & Automation Pipeline"
slug: "ai-design-system-spec"
category: "Design Systems & Tooling"
role: "Principal Design Technologist"
summary: "Kiến trúc hệ thống token đa nền tảng kết hợp AI Agent giúp rút ngắn 70% thời gian chuyển đổi từ bản vẽ Figma sang mã nguồn React/Tailwind chuẩn chỉ."
coverImage: "/images/og-product-figma.jpg"
date: "2026-08-14"
tags: ["Design Tokens", "React 19", "Tailwind v4", "AI Agents", "Figma Console"]
render_mode: "markdown"
featured: true
sort_order: 10
---

# Tổng Quan Dự Án & Bối Cảnh

Trong quá trình phát triển các sản phẩm fintech và SaaS phức tạp, việc đồng bộ giữa **Design Tokens** trong Figma và mã nguồn frontend thường gặp phải tình trạng lệch chuẩn (drift), dẫn đến việc phải can thiệp thủ công liên tục.

> Dự án này thiết lập một **pipeline tự động hóa khép kín** sử dụng Figma Console MCP và các tác tử AI để tự động trích xuất biến số thiết kế, kiểm thử độ tương phản theo chuẩn WCAG AAA, và xuất bản các package token sẵn sàng cho production.

---

## 1. Thách Thức Kỹ Thuật & Giải Pháp

Khi quy mô hệ thống tăng lên hơn 200+ màn hình và 50+ component phức tạp, chúng tôi đối mặt với 3 thách thức lớn:

1. **Token Inconsistency**: Màu sắc, khoảng cách (spacing), và độ bo góc (border-radius) phân mảnh giữa các file Figma khác nhau.
2. **Handoff Friction**: Kỹ sư FE phải đo đạc thủ công từng pixel và chuyển đổi giá trị CSS bằng tay.
3. **Vietnamese Typography Polish**: Font chữ tiếng Việt thường bị lỗi ngắt dòng gãy chữ (orphan widows) và vỡ baseline khi render trên mobile.

### Bảng So Sánh Trước & Sau Khi Áp Dụng Pipeline

| Tiêu Chí Đo Lường | Quy Trình Thủ Công (Cũ) | Pipeline AI & Token Tự Động | Mức Cải Thiện |
| :--- | :--- | :--- | :--- |
| Thời gian cập nhật 1 Token | 45 phút / lần duyệt | < 30 giây (1-click sync) | **98% nhanh hơn** |
| Tỷ lệ sai lệch màu sắc (Drift) | ~ 15% | 0% (Strict Type Checking) | **Triệt tiêu sai lệch** |
| Hỗ trợ Responsive đa nền tảng | Viết lại CSS riêng lẻ | Tự động sinh CSS/TSX Types | **Chuẩn Apple HIG** |
| Khả năng kiểm tra Accessibility | Kiểm tra ngẫu nhiên | Tự động linting WCAG AAA | **100% độ phủ** |

---

## 2. Kiến Trúc Pipeline Trích Xuất & Đồng Bộ

Hệ thống sử dụng luồng trích xuất 3 lớp, đảm bảo mã nguồn sinh ra luôn tuân thủ nguyên tắc bất biến (Immutability) và có type-safety tuyệt đối trong TypeScript.

\`\`\`typescript
import { createDesignTokenCollection } from '@vlink/design-tokens';

// Cấu hình Design Token Contract cho Dark & Light Mode
export const semanticTokens = createDesignTokenCollection({
  namespace: 'vlink-core',
  modes: ['dark', 'light'],
  transforms: {
    colorSpace: 'oklch',
    unit: 'rem',
  },
  rules: {
    enforceContrastRatio: 4.5, // WCAG AA Compliance
    pixelGridAlignment: 4,     // 4px Soft Grid
  },
});
\`\`\`

---

## 3. Quản Trị Typography & Vietnamese Widow Control

Đối với thị trường Việt Nam, trải nghiệm đọc (readability) phụ thuộc rất nhiều vào cách xử lý ngắt dòng và font display. Chúng tôi kết hợp font **Space Grotesk** cho các tiêu đề cấp cao và **DM Sans** cho nội dung dài.

![Hệ Thống Token & Grid](/images/og-product-figma.jpg "Kiến trúc lưới 4px và hệ thống phân cấp hiển thị Typography")

### Quy tắc typography cốt lõi:
- **Heading Line-Height**: Đặt chặt chẽ ở mức 1.15 - 1.25 để tạo ấn tượng mạnh mẽ (Punchy & Bold).
- **Prose Balanced Wrap**: Sử dụng thuộc tính \`text-wrap: balance\` và \`text-wrap: pretty\` để tránh tình trạng rơi rớt 1 từ lẻ loi xuống dòng cuối.
- **Glassmorphism Backdrop**: Các blockquote và thẻ thông tin được phủ mờ với \`backdrop-blur-xl\` cùng viền phát sáng gradient tinh tế.

---

## 4. Kết Quả Đạt Được & Định Hướng Tương Lai

- **100% Token Coverage**: Toàn bộ dự án được quản trị tập trung bởi 1 nguồn chân lý duy nhất (Single Source of Truth).
- **Zero Drift**: Bất kỳ sự thay đổi màu sắc nào từ Figma đều được tạo pull request tự động đi kèm ảnh diff đối chiếu trực quan.
- **Developer Experience**: Kỹ sư Frontend có thể autocomplete mọi token màu, spacing và typography với TypeScript IntelliSense.
`;

/**
 * Sample Presentation Deck Data
 */
export const SAMPLE_PDF_DECK_PROJECT = {
  id: 'pdf-deck-showcase',
  slug: 'pdf-deck-showcase',
  route: '/project/pdf-deck-showcase',
  title: {
    en: 'Product Strategy & Scalable Design Architecture Deck',
    vi: 'Bản Thuyết Trình Chiến Lược Sản Phẩm & Kiến Trúc Thiết Kế',
  },
  summary: {
    en: 'Executive presentation deck covering multi-platform design architecture, fintech workflows, and UX methodologies.',
    vi: 'Tài liệu thuyết trình chiến lược sản phẩm, kiến trúc hệ thống thiết kế fintech và phương pháp luận UX trải nghiệm người dùng.',
  },
  category: 'Strategic Presentation',
  role: 'Product Architect & Lead Designer',
  status: 'published' as const,
  render_mode: 'pdf_deck' as const,
  featured: true,
  sort_order: 11,
  pdfUrl: 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js@master/web/compressed.tracemonkey-pldi-09.pdf',
  totalSlides: 14,
  date: '2026-08-14',
  tags: ['Executive Deck', 'Product Strategy', 'Fintech', 'System Architecture'],
};
