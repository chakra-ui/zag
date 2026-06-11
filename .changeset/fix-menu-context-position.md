---
"@zag-js/menu": patch
---

Fix issue where context menu briefly flashes at the top-left corner before
positioning, and where a long-press (touch) context menu opens stuck at `(0,0)`
without ever repositioning to the touch point.
