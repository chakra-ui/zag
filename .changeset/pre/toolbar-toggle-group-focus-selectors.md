---
"@zag-js/toggle-group": patch
"@zag-js/toolbar": patch
"@zag-js/toggle": patch
---

**Breaking:**

- Toggle group uses toggle-button semantics in every mode: the root is `role="group"` and items use `aria-pressed`,
  instead of radio roles and `aria-checked` in single-select mode.
- Removed `data-focus` from toggle group and toolbar parts. Use `:focus-visible` on items and `:focus-within` on the
  root.
- Removed `data-state="on|off"` from toggle and toggle group. Use `data-pressed`.

```diff
- [data-toggle-group-item][data-focus] { ... }
+ [data-toggle-group-item]:focus-visible { ... }

- [data-toggle-group-item][aria-checked="true"] { ... }
+ [data-toggle-group-item][aria-pressed="true"] { ... }

- [data-toggle-root][data-state="on"] { ... }
+ [data-toggle-root][data-pressed] { ... }
```
