---
"@zag-js/accordion": minor
---

Add `getItemHeaderProps` and an `itemHeader` anatomy part for the heading that wraps the trigger, so it can be styled
with `[data-accordion-item-header]`.

```diff
- <h3>
+ <h3 {...api.getItemHeaderProps({ value: item.id })}>
    <button {...api.getItemTriggerProps({ value: item.id })}>...</button>
  </h3>
```
