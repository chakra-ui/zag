---
"@zag-js/dom-query": patch
---

Fix issue where `getActiveElement` returns `activeElement` rather than `null` for focusable web components with no
focusable children
