---
"@zag-js/dom-query": minor
"@zag-js/combobox": minor
"@zag-js/menu": minor
---

- **Combobox, Menu**: Cmd/Ctrl/Shift/Alt+Enter on a link item now opens it like a modifier-click (new tab, window, or
  download).
- **Combobox, Menu**: `navigate` and `onSelect` details include `modifiers` (`metaKey`, `ctrlKey`, `shiftKey`,
  `altKey`).
- **Combobox**: Modifier clicks on a link item now call `onSelect`, like modifier+Enter. If you navigate in `onSelect`,
  skip it when a modifier is held so the current tab doesn't navigate too.
