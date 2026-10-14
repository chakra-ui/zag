---
"@zag-js/number-input": patch
---

Fix the input element keeping the typed text when a controlled parent refuses or clamps the change in
`onValueChange`. The machine now rewrites the input element when the committed value differs from what
the user typed, so the element, `aria-valuenow`, and the parent state stay in sync without waiting for
blur.
