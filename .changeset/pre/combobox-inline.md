---
"@zag-js/combobox": minor
---

**Breaking:** Replaced `disableLayer` with `inline`. An inline combobox is always open, isn't positioned or dismissable,
and doesn't call `onOpenChange`. The content gets `data-inline`.

```diff
  combobox.machine({
-   open: true,
-   disableLayer: true,
+   inline: true,
  })
```
