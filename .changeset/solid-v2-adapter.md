---
"@zag-js/solid-v2": minor
"@zag-js/solid": patch
---

Add `@zag-js/solid-v2`, the adapter for Solid 2.0 (`solid-js@^2.0.0-rc.11`). It exposes the same API as `@zag-js/solid`,
which keeps targeting Solid 1.x and now declares `solid-js@^1.1.3` as its peer range.

```tsx
import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/solid-v2"
import { createMemo, createUniqueId } from "solid-js"

const service = useMachine(accordion.machine, { id: createUniqueId() })
const api = createMemo(() => accordion.connect(service, normalizeProps))
```
