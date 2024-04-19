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

- Add new `dismissable` property to determine whether to add the combobox content to the dismissable stack.

- Add `popup` attribute to allow rendering the combobox has a select with input within the content.

- Add `persistFocus` to the item props to determine whether to clear the highlighted item on pointer leave.
