---
"@zag-js/tree-view": patch
---

Fixed issue where a branch node with no descendants (e.g. an async branch whose children haven't loaded) reported a
checked state of `true`. It now reports `false`.
