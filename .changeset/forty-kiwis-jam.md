---
"@zag-js/dismissable": minor
"@zag-js/dialog": patch
"@zag-js/popover": patch
"@zag-js/menu": patch
"@zag-js/select": patch
"@zag-js/combobox": patch
"@zag-js/date-picker": patch
"@zag-js/color-picker": patch
"@zag-js/hover-card": patch
---

Add support for layer types in dismissable layer stack. Layers can now be categorized as `dialog`, `popover`, `menu`, or
`listbox`. This enables:

- `data-nested` attribute on nested layers of the same type
- `data-has-nested` attribute on parent layers with nested children of the same type
- `--nested-layer-count` CSS variable indicating the number of nested layers of the same type
