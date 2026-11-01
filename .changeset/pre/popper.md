---
"@zag-js/popover": patch
"@zag-js/menu": patch
"@zag-js/select": patch
"@zag-js/combobox": patch
"@zag-js/cascade-select": patch
"@zag-js/date-picker": patch
"@zag-js/color-picker": patch
"@zag-js/hover-card": patch
"@zag-js/tooltip": patch
"@zag-js/tour": patch
---

- Fixed issue where the positioner flashed in the top-left corner on first open, most visibly in Svelte.
- Cascade select now positions correctly on open, including with `defaultOpen`.
- An arrow that mounts after the popup, or is swapped, is now positioned.
