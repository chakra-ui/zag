---
"@zag-js/listbox": patch
---

- Fix typeahead ignoring the lowercase `a` key. The key was always handled as the `Ctrl/Cmd+A` select all shortcut, even
  without a modifier.
