---
"@zag-js/splitter": patch
---

- Fix a nested splitter resetting to its default layout when its root resized along the cross axis only. Dragging the
  outer splitter of a nested layout no longer snaps the inner panels back, and dragging where two resize triggers meet
  no longer flickers.
