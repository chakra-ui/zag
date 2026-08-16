---
"@zag-js/splitter": patch
---

Fix the element from `getResizeTriggerProps()` matching `:focus-visible` after a pointer drag. It still takes focus, so
keyboard resizing keeps working, but no longer shows the focus ring.
