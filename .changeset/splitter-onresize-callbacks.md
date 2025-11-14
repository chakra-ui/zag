---
"@zag-js/splitter": patch
---

- Fix cursor behavior during intersection dragging. When using the registry for multi-drag support, individual splitter machines no longer overwrite the registry's cursor, preventing the cursor from shifting from four-corner (`move`) to two-corner (`ew-resize`/`ns-resize`) during drag operations.

- Fix `onResizeStart` and `onResizeEnd` callbacks to fire for programmatic resizes. Previously, these callbacks only fired during user interactions (drag/keyboard). Now they also fire when panels are resized programmatically via `setSizes()`, `resizePanel()`, `collapsePanel()`, or `expandPanel()` methods.

