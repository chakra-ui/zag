---
"@zag-js/pagination": minor
---

Add `getPageUrl` prop for generating `href` attributes when using pagination as links.

- Added `getPageUrl` function prop that receives `{ page, pageSize }` and returns a URL string
- Only applies when `type="link"` to generate proper href attributes for pagination items and navigation buttons

```ts
const service = useMachine(pagination.machine, {
  type: "link",
  getPageUrl: ({ page, pageSize }) => `/products?page=${page}&size=${pageSize}`,
})
```
