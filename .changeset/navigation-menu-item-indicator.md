---
"@zag-js/navigation-menu": minor
---

Add `getItemIndicatorProps` part

```tsx
<div {...api.getItemProps({ value: "products" })}>
  <button {...api.getTriggerProps({ value: "products" })}>Products</button>
  <div {...api.getItemIndicatorProps({ value: "products" })} />
</div>
```
