---
"@zag-js/dom-query": major
---

- Add `@zag-js/dom-query/drag`: `trackDrag`, `isDragStart`, `suppressNextClick` and `DRAG_DISTANCE`.
- `trackDrag` reports once a frame with `point`, `offset`, `delta`, `velocity` and the coalesced `events`, and `onEnd`
  says whether the drag started, moved or was cancelled.
- Remove `trackPointerMove`; use `trackDrag`.
- Add `addGlobalEvent` to share one native listener per target and event.
