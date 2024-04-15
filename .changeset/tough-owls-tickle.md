---
"@zag-js/combobox": minor
---

- Fix issue where combobox could be composed with tags-input due to the way `selectedItems` and `valueAsString` was
  computed
- Remove `selectOnBlur` to prevent accidental selection of options. Prefer explicit selection by user via click or enter
  key.
- Update the details provided by `onInputValueChange` to from `details.value` to `details.inputValue`
