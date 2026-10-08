---
"@zag-js/pin-input": patch
---

Fixed issue where pressing Enter with an incomplete value did nothing, blocking form submission and native validation.

- Pressing Enter now always requests form submission, so the browser runs constraint validation.
- When `required` is set, each input is marked required so the validation message points to the first empty input.
- An incomplete value, or one with characters that don't match `type`, now fails validation, and focus moves to a visible input instead of the hidden one.
