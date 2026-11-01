---
"@zag-js/accordion": minor
"@zag-js/collapsible": minor
---

Added `hiddenUntilFound`, so closed content stays searchable with the browser's find-in-page. A match opens the item.

```ts
accordion.machine({ hiddenUntilFound: true })
collapsible.machine({ hiddenUntilFound: true })
```

A `[hidden] { display: none }` reset blocks this. Exclude it:

```css
[hidden]:not([hidden="until-found"]) {
  display: none;
}
```

**Breaking (accordion):**

- Removed arrow, `Home` and `End` navigation between triggers, and the `loopFocus` prop, following the WAI-ARIA
  accordion pattern. Use `Tab`.
- `collapsible` now defaults to `true`. Set `collapsible: false` to keep one item open.
