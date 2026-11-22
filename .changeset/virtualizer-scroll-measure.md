---
"@zag-js/virtualizer": patch
---

Fix items rendered during a fast scroll (for example, dragging the scrollbar) painting at their estimated positions and
overlapping until scrolling stopped. Measurements taken while scrolling now trigger a re-render.
