---
"@zag-js/drawer": patch
---

- Fix controlled drawer flickering when swiped or backdrop-closed while the `open` setter is asynchronous (e.g. history
  API or a delayed state update).

- Keep nested-drawer layout metrics in machine state so swipe and backdrop-close transitions stay visually stable.
