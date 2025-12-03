---
"@zag-js/listbox": patch
---

- Fix issue in React where filtering items with an input would throw a
  `flushSync was called from inside a lifecycle method` warning.
- Fix issue where `data-highlighted` wasn't applied to the first item when using `autoHighlight` with input filtering.
