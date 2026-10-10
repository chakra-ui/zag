---
"@zag-js/tree-view": patch
---

Fixed the rename input not receiving focus when renaming starts with `F2` in adapters that patch the DOM after the
state change, such as Vue. The input value sync and focus now run on the next frame, once the input is rendered.
