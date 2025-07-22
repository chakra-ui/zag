---
"@zag-js/date-picker": patch
---

Add hover range preview support for date picker range selection

- Added `inHoveredRange`, `firstInHoveredRange`, and `lastInHoveredRange` properties to `DayTableCellState`
- Added corresponding data attributes `data-in-hover-range`, `data-hover-range-start`, and `data-hover-range-end`
- Hover range states are only active when not overlapping with actual selected range
- Enables distinct styling for hover preview vs actual selection in range mode
