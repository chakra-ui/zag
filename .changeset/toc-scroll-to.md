---
"@zag-js/toc": patch
"@zag-js/dom-query": patch
---

- Add `api.scrollTo(value, details?)` for programmatically scrolling to a heading. The optional `details.behavior`
  controls the scroll behavior; when omitted, the platform default applies.

```tsx
api.scrollTo("installation", { behavior: "smooth" })
```

- Rename `getScrollEl` context prop to `scrollEl` for consistency with other machines (e.g. `initialFocusEl`,
  `finalFocusEl`).
