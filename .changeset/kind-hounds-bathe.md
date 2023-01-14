---
"@zag-js/hover-card": minor
---

Add `open` and `close` functions to the connect api:

```ts
import * as hoverCard from "@zag-js/hover-card"

const api = hoverCard.connect(state, send, normalizeProps)

// call `open` to open the hover card
api.open()

// call `close` to close the hover card
api.close()
```
