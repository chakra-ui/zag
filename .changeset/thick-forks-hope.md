---
"@zag-js/select": minor
"@zag-js/combobox": minor
"@zag-js/utils": minor
---

> Breaking Changes 💥

Redesign select and combobox API to allow passing value as `string` and `collection`

Prior to this change, Zag computes the label and value from the DOM element. While this worked, it makes it challenging
to manage complex objects that don't match the `label` and `value` convention.

```jsx
// Create the collection
const collection = select.collection({
  items: [],
  itemToString(item) {
    return item.label
  },
  itemToValue(item) {
    return item.value
  },
})

// Pass the collection to the select machine
const [state, send] = useMachine(
  select.machine({
    collection,
    id: useId(),
  }),
)
```
