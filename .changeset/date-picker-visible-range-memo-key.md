---
"@zag-js/date-picker": patch
---

Fix `visibleRangeText` returning a stale value when multiple date pickers with different
`selectionMode` (or `timeZone`) share the same visible range. The internal memo key now
includes `selectionMode` and `timeZone`, preventing a `range`-formatted label (e.g.
`June 2026 - June 2026`) from leaking into a `single`/`multiple` picker that should show
`June 2026`. This previously surfaced as SSR hydration mismatches.
