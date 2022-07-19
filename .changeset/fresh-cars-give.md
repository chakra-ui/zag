---
"@zag-js/number-input": patch
---

- Add support for `spinOnPress` to allow user control whether to spin the input's value when the decrement or increment
  button is pressed.

- Add support for `onFocus` and `onBlur` callbacks in the machine's context.

```jsx
const [state, send] = useMachine(
  numberInput.machine({
    onFocus(details) {
      // details => { value: string, valueAsNumber: number, srcElement: HTMLElement | null }
    },
    onBlur(details) {
      // details => { value: string, valueAsNumber: number }
    },
  }),
)
```

- Add `focus()` and `blur()` methods to the machine's `api`
