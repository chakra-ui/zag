---
"@zag-js/pin-input": patch
---

Dispatch custom events

```js
useEffect(() => {
  return () =>
    api.on("complete", (evt) => {
      console.log("New pin is: ", evt.detail.valueAsString)
    })
}, [])
```
