---
"@zag-js/floating-panel": minor
"@zag-js/utils": minor
---

- Resize the floating panel with the arrow keys from its `se` resize trigger; Shift resizes ten times as far.
- Hide the other resize triggers from screen readers.
- Announce moves and resizes, with the `resizeTrigger`, `moved` and `resized` translations.
- Call `onPositionChangeEnd` and `onSizeChangeEnd` after keyboard moves and resizes.
- Fix `gridSize` not snapping pointer resizes, and add `gridSize` to `applyResize`.
