---
"@zag-js/checkbox": patch
---

Dispatch custom events

```js
useEffect(() => {
  const cleanup = api.on("change", (evt) => {
    console.log("Checkbox is: ", evt.detail.checked ? "checked" : "unchecked")
  })

  return () => cleanup()
}, [])
```
