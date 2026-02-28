---
"@zag-js/carousel": patch
---

Fix issue where carousel inside a Portal (e.g., Dialog) computes incorrect page count due to incomplete DOM layout at mount time. The item-group container is now observed with a `ResizeObserver`, so snap points are recalculated when the container resizes (e.g., when a dialog opens and layout is complete).
