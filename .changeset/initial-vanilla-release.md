---
"@zag-js/vanilla": minor
---

Initial release of the vanilla JavaScript adapter for Zag.js.

- `VanillaMachine` - Class-based wrapper for zag machines with start/stop lifecycle
- `normalizeProps` - Converts React-style props to vanilla DOM attributes
- `spreadProps` - Spreads props onto DOM elements with event listener management

```typescript
import { VanillaMachine, normalizeProps, spreadProps } from "@zag-js/vanilla"
import * as toggle from "@zag-js/toggle"

const machine = new VanillaMachine(toggle.machine, { id: "toggle" })
machine.start()

const api = toggle.connect(machine.service, normalizeProps)
spreadProps(buttonEl, api.buttonProps)

machine.stop()
```
