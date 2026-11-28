---
"@zag-js/dom-query": major
---

**Breaking:** Move helpers from the root into entrypoints by topic.

```diff
- import { trackPress, resizeObserverBorderBox, getDataUrl, createLiveRegion } from "@zag-js/dom-query"
+ import { trackPress } from "@zag-js/dom-query/press"
+ import { resizeObserverBorderBox } from "@zag-js/dom-query/observe"
+ import { svgToDataUrl } from "@zag-js/dom-query/image"
+ import { createLiveRegion } from "@zag-js/dom-query/live-region"
```

| Entrypoint    | What's in it                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------ |
| `drag`        | `trackDrag`, `isDragStart`, `suppressNextClick`, `DRAG_DISTANCE`                                 |
| `press`       | `trackPress`, `trackLongPress`, `LONG_PRESS_STYLE`                                               |
| `swipe`       | `trackSwipe`, `isDismissSwipe`, `settleSwipe`, `resistPast`, `releaseStrength`, `isSwipeIgnored` |
| `scroll`      | the scroll and overflow helpers, `trackScrollEnd`, `trackStickToBottom`, `createAutoScroll`      |
| `observe`     | the shared resize and mutation observers, and `createSharedIntersectionObserver`                 |
| `image`       | `loadImage`, `createCanvas`, `canvasToBlob`, `cropImage`, `cropImageToCanvas`, `svgToDataUrl`    |
| `live-region` | `createLiveRegion`, from the removed `@zag-js/live-region`                                       |

- **Breaking:** Replace `trackPointerMove` with `trackDrag`, and `getEventStepValue` with `getEventMove`.

- **Breaking:** Rename `getDataUrl` to `svgToDataUrl`. It rejects when the image fails to load instead of never
  settling.

- **Breaking:** Remove `observeAttributes` and `observeChildren`; use `createSharedMutationObserver`.

- **Breaking:** Remove `isInView`, `getScrollPosition`, `getFirstFocusable`, `getLastTabbable`, `getNextTabbable`,
  `isVirtualPointerEvent`, `isVisualViewport`, `setVisuallyHidden` and `resizeObserverDevicePixelContentBox`, and make
  `getNearestScrollOffset` internal.

**Gestures**

- Add `trackDrag`: it reports once a frame with `point`, `offset`, `delta`, `velocity` and the coalesced `events`, says
  in `onEnd` whether the drag started, moved or was cancelled, and with `input: "touch"` can take a touch over from a
  scroll.

- Add `trackLongPress`, which calls `onHold` once a press lasts past `delay`, then every `interval` when set.

- Add `trackSwipe`, which keeps a drag to allowed directions, locks to one axis and waits while nested content can still
  scroll.

- Add `getEventMove`, which reads a key as a step (larger with Shift or Page keys, smaller with Alt) or a jump to a
  bound.

- Fix `suppressNextClick` letting a touch's click through.

**Scroll**

- Add `trackStickToBottom` to keep a growing scroller's end in view until the user scrolls away.

- End `trackScrollEnd` on the native `scrollend` event, and never while a finger is down.

- Make `createAutoScroll` ramp up at an edge, keep scrolling past it, and handle reversed flex layouts. Its default
  speed rises from 4 to 6.

- Respect reduced motion in `scrollToElement`.

**Other**

- Add `addGlobalEvent` to share one native listener per target and event.

- Add `getElementRect`, `getWindowRect` and `getViewportRect`, moved from `@zag-js/rect-utils`.

- Add `selectTextFrom`, `isTypingAtEnd` and `hasSelectionWithin`, and export the public types, like
  `HTMLElementWithValue`, from the root.

- Fix `createLiveRegion`'s `destroy()` removing a shared region that other components still announce into.

- Fix `isEditableElement` treating custom elements with `select` or `textarea` in their tag name as text fields.

- Fix controls inside a disabled fieldset's first legend being treated as disabled.
