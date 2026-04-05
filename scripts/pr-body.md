## Summary

**Branch:** `fixbug/7_auto-chuyen-tab-khi-chuyen-trang`
**Feature:** #7 - bug - fix auto refresh khi đổi tab ở JobsPage

Fix auto-refresh issue when switching tabs in JobsPage - only refresh on manual command.

## Changelog

| Version | Date | Time | Author | Module | Description |
|---------|------|------|--------|--------|-------------|
| v1.0.2 | 2026-04-05 | 02:30 | @SotaThao | Rules | Add Rule 0: Pre-Action Mandatory Workflow |
| v1.0.1 | 2026-04-05 | 02:15 | @SotaThao | JobsPage, CV Parser | Fix undefined constants, add cache check, enhance CV parser prompts |
| v1.0.0 | 2026-04-04 | 23:45 | @SotaThao | JobsPage | Add cache check to prevent redundant API calls on tab switch |

## Testing

- [x] Production build passed
- [x] No TypeScript errors
- [x] No linting errors
- [x] No console logs in production code
- [x] Manual testing completed

Closes #7
