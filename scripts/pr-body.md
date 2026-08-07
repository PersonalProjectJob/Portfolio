## Summary
**Branch:** `optimize_seo_ga4_tracking`
**Feature:** #00 - Optimize SEO & Implement GA4 Tracking
Implemented standardized SEO metadata and integrated GA4 event tracking (`select_content`, `contact_click`) natively via `gtag.js`. SPA page view tracking leverages the native browser History API, effectively preventing duplicate `page_view` events.

## Evidence
<!-- Thay đổi không trực quan (logic/config/refactor): ghi `Chưa có ảnh` + 1 dòng lý do. -->
Chưa có ảnh (Thay đổi SEO metadata nằm ở thẻ meta, và GA4 tracking là background logic, không thay đổi giao diện)

## Testing
- Production build passed
- No TypeScript errors
- No linting errors
- No console logs
- QA report sent to Telegram
