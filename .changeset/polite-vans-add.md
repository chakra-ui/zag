---
"@zag-js/vue": patch
---

Simplify TS type for `ref` in prop types.

```ts
// Before
type Ref = string | Vue.Ref | ((ref: Element | Vue.ComponentPublicInstance | null) => void)

// After
type Ref = VNodeRef
```
