---
"@zag-js/scheduler": patch
"@zag-js/date-utils": patch
---

### Features

Resource scheduling splits each day column into per-resource lanes, or one row per resource in the new `timeline` view.

```ts
scheduler.machine({
  resources: [
    { id: "room-a", title: "Room A" },
    { id: "room-b", title: "Room B" },
  ],
  groupBy: "resource",
  events: [{ id: "1", resourceId: "room-a" /* ... */ }],
})
```

- Drop constraints via `canDropEvent`, and external drag and drop via `dataTransferFormat` and `onEventReceive`. Items
  can be dropped on the all-day row or a timed slot, and `onEventReceive` reports which one took the drop.
- `getAllDaySegments(days?)` lays out each all-day event as one bar across the days it covers, with resize handles only
  on its true ends. Pass a single week to lay out one row of a month grid.
- `maxAllDayRows` caps the all-day row, collapsing the rest into per-day counts from `getAllDayOverflow()`.
- Dates in the scheduler API are now `CalendarDateTime`, since the scheduler always works in wall-clock time.

### Fixes

- Dragging or resizing an all-day event now moves it in whole days and keeps its span, instead of collapsing it into a
  zero-length timed event.
- Dragging an event edge past the opposite edge no longer inverts the event.
- A multi-day all-day event no longer disappears when its last day is the first visible day.
- A timed event ending at midnight is no longer listed on the following day too.
- Recurring instances after midnight on the last visible day are no longer dropped.
- Events on different resources are no longer treated as conflicting.
- A long event title no longer widens its all-day column.
- All-day bars past the first level no longer spill into the time grid.
- **Date utils:** The alignment, pagination and week/month helpers now return the date type they were given, instead of
  widening it to `DateValue`.
