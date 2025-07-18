---
"@zag-js/date-utils": patch
---

Fix date picker constraint logic to properly handle end-of-day times by using `toCalendarDateTime` instead of `toCalendarDate` when applying min/max constraints.
