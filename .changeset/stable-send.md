---
"@zag-js/react": patch
---

Keep `useMachine` command APIs referentially stable across re-renders (`send`, `prop`, `context`, `computed`, `refs`, `getStatus`) so they are safe in effect dependency arrays.
