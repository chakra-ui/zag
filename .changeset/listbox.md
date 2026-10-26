---
"@zag-js/listbox": patch
---

- Fix `ArrowLeft` and `ArrowRight` not being mirrored in grid and horizontal layouts when `dir` is `rtl`.
- Fix typeahead ignoring the lowercase `a` key.
- Fix a pending scroll to the highlighted item running after the listbox unmounts.
