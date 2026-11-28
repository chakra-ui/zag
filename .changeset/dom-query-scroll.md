---
"@zag-js/dom-query": major
"@zag-js/virtualizer": minor
"@zag-js/dnd": patch
"@zag-js/scheduler": patch
"@zag-js/toc": patch
---

**dom-query**

- Add the `@zag-js/dom-query/scroll` entrypoint and move the scroll and overflow helpers there.
- Add the `@zag-js/dom-query/observe` entrypoint, move the shared resize and mutation observers there, and add
  `createSharedIntersectionObserver`.
- Move `createLiveRegion` from `@zag-js/live-region` to the `@zag-js/dom-query/live-region` entrypoint, and fix
  `destroy()` removing a shared region that other components still announce into.
- Add `trackStickToBottom` to keep a growing scroller's end in view until the user scrolls away.
- End `trackScrollEnd` on the native `scrollend` event, and never while a finger is down.
- Make `createAutoScroll` ramp up at an edge, keep scrolling past it, and handle reversed flex layouts. Its default
  speed rises from 4 to 6.
- Respect reduced motion in `scrollToElement`.
- Remove `isInView`, `getScrollPosition`, `fromRange`, `debugPolygon`, `getFirstFocusable`, `getLastTabbable`,
  `getNextTabbable`, `isVirtualPointerEvent`, `isVisualViewport`, `setVisuallyHidden`,
  `resizeObserverDevicePixelContentBox`, `observeAttributes` and `observeChildren`. Use `createSharedMutationObserver`
  in place of the last two. Make `getNearestScrollOffset` internal.

**virtualizer**

- Add `stickToEnd`, `onStickToEndChange`, `scrollToEnd()` and `getStickToEndState()`.
- Keep measured sizes by `indexToKey` through inserts, sorts and prepends, in lists, grids and waterfalls.
- Keep the view still when rows above it are measured.
- Fit waterfall columns to the client width, so they no longer sit under the scrollbar.

**dnd, scheduler**

- Auto-scroll past the container's edge, and not while the pointer is beside it.
- Scheduler: keep the dragged event under the pointer while the grid scrolls.

**toc**

- Keep the clicked link active once its scroll ends.
