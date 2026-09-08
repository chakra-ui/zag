---
"@zag-js/tree-view": patch
---

Fixed issue where a branch node with no descendants (e.g. an async branch whose children haven't loaded) reported a
checked state of `true`. An empty descendant list made `[].every(...)` return `true`, so the branch looked fully
checked. It now reports `false` when it has no descendants.
