---
"@zag-js/date-utils": patch
"@zag-js/date-picker": patch
---

Fix date comparison issues when time components are involved

This change resolves critical issues with date comparison operations when different date types (`CalendarDate`,
`CalendarDateTime`, `ZonedDateTime`) are mixed, particularly in scenarios involving time components.

- Convert `now(timeZone)` result to `CalendarDate` to ensure consistent date types without time components across all
  date range preset operations
- Update `constrainValue` function to normalize all input dates to `CalendarDate` before comparison, preventing
  time-component comparison issues
- Remove redundant date type conversion in `getMonthFormatter` for cleaner, more efficient code
