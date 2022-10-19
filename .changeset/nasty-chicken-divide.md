---
"@zag-js/pressable": patch
---

Dispatch custom events

```js
useEffect(() => {
  return () =>
    api.on("press", (evt) => {
      console.log("Element was pressed by: ", evt.detail.pointerType)
    })
}, [])
```
