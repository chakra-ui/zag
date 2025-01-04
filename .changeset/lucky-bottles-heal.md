---
"@zag-js/dom-query": minor
"@zag-js/combobox": minor
"@zag-js/menu": minor
"@zag-js/tabs": minor
---

Add support for `navigate` context property to handle custom router navigations when trigger is rendered as a link.

Here's a React example usage with the tabs machine.

```tsx
const [state, send] = useMachine(
  tabs.machine({
    id: useId(),
    value: "nils",
    // use router.push to navigate to the selected tab
    navigate(details) {
      router.push(`#${details.value}`)
    },
  }),
)
```
