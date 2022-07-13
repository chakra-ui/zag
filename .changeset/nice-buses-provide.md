---
"@zag-js/pin-input": patch
---

Add support for `pattern` in machine context to allow consumer define their own patterns to validate against.

```jsx
const [state, send] = useMachine(pinInput.machine({ pattern: "^[0-9.-]+$" }))
```

Improve form support by exposing `hiddenInputProps`. When the machine is passed a `name` property:

- The `input` element with `api.hiddenInputProps` is attached will send updates to the closest `form` element.
- When the pin input's value is complete and the `Enter` key is pressed, the closest `form` will be submitted.
