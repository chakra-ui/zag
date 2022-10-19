---
"@zag-js/pagination": patch
---

Dispatch custom events

```js
useEffect(() => {
  return () =>
    api.on("change", (evt) => {
      console.log(`Switched to page ${evt.detail.page} of ${evt.detail.pageSize}`)
    })
}, [])
```
