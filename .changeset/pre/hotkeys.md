---
"@zag-js/hotkeys": patch
---

- Fix `store.subscribe` never firing for selectors that return `pressedKeys`, `pressedCodes`, `activeScopes` or
  `commands`.
