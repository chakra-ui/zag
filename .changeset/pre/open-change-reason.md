---
"@zag-js/dismissable": minor
"@zag-js/popover": minor
"@zag-js/dialog": minor
"@zag-js/drawer": minor
"@zag-js/tooltip": minor
"@zag-js/menu": minor
"@zag-js/select": minor
"@zag-js/date-picker": minor
"@zag-js/color-picker": minor
"@zag-js/cascade-select": minor
"@zag-js/collapsible": minor
"@zag-js/floating-panel": minor
---

- Add `reason` to `onOpenChange` details, such as `trigger-click`, `escape-key`, `interact-outside`, `item-select` or
  `script`. Each component exports its `OpenChangeReason` type.

- Add an optional `reason` to `api.setOpen(open, reason)`, defaulting to `script`.
