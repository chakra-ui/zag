---
"@zag-js/core": patch
---

- Fix issue where transition object gets mutated
- Add `onChange` method to machine to listen for context changes
- Add support for `debug: true` to visualize state transitions
- Add support for explicit state re-entry (to get rid of the `after: 0` hack)
