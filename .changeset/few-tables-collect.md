---
"@zag-js/popover": patch
---

- Refactor machine to use the `proxyTabFocus` helper for better keyboard accessibility when portalled.

- Add `api.setPositioning` to allow for programmatic re-positioning of the popover. This API supports all the
  positioning options.

```js
api.setPositioning({ placement: "top" })
```
