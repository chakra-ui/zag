---
"@zag-js/pagination": minor
---

Added `api.type` and `api.getPageUrl(page)`. Adapters and custom components can now tell whether the controls are
buttons or links, and build a page's URL without re-reading the machine props.

```jsx
const api = pagination.connect(service, normalizeProps)

api.type // "button" | "link"
api.getPageUrl(3) // "/page/3", or `undefined` when `getPageUrl` is not provided
```
