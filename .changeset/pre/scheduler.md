---
"@zag-js/scheduler": patch
"@zag-js/date-utils": patch
---

- Add resource scheduling: per-resource lanes in each day column, or one row per resource in the new `timeline` view.

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

- Add drop constraints with `canDropEvent`, and external drag and drop with `dataTransferFormat` and `onEventReceive`.

- Add `getAllDaySegments(days?)` to lay out each all-day event as one bar across its days.

- Add `maxAllDayRows` to cap the all-day row, with per-day counts from `getAllDayOverflow()`.

- Use `CalendarDateTime` for dates in the scheduler API.

- Fix dragging or resizing an all-day event collapsing it into a zero-length timed event.

- Fix dragging an event edge past the opposite edge inverting the event.

- Fix multi-day and midnight-crossing events missing from, or duplicated on, the visible days.

- Fix events on different resources being treated as conflicting.

- Fix long all-day titles widening the column, and stacked all-day bars spilling into the time grid.

- **Date utils:** Return the date type passed in from the alignment, pagination and week/month helpers.
