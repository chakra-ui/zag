---
"@zag-js/date-picker": patch
---

- Fix day cells computing their state twice per render. Each day's state is now computed once and shared by the cell and
  its trigger.
