---
"@zag-js/popper": major
"@zag-js/dismissable": major
"@zag-js/popover": major
"@zag-js/menu": major
"@zag-js/select": major
"@zag-js/combobox": major
"@zag-js/hover-card": major
"@zag-js/tooltip": major
"@zag-js/date-picker": major
"@zag-js/color-picker": major
"@zag-js/cascade-select": major
"@zag-js/dialog": major
"@zag-js/drawer": major
"@zag-js/floating-panel": major
"@zag-js/tour": major
"@zag-js/toast": major
---

Zag no longer sets a `z-index` on overlays. Set it in CSS, using `--layer-index` for the overlay's place in the stack.

- Fix a `z-index` set on the positioner in CSS being overridden.

- Fix overlays dropping behind other layers while they animate out. `--layer-index` stays set after close.

**Breaking:** Move the `z-index` to the positioner (or the backdrop) and add `--layer-index`.

```diff
- [data-popover-content] {
+ [data-popover-positioner] {
-   z-index: 1400;
+   z-index: calc(1400 + var(--layer-index));
  }
```

- Popover, menu, select, combobox, hover card, tooltip, date picker, color picker and cascade select no longer copy the
  content's `z-index` onto the positioner or set `--z-index`.

- Dialog and drawer no longer set `--z-index`. Use `--layer-index` on the backdrop and positioner.

- The floating panel no longer sets a `z-index`. Style the positioner as above to bring the focused panel to the front.

- The tour no longer copies the content's `z-index` onto dialog steps. Style the positioner with `--tour-layer`.

- The toast group no longer sets an inline `z-index`. Set it on `[data-toast-group]` in CSS.

- Remove the `zIndex` and `zIndexFallback` options from `getDismissableLayerStyle`.
