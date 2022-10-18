---
"@zag-js/editable": patch
---

Dispatch custom events

```js
useEffect(() => {
  return api.on("change", (evt) => {
    console.log("Editable's new value is: ", evt.detail.value)
  })
}, [])
```
