---
"@zag-js/vue": patch
---

- When the same API method is called several times in a row, such as `api.setOpen()`, apply only the last call and fire
  its change callback once, as in React. Read the new state after `nextTick()`.

- Fix vendor-prefixed styles like `WebkitUserSelect` being dropped from server-rendered markup.
