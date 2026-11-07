---
"@zag-js/toolbar": patch
---

- Fix a disabled toolbar trapping keyboard focus on its root instead of moving it to the items.
- Fix clicking an empty part of the toolbar moving focus onto the root.
- Fix the focused item not scrolling into view when the toolbar overflows.
