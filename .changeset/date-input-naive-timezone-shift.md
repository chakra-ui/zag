---
"@zag-js/date-input": patch
---

Fix timezone-naive values (`CalendarDate`/`CalendarDateTime`) being shifted by the viewer's
local UTC offset when a custom `formatter` without an explicit `timeZone` is provided. Typing
`0` into the hour segment of a time-only input previously committed/displayed `02` at UTC+2 or
`09` at UTC+9 instead of `0`.

The instant fed to the formatter is now built using the formatter's own resolved time zone, so
a wall-clock value round-trips unshifted regardless of the viewer's locale. `ZonedDateTime`
values (which carry an absolute instant) are unaffected.
