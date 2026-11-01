---
"@zag-js/slider": patch
---

`origin` accepts a number, so the track fills from a neutral value other than the midpoint:

```ts
slider.machine({ min: -50, max: 100, origin: 0 })
```
