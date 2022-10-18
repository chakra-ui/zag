---
"@zag-js/accordion": patch
---

Dispatch custom events

```js
useEffect(() => {
  const cleanup = api.on("change", (evt) => {
    console.log("Changed tab to: ", evt.detail.value)
  })

  return () => cleanup()
}, [])
```
