---
"@zag-js/menu": patch
"@zag-js/dismissable": patch
---

Fixed issues when switching between menubar menus by arrowing or hovering:

- The incoming menu was dismissed by the outgoing one closing. `trackDismissableElement` now accepts a `group` option
  that registers layers as peers instead of nesting them.
- The swap replayed the open and close animations. Positioner and content now set `data-instant` during a swap so styles
  can skip the transition.
- Clicking an open menubar trigger did not close its menu.
