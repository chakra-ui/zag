---
"@zag-js/dom-query": patch
"@zag-js/combobox": patch
"@zag-js/menu": patch
---

- **Combobox, Menu**: Cmd/Ctrl/Shift/Alt+Enter on a link item now opens it like a modifier-click (new tab, window, or
  download).
- **Combobox, Menu**: `navigate` and `onSelect` details include `modifiers` (`metaKey`, `ctrlKey`, `shiftKey`,
  `altKey`).
- **Combobox**: Modifier clicks on a link item now call `onSelect`, like modifier+Enter.
