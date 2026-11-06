---
"@zag-js/slider": patch
---

Fixes:

- The range now ends at the thumb's center when `thumbAlignment` is `"contain"`, instead of falling short of it near the
  edges.
- The thumb now sets `aria-invalid` and `data-invalid` when the slider is invalid.
- `onValueChangeEnd` no longer fires when an interaction ends on the starting value, e.g. a thumb press without moving
  or an arrow key at the boundary.
- Page Up, Page Down and Shift + Arrow now move by exactly `largeStep` from the current value, instead of snapping to
  multiples of `largeStep` counted from the neighboring thumb.
