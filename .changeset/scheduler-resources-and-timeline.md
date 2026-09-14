---
"@zag-js/scheduler": patch
---

- Add resource scheduling via `resources` and `groupBy: "resource"`, splitting each day column into per-resource lanes.
- Add the `timeline` view — a horizontal, resource-per-row layout.
- Add drag and drop constraints via `canDropEvent`, and external drag-and-drop via `dataTransferFormat` and
  `onEventReceive`.
- Add `getAllDaySegments()`, laying each all-day event out as one continuous bar across the days it covers rather than a
  separate chip per day, with resize handles only on its true ends.
- Fixed issue where dragging or resizing an all-day event moved it through the time grid, collapsing it to a zero-length
  timed event. All-day gestures now move in whole days and keep their span.
- Fixed issue where an event edge dragged past the opposite edge inverted the event.
- Fixed issue where events on different resources were treated as conflicting.
- Fixed issue where a long event title widened its all-day column, shifting every other column.
- Dates in the scheduler API are now `CalendarDateTime` — the scheduler always works in wall-clock time, so a bare
  `CalendarDate` was never valid input.
