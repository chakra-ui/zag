---
"@zag-js/toast": patch
---

Allow creating a toast store without any arguments.

```tsx
// before
const store = toast.createStore({})

// after
const store = toast.createStore()
```
