---
"@zag-js/tabs": major
---

**Breaking:** Replaced `composite` with `virtualFocus`. Note the boolean is inverted.

- `virtualFocus: false` (default): roving tabindex, arrow keys move DOM focus.
- `virtualFocus: true`: arrow keys change the selected tab without moving DOM focus, for tabs inside another composite
  widget (e.g. a combobox).

```diff
- tabs.machine({ composite: false })
+ tabs.machine({ virtualFocus: true })
```
