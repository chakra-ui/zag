---
"@zag-js/date-utils": patch
"@zag-js/date-picker": patch
---

Fix `isDateEqual` to consider time components of `CalendarDateTime` and `ZonedDateTime` values.

This ensures `onValueChange` fires correctly when time segments change in the date input.
