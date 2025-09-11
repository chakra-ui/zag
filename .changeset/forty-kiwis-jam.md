---
"@zag-js/dismissable": minor
"@zag-js/dialog": minor
"@zag-js/popover": minor
"@zag-js/menu": minor
"@zag-js/select": minor
"@zag-js/combobox": minor
"@zag-js/date-picker": minor
"@zag-js/color-picker": minor
"@zag-js/hover-card": minor
---

Add support for layer types in dismissable layer stack. Layers can now be categorized as `dialog`, `popover`, `menu`, or
`listbox`. This enables:

- `data-nested` attribute on nested layers of the same type
- `data-has-nested` attribute on parent layers with nested children of the same type
- `--nested-layer-count` CSS variable indicating the number of nested layers of the same type
