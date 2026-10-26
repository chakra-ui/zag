---
"@zag-js/steps": patch
---

- Fix `aria-current="step"` being set on the item wrapper instead of the current step's trigger.
- Add `data-current`, `data-complete` and `data-incomplete` to the item, as the styling guide documents.
