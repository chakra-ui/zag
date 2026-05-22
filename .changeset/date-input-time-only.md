---
"@zag-js/date-input": minor
---

- Fix time-only formatters (no `year` segment) never firing `onValueChange` — `era` is now only required when `year` is
  present.
- Fix `setSegmentValue` reading stale `displayValues`. `updateSegmentValue` returns the new `IncompleteDate` directly so
  the commit check uses the fresh value.
- Fix `dayPeriod` (AM/PM) arrow up/down not updating the visible segment when `hourCycle` changes at runtime —
  `displayValues` now re-sync to the new hour cycle while preserving in-progress edits.
- Fix typing "A" / "P" on the `dayPeriod` segment not updating the visible AM/PM. The typing path was writing `12` for
  PM while every other code path uses `1`, so the display silently stayed on AM.
- Add `hideTimeZone` prop. The `timeZoneName` segment now renders automatically when the value is a `ZonedDateTime`, and
  can be hidden via `hideTimeZone: true`.
- Arrow navigation and auto-advance after typing now reach read-only focusable segments (e.g. `timeZoneName`). Typing
  the final editable segment (e.g. "P" on `dayPeriod`) advances focus to the trailing read-only segment instead of
  staying put.
