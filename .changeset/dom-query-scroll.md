---
"@zag-js/dom-query": major
"@zag-js/virtualizer": minor
"@zag-js/dnd": patch
---

- Add `@zag-js/dom-query/scroll` and move the scroll and overflow helpers there from the root entrypoint.
- Add `trackStickToBottom`: follows a growing scroller's end, stops when the user scrolls up, reports unseen content,
  and keeps the rows in view still while content above them changes.
- Add `stickToEnd`, `onStickToEndChange`, `scrollToEnd()` and `getStickToEndState()` to the virtualizer.
- Fix the virtualizer jumping when rows above the view are measured near the end of the list.
- Keep measured sizes when options change. With `indexToKey`, sizes follow their items through inserts, sorts and other
  reorders.
- Keep the view still when rows measured in the overscan above the view change size.
- Keep grid column widths when rows are added, keep row sizes in sorted grids with `indexToKey`, and hold the view when
  a row above it is measured at a new height.
- Keep waterfall sizes through sorts and prepends with `indexToKey`.
- Size waterfall columns to the client width, so they no longer overflow under the scrollbar.
- Move dnd's auto-scroll to `createAutoScroll`. It no longer scrolls while the pointer is outside the container, keeps
  its edge bands to a third of the container, and scrolls at the same speed at any frame rate.
- Remove `isInView` and `getScrollPosition`, and make `getNearestScrollOffset` internal.
- Respect reduced motion in `scrollToElement`.
