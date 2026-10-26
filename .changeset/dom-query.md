---
"@zag-js/dom-query": minor
---

- Add `getModifierKeys` and `hasModifierKey`.
- Add `isFocusOutside` to check whether focus moved outside a set of containers.
- Add `Timeout`, a `setTimeout` wrapper whose `start()` replaces any pending call.
- Add `isScrollable` and `getScrollParent` to find the element that scrolls another.
- Add `scrollToNearest` and `getNearestScrollOffset` to reveal an element by scrolling only one container.
- Add `trackScrollEnd` to run a callback once scrolling pauses.
- Add `getScrollTopToElement`, and fix `scrollToElement` ignoring borders, transforms and percentage scroll padding.
- Fix `whenNode` resolving a frame late when the element mounts right away.
- Fix typeahead not matching items that start with an accented or non-Latin character. Matching now ignores case and
  accents.
- Fix the shared resize observers throwing when `ResizeObserver` is unavailable, such as in jsdom.
- Fix `waitForElement` leaving its `MutationObserver` running after an abort or timeout.
