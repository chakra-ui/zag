---
"@zag-js/menu": patch
---

- Fix issue where menu items don't have a unique id leading to accessibility and HTML validation issues
- Dispatch new `menu:select` event on the menu item when it is selected.
