---
"@zag-js/combobox": minor
---

- Add `open` and `open.controlled` property to programmatically control the combobox's open state

- Add new `openOnChange` property to automatically open the combobox when the value changes. Value can be a boolean or a
  function that returns a boolean.

```jsx
const [state, send] = useMachine(
  combobox.machine({
    // openOnChange: true,
    openOnChange: ({ inputValue }) => inputValue.length > 2,
  }),
)
```

- Add new `openOnKeypress` property to automatically open the combobox when the arrow keys (up and down) are pressed.

- Add `getSelectionValue` to the combobox's context to allow customizing the input value when an item is selected.

```jsx
const [state, send] = useMachine(
  combobox.machine({
    getSelectionValue({ inputValue, valueAsString }) {
      return `${inputValue} ${valueAsString}`
    },
  }),
)
```
