---
"@zag-js/preact": patch
"@zag-js/react": patch
"@zag-js/store": patch
"@zag-js/core": patch
---

- Fix issue where react elements could not be passed to tree view. In general, we've improved the entire machine to
  better support complex objects like react and vue elements.

- Remove support for promises in store and snapshot. Prefer to use framework-specific hooks to manage async operations.
