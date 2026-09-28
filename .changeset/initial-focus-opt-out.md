---
"@zag-js/dom-query": minor
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/popover": patch
"@zag-js/color-picker": patch
"@zag-js/floating-panel": patch
"@zag-js/menu": patch
"@zag-js/select": patch
---

Fixed issue where there was no way to open a dialog without moving focus.

- `initialFocusEl` can now return `false` to skip moving focus. Returning `null` uses the default.
- Fixed issue where the popover's `autoFocus={false}` was ignored for modal popovers.

```jsx
const service = useMachine(dialog.machine, {
  initialFocusEl: () => false,
})
```
