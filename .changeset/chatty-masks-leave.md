---
"@zag-js/core": patch
---

Add support for custom equality function for `watch` property keys.

> This is done via the `compareFns` option.

This is useful for comparing complex objects or dates, to avoid unnecessary context updates.

```js
const machine = createMachine(
  {
    context: {
      date: new Date(),
    },
    watch: {
      date: ["invokeOnDateChange"],
    },
  },
  {
    compareFns: {
      date: (a, b) => a.getTime() === b.getTime(),
    },
  },
)
```
