---
"@zag-js/date-utils": patch
---

Fixed issue where the alignment, pagination and week/month helpers widened their return type to `DateValue`, so a caller
passing a `CalendarDateTime` got back a value it had to re-narrow. They are now generic and return the type they were
given.
