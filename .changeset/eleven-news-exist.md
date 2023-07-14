---
"@zag-js/date-picker": minor
"@zag-js/radio-group": minor
"@zag-js/hover-card": minor
"@zag-js/accordion": minor
"@zag-js/checkbox": minor
"@zag-js/combobox": minor
"@zag-js/popover": minor
"@zag-js/tooltip": minor
"@zag-js/dialog": minor
"@zag-js/select": minor
"@zag-js/toggle": minor
"@zag-js/toast": minor
"@zag-js/menu": minor
---

Add `data-state` attribute to allow styling the open/closed state or checked/unchecked states

**Potential breaking change:**

We replaced `data-expanded` or `data-checked` to `data-state` attribute

- `data-expanded` maps to `data-state="open"` or `data-state="closed"`
- `data-checked` maps to `data-state="checked"` or `data-state="unchecked"`
- `data-indeterminate` maps to `data-state="indeterminate"`
- `data-open` maps to `data-state="open"`
