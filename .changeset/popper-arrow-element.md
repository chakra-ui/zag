---
"@zag-js/popper": patch
"@zag-js/hover-card": patch
"@zag-js/menu": patch
"@zag-js/popover": patch
"@zag-js/tooltip": patch
"@zag-js/tour": patch
---

Fixed issue where the arrow was left unpositioned when it mounted after the popup or was swapped for another element.

- Added a `getArrowElement` option to `@zag-js/popper` so the arrow is resolved by the machine, and the middleware
  rebuilds when it changes.
