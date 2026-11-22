---
"@zag-js/hotkeys": patch
---

Fix `store.subscribe` never firing for selectors that return `pressedKeys`, `pressedCodes`, `activeScopes` or
`commands`. The store now replaces these collections when they change instead of mutating them in place.
