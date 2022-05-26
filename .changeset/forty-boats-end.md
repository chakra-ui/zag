---
"@zag-js/core": patch
---

Extend guard expression to support in guards. In Guards are guards that asserts that a machine is in a given state
before excusing the transition. [Learn more](https://statecharts.dev/glossary/guard.html#in-and-not-in-guards)

This helper can be used in inline guards or the gaurds options.

```js
import { guards } from "@zag-js/core"

const { isIn } = gaurds

const machine = createMachine({
  on: {
    CLICK: {
      guard: isIn("open"),
    },
  },
  states: {
    open: {},
    closed: {},
  },
})
```
