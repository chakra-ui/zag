---
"@zag-js/slider": minor
---

**Breaking:** Replaced the `aria-label` and `aria-labelledby` array props with `getAriaLabel` and `getAriaLabelledBy`,
matching `getAriaValueText`.

```diff
  slider.machine({
-   "aria-label": ["Minimum price", "Maximum price"],
+   getAriaLabel: ({ index }) => (index === 0 ? "Minimum price" : "Maximum price"),
  })
```

```diff
  slider.machine({
-   "aria-labelledby": ["min-label", "max-label"],
+   getAriaLabelledBy: ({ index }) => (index === 0 ? "min-label" : "max-label"),
  })
```

Thumbs with their own label no longer get `aria-labelledby` pointing at the label part, which used to override the
thumb's `aria-label`.
