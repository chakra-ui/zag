---
"@zag-js/dom-query": patch
"@zag-js/dismissable": patch
"@zag-js/focus-trap": patch
"@zag-js/aria-hidden": patch
"@zag-js/popper": patch
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/popover": patch
"@zag-js/menu": patch
"@zag-js/select": patch
"@zag-js/combobox": patch
"@zag-js/hover-card": patch
"@zag-js/color-picker": patch
"@zag-js/cascade-select": patch
"@zag-js/floating-panel": patch
---

Fixed issues with overlays whose content mounts after they open (for example with `lazyMount`, `unmountOnExit`, or
async components):

- Fixed issue where a popup nested in another layer (such as a select inside a dialog) rendered behind its parent when
  layers are stacked with `--layer-index`.
- Fixed issue where content that mounted late never got focus, a focus trap, `aria-hidden` on the rest of the page, or
  Escape and click-outside handling.
- Fixed issue where a late-mounted positioner was never positioned.
