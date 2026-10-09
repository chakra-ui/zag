---
"@zag-js/scroll-area": patch
---

Fix `data-dragging` (and `getScrollbarState().dragging`) being set on both scrollbars and thumbs when only one axis is
dragged. It now only marks the scrollbar and thumb of the axis being dragged (fixes #3418).
