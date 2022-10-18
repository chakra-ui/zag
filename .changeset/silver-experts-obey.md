---
"@zag-js/number-input": patch
---

Dispatch custom events

```js
useEffect(() => {
  return () =>
    api.on("change", (evt) => {
      console.log("New value is: ", evt.detail.value)
    })
}, [])
```
