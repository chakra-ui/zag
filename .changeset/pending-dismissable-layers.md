---
"@zag-js/dismissable": minor
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
- Add `createDismissableTrigger` to track explicit trigger selection independently of DOM mounting.
- Keep overlay layer order when content mounts late or is replaced while open.
- Fix pressing another overlay's trigger closing both overlays instead of switching to the new one.
- Close only the overlays opened from inside an overlay when it closes. A dialog opened from code stays open.
- Preserve child-overlay dismissal when a parent or trigger is removed or replaced, and follow the selected trigger when
  switching between multiple triggers.
- Fix outside-click tracking and pointer styles left behind when content is replaced or a layer closes.
