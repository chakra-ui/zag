---
"@zag-js/dom-query": patch
"@zag-js/combobox": patch
"@zag-js/menu": patch
---

- **Combobox, Menu**: Pressing Enter with Cmd, Ctrl, Shift, or Alt on a link item now behaves like a modifier-click, so
  the link opens in a new tab or window instead of the current one.
- **Combobox, Menu**: `navigate` and `onSelect` details now include `modifiers`, with `metaKey`, `ctrlKey`, `shiftKey`,
  and `altKey` from the triggering keyboard or click event. All are `false` for programmatic selection.
- **Combobox**: Cmd/Ctrl+click and Alt+click on a link item now select it and call `onSelect` with `modifiers`, like
  Cmd/Ctrl+Enter. The browser still opens the link in a new tab or downloads it. Before, these clicks skipped the
  selection.
- **DOM Query**: `clickIfLink` accepts the modifier keys to forward. New `getModifierKeys` and `hasModifierKey` helpers
  read and check them.
