---
"@zag-js/floating-panel": minor
---

- Resize the panel with the arrow keys from its `se` resize trigger; Shift resizes ten times as far.

- Announce moves and resizes, with the `resizeTrigger`, `moved` and `resized` translations, and hide the other resize
  triggers from screen readers.

- Call `onPositionChangeEnd` and `onSizeChangeEnd` after keyboard moves and resizes, but not when one is blocked.

- Snap `gridSize` to grid lines in pointer resizes too.

- Undo a cancelled drag, and use two-way resize cursors on handles.

- Fix arrow keys moving the panel the wrong way in RTL, and a click on the title bar nudging the panel.

- Follow only the pointer that started a drag.
