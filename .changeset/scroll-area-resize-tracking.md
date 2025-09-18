---
"@zag-js/scroll-area": patch
---

Fix issue where resize tracking was not observing the root element, which caused the scrollbar to not update when the
root element's size changed.
