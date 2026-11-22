---
"@zag-js/virtualizer": patch
---

Fix list items and grid rows rendered during a fast scroll (for example, dragging the scrollbar) painting at their
estimated positions and overlapping until scrolling stopped. Measurements taken while scrolling now trigger a
re-render.
