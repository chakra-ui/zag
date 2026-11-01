---
"@zag-js/cascade-select": patch
"@zag-js/color-picker": patch
"@zag-js/combobox": patch
"@zag-js/date-picker": patch
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/hover-card": patch
"@zag-js/menu": patch
"@zag-js/navigation-menu": patch
"@zag-js/popover": patch
"@zag-js/select": patch
---

- Layer stack styles and attributes (layer index, nesting and pointer blocking) are applied through connect props, so
  framework re-renders can't overwrite them.
- Nested layers are dismissed shallowest first.
- Layers that are dismissed but stay mounted no longer keep their stack attributes and CSS variables.
