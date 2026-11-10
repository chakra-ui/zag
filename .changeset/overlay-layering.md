---
"@zag-js/popper": minor
"@zag-js/dismissable": minor
"@zag-js/popover": minor
"@zag-js/menu": minor
"@zag-js/select": minor
"@zag-js/combobox": minor
"@zag-js/hover-card": minor
"@zag-js/tooltip": minor
"@zag-js/date-picker": minor
"@zag-js/color-picker": minor
"@zag-js/cascade-select": minor
"@zag-js/dialog": minor
"@zag-js/drawer": minor
"@zag-js/floating-panel": minor
"@zag-js/tour": minor
---

Zag no longer sets a `z-index` on overlays. Set it in CSS on the positioner, or the backdrop, with `--layer-index`.

- Fix a `z-index` set on the positioner in CSS being overridden.
- Fix overlays dropping behind other layers while they animate out. `--layer-index` stays set after close.
- Add `--layer-index` to the floating panel positioner, with the panel's place in the stack.

**Breaking:**

- Popover, menu, select, combobox, hover card, tooltip, date picker, color picker and cascade select no longer copy the
  content's `z-index` onto the positioner, and the positioner no longer gets `--z-index`. Move the `z-index` from the
  content to the positioner.

  ```diff
  - [data-popover-content] {
  + [data-popover-positioner] {
  -   z-index: 1400;
  +   z-index: calc(1400 + var(--layer-index));
    }
  ```

- Dialog and drawer no longer set `--z-index` on the backdrop and positioner. Use `--layer-index`.
- The floating panel no longer sets a `z-index` from its panel stack. Add `z-index: calc(<base> + var(--layer-index))`
  to the positioner to bring the focused panel to the front.
- The tour no longer copies the content's `z-index` onto the positioner of dialog steps. Style the positioner with
  `--tour-layer`.
- Removed the `zIndex` and `zIndexFallback` options from `getDismissableLayerStyle`.
