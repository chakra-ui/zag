---
"@zag-js/accordion": minor
---

Add `getItemHeaderProps` and an `itemHeader` anatomy part for the heading that wraps the trigger, enabling state-based styling via `data-part`.

```diff
- <h3>
+ <h3 {...api.getItemHeaderProps({ value: item.id })}>
    <button {...api.getItemTriggerProps({ value: item.id })}>...</button>
  </h3>
```

Add the `loopFocus` prop (default `true`) to control whether arrow-key focus wraps at the first/last trigger, consistent with `tabs` and `toggle-group`.

```ts
accordion.machine({ loopFocus: false }) // stop at the ends instead of wrapping
```
