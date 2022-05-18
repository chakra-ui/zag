---
"@zag-js/editable": patch
---

Add support for different placeholders in preview and edit mode.

The `placeholder` can be a `string` or an object containing `edit` and `preview`.

```js
const [state, send] = useMachine(
  editable.machine({
    placeholder: { edit: "Enter...", preview: "Add name..." },
  }),
)
```
