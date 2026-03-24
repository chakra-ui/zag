---
"@zag-js/date-picker": minor
---

Add missing range data attributes to month and year cell triggers for range picker mode.

- `data-range-start`, `data-range-end`, `data-in-hover-range`, `data-hover-range-start`, `data-hover-range-end` now
  render on month and year cell triggers (previously only on day cells).

- `TableCellState` now includes `firstInRange`, `lastInRange`, `inHoveredRange`, `firstInHoveredRange`,
  `lastInHoveredRange`, and `outsideRange`.

- **Fixed:** Year cell `selectable` state was inverted, causing years outside the visible decade or min/max range to
  appear selectable.

- **Improved:** Range boundary dates now announce "Starting range from {date}" and "Range ending at {date}" for better
  screen reader context.

- **Changed:** `DayTableCellState.formattedDate` removed — use `valueText` instead (inherited from `TableCellState`).
