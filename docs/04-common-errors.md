# Common Errors

- `Illegal invocation`: This happens when you assign a dom object (`window` or `document`) to context. `valtio` doesn't
  track these values and requires that wrap them in `ref`.

```jsx
ctx.doc = document // ❌ Illegal Invocation Error

import { ref } from "valtio"
ctx.doc = ref(document) // ✅ Works
```
