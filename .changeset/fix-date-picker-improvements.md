---
"@zag-js/date-picker": patch
---

- Fix keyboard navigation issue where pressing HOME key in month view would incorrectly jump to an invalid date instead
  of January, potentially causing date selection errors.

- Clear hover state immediately when completing range selection instead of waiting for pointer to leave the calendar
  area.
