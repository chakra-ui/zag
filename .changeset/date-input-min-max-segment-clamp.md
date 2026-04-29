---
"@zag-js/date-input": patch
"@zag-js/date-utils": patch
---

Fix date input min/max handling to preserve entered segments while editing. Values are now
clamped segment-by-segment on blur, so `06/15/1999` with min `2000-01-01` becomes
`06/15/2000` instead of snapping to `01/01/2000`.

Add `constrainSegments` to `@zag-js/date-utils` for segment-wise min/max clamping.
