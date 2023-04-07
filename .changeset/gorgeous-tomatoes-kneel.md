---
"@zag-js/hover-card": minor
"@zag-js/popover": minor
"@zag-js/tooltip": minor
"@zag-js/dialog": minor
---

Remove the `defaultOpen` property in favor of the `open` property that can now be controlled.

```jsx
// this is will open the dialog initially
const [state, send] = useMachine(dialog.machine({ id: "1", open: true }))

// this will open the dialog when the `open` value changes
const [state, send] = useMachine(dialog.machine({ id: "1" }), {
  context: {
    // when this value changes, the dialog will open/close
    open: true,
  },
})
```
