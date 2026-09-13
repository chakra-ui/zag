---
"@zag-js/menu": patch
"@zag-js/dismissable": patch
---

Fixed issues when switching between menubar menus by arrowing or hovering.

- Fixed issue where the incoming menu was dismissed by the outgoing one closing. `trackDismissableElement` now accepts a
  `group` option that registers layers as peers.
- Fixed issue where the swap replayed the open and close animations. Positioner and content now set `data-instant`.
- Fixed issue where clicking an open menubar trigger did not close its menu.
