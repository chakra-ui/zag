---
"@zag-js/splitter": minor
---

Add multi-drag support for splitter intersections via a shared registry. When nested
splitters share a registry, users can drag at handle intersections to resize both
directions simultaneously.

- Add `registry` prop and `splitter.registry()` factory for coordinating multiple splitter instances
- Fix cursor behavior during intersection dragging — registry manages cursor globally
- Fix `onResizeStart` and `onResizeEnd` callbacks to fire for programmatic resizes
