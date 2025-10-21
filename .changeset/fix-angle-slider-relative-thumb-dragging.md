---
"@zag-js/angle-slider": patch
---

Fix issue where clicking and dragging the angle-slider thumb from a non-center position causes unexpected value jumps.
The thumb now maintains its relative position from the initial click point throughout the drag operation, providing more
intuitive dragging behavior.
