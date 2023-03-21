---
"@zag-js/solid": minor
---

Add support for passing an accessor or signal as transient context.

```jsx
function Component(props) {
  const [state, send] = useMachine(machine({ id: createUniqueId() }), {
    context: createMemo(() => ({
      max: props.max,
      min: props.min,
    })),
  })
}
```
