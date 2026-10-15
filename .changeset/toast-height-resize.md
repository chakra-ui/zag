---
"@zag-js/toast": patch
---

Fixed toasts keeping a stale height when their width changes after they render, for example when a resize or rotation
makes the text wrap onto more or fewer lines. The stack no longer clips or overlaps the content, or leaves empty space
below it.
