---
"@zag-js/editable": patch
---

Dispatch custom events

```js
useEffect(() => {
  const cleanup = api.on("change", (evt) => {
    console.log("Editable's new value is: ", evt.detail.value)
  })
  return () => cleanup()
}, [])
```
