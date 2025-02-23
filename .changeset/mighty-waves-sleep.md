---
"@zag-js/floating-panel": patch
"@zag-js/signature-pad": patch
"@zag-js/angle-slider": patch
"@zag-js/color-picker": patch
"@zag-js/number-input": patch
"@zag-js/rating-group": patch
"@zag-js/toggle-group": patch
"@zag-js/collapsible": patch
"@zag-js/date-picker": patch
"@zag-js/file-upload": patch
"@zag-js/radio-group": patch
"@zag-js/time-picker": patch
"@zag-js/hover-card": patch
"@zag-js/pagination": patch
"@zag-js/tags-input": patch
"@zag-js/accordion": patch
"@zag-js/clipboard": patch
"@zag-js/pin-input": patch
"@zag-js/tree-view": patch
"@zag-js/carousel": patch
"@zag-js/checkbox": patch
"@zag-js/combobox": patch
"@zag-js/editable": patch
"@zag-js/presence": patch
"@zag-js/progress": patch
"@zag-js/splitter": patch
"@zag-js/popover": patch
"@zag-js/qr-code": patch
"@zag-js/tooltip": patch
"@zag-js/avatar": patch
"@zag-js/dialog": patch
"@zag-js/select": patch
"@zag-js/slider": patch
"@zag-js/switch": patch
"@zag-js/steps": patch
"@zag-js/timer": patch
"@zag-js/toast": patch
"@zag-js/menu": patch
"@zag-js/tabs": patch
"@zag-js/tour": patch
---

Expose `<component>.Machine` type to help when typecasting generic components like combobox and select.

Here's an example of the combobox component:

```ts
interface Item {
  code: string
  label: string
}

const service = useMachine(combobox.machine as combobox.Machine<Item>, {
  id: useId(),
  collection,
})
```
