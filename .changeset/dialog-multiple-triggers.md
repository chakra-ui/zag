---
"@zag-js/dialog": minor
"@zag-js/drawer": minor
"@zag-js/hover-card": minor
"@zag-js/menu": minor
"@zag-js/popover": minor
"@zag-js/tooltip": minor
---

Add support for multiple triggers in Dialog, Hover Card, Menu, Popover, and Tooltip.

A single component instance can now be shared across multiple trigger elements. Each trigger is identified by a `value`
passed to `getTriggerProps`:

```jsx
const users = [{ id: 1, name: "Alice Johnson" }]

const Demo = () => {
  // One dialog, many triggers
  const service = useMachine(dialog.machine, {
    id: useId(),
    // Track the active trigger change
    onTriggerValueChange({ value }) {
      const user = users.find((u) => u.id === value) ?? null
      setActiveUser(user)
    },
  })

  const api = dialog.connect(service, normalizeProps)

  return (
    <>
      {users.map((user) => (
        <button {...api.getTriggerProps({ value: user.id })}>Edit {user.name}</button>
      ))}
    </>
  )
}
```

When the component is open and a different trigger is activated, it switches and repositions without closing.
`aria-expanded` is scoped to the active trigger, and focus returns to the correct trigger on close.
