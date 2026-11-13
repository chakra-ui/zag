---
"@zag-js/field": minor
---

- Focus the first invalid field when a submit is blocked.

- Add `errors` for errors from outside the field, such as a server response.

- Pass `formValues` to `validate` for cross-field rules.

- Describe the control with the enclosing fieldset's error text while the fieldset is invalid.

- Label custom controls from `getControlProps` with `aria-labelledby`, and use `aria-disabled`, `aria-required` and
  `aria-readonly`.

- Fix custom controls from `getControlProps` crashing the field.

- Remove `role="group"` from the root and `aria-live` from the error text.
