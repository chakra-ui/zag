---
"@zag-js/dom-query": minor
---

- Add `@zag-js/dom-query/swipe`: `trackSwipe` follows a drag kept to allowed directions, locks to one axis, waits while
  nested content can still scroll, and reports how far and how fast it went.
- Add `isDismissSwipe`, `settleSwipe`, `resistPast` and `releaseStrength` to decide what a released swipe does.
- Add `isSwipeIgnored`, which skips presses on fields, range and file inputs, and `[data-swipe-ignore]`.
- Add `input: "touch"` to `trackDrag`, so a drag can take a touch over from a scroll.
- Add `hasSelectionWithin`.
