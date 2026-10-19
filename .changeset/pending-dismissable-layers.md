---
"@zag-js/dismissable": patch
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

- Fix Escape not closing an overlay whose content mounts late, such as with `lazyMount`.
- Keep overlay layer order when content mounts late or is replaced while open.
- Fix outside-click tracking and pointer styles left behind when content is replaced or a layer closes.
