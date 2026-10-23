---
"@zag-js/menu": minor
---

- Add `modifiers` to the `navigate` and `onSelect` details.
- Fix Cmd/Ctrl/Shift/Alt+Enter on link items not opening the link like a modifier-click.
- Call `onSelect` and close the menu when Enter is pressed on a link item.
- Fix the `aria-label` prop not naming the menu.
- Fix controlled submenus opening after the pointer leaves their trigger, and controlled context menus opening on a
  short tap.
