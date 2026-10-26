---
"@zag-js/splitter": patch
---

- Fix nested splitters snapping back to their default layout, or flickering, when the outer splitter is resized.
- Fix `onResizeEnd` reporting a `null` `resizeTriggerId` after dragging or resizing with the keyboard.
- Fix the resize trigger's `aria-orientation` so it describes the separator, which is perpendicular to the panel layout.
