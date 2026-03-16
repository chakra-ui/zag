---
"@zag-js/toast": patch
---

Improve toast group accessibility:

- Remove `role="region"` landmark to reduce screen reader noise; keep `aria-live="polite"` with `aria-relevant` and
  `aria-atomic` for reliable, scoped announcements
- Restructure `aria-label` for more natural output (e.g. "Notifications, bottom (Alt+T)")
