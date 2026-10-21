---
"@zag-js/tree-view": patch
---

- Fix typeahead ignoring the lowercase `a` key. The key was always handled as the `Cmd+A` select all shortcut, even
  without the meta key.
