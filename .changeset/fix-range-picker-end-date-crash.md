---
"@zag-js/date-picker": patch
---

Fix crash in range date picker when typing end date first by adding `null`/`undefined` checks when accessing date
properties.
