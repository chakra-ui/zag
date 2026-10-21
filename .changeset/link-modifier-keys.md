---
"@zag-js/dom-query": minor
"@zag-js/combobox": minor
"@zag-js/menu": minor
---

- Fix Cmd/Ctrl/Shift/Alt+Enter on combobox and menu link items not opening the link like a modifier-click.
- Add `modifiers` to the `navigate` and `onSelect` details of combobox and menu.
- Call `onSelect` when a combobox link item is clicked with a modifier. Skip navigating in `onSelect` when one is held.
- Call `onSelect` and close the menu when Enter is pressed on a menu link item.
- Add `getModifierKeys` and `hasModifierKey` to `@zag-js/dom-query`.
