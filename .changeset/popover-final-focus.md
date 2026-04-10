---
"@zag-js/popover": minor
---

Add `finalFocusEl` and `restoreFocus` props to control focus behavior when the popover closes.

- `finalFocusEl`: specify an element to receive focus instead of the trigger
- `restoreFocus`: set to `false` to prevent focus from returning to the trigger (default `true`)

Both work in modal and non-modal modes.
