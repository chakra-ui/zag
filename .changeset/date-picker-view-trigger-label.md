---
"@zag-js/date-picker": patch
---

Fix `getViewTriggerProps` `aria-label` replacing the visible month/year text. The accessible name now includes the visible range text to satisfy WCAG 2.5.3 (Label in Name).
