---
"@zag-js/combobox": patch
---

Fix issue where `getSelectionValue` could gets called multiple times. Now, it only gets called when a selection is made.
