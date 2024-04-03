---
"@zag-js/solid": minor
---

[Breaking] Refactor `mergeProps` from solid-js to ensure consistent merging of props with other frameworks. The previous
implementation was returning a Proxy object which was causing issues.

Now it returns a signal that can be called to get the merged props. Under the hood, it uses the `createMemo` function
from `solid-js`.

**Before**

```js
const props = mergeProps({ a: 1 }, { a: 2 })
props // Proxy { a: 2 }
```

**After**

```js
const props = mergeProps({ a: 1 }, { a: 2 })
props() // { a: 2 }
```
