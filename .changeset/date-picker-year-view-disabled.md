---
"@zag-js/date-picker": patch
"@zag-js/date-utils": patch
---

Fix year cells being disabled when they fall outside the decade currently in view, even with no `min` or `max` set. Only
`min` and `max` decide whether a year can be selected now. Cells outside the visible decade still get
`data-outside-range` for styling, and remain excluded from the hovered range in a year range picker.

Also fix `End` in the year view focusing two years past the last cell in the grid.

**Breaking:** `getDecadeRange` from `@zag-js/date-utils` no longer accepts the `{ strict }` option and always returns
the ten years of the decade. It previously returned twelve by default, which is what put `End` out of bounds. Drop the
option if you were passing `{ strict: true }`; there is no replacement for the twelve-year form.
