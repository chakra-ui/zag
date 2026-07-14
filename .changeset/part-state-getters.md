---
"@zag-js/angle-slider": minor
"@zag-js/carousel": minor
"@zag-js/cascade-select": minor
"@zag-js/checkbox": minor
"@zag-js/clipboard": minor
"@zag-js/collapsible": minor
"@zag-js/color-picker": minor
"@zag-js/combobox": minor
"@zag-js/date-input": minor
"@zag-js/date-picker": minor
"@zag-js/dialog": minor
"@zag-js/dnd": minor
"@zag-js/drawer": minor
"@zag-js/editable": minor
"@zag-js/file-upload": minor
"@zag-js/floating-panel": minor
"@zag-js/gridlist": minor
"@zag-js/hover-card": minor
"@zag-js/image-cropper": minor
"@zag-js/listbox": minor
"@zag-js/marquee": minor
"@zag-js/menu": minor
"@zag-js/navigation-menu": minor
"@zag-js/number-input": minor
"@zag-js/pagination": minor
"@zag-js/password-input": minor
"@zag-js/pin-input": minor
"@zag-js/popover": minor
"@zag-js/progress": minor
"@zag-js/radio-group": minor
"@zag-js/rating-group": minor
"@zag-js/scheduler": minor
"@zag-js/scroll-area": minor
"@zag-js/select": minor
"@zag-js/signature-pad": minor
"@zag-js/slider": minor
"@zag-js/switch": minor
"@zag-js/tabs": minor
"@zag-js/tags-input": minor
"@zag-js/timer": minor
"@zag-js/toast": minor
"@zag-js/toc": minor
"@zag-js/toggle": minor
"@zag-js/toggle-group": minor
"@zag-js/toolbar": minor
"@zag-js/tooltip": minor
"@zag-js/tour": minor
---

Add `get<Part>State()` getters (e.g. `getTriggerState`, `getContentState`, `getRootState`), extending the existing `getItemState` convention to every part with derived state.

```ts
const triggerState = dialog.getTriggerState({ value: "confirm" })
// { value: "confirm", current: true, open: true }
```
