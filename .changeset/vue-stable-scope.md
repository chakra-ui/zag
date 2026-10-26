---
"@zag-js/vue": patch
---

- Fix "Maximum recursive updates exceeded" when a nested component, like a submenu, receives an inline object prop. The
  machine's scope is now only recreated when `id`, `ids`, or `getRootNode` change, not on every prop change.
