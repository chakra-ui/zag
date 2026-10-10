---
"@zag-js/toc": minor
---

- Added a `nav` part (`getNavProps()`) so the root can wrap the page content without sharing the nav's id or label.
- Moved `aria-labelledby` from `getRootProps()` to `getNavProps()`.

```tsx
<div {...api.getRootProps()}>
  <nav {...api.getNavProps()}>...</nav>
</div>
```
