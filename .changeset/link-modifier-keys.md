---
"@zag-js/dom-query": patch
"@zag-js/combobox": patch
"@zag-js/menu": patch
---

- **Combobox, Menu**: Pressing Enter with Cmd, Ctrl, Shift, or Alt on a link item now behaves like a modifier-click, so the link opens in a new tab or window instead of the current one.
- **Combobox, Menu**: `navigate` and `onSelect` details now include `metaKey`, `ctrlKey`, `shiftKey`, and `altKey` from the triggering keyboard or click event.
- **DOM Query**: `clickIfLink` accepts an optional modifier keys object, and a new `getModifierKeys` helper reads them from an event.
