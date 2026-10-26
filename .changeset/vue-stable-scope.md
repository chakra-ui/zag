---
"@zag-js/vue": patch
---

- Fix "Maximum recursive updates exceeded" when a nested component receives an inline object prop, like a submenu with
  `:positioning="{ placement: 'right-start' }"`.

  The machine's scope was recreated whenever any prop changed. A parent that reads its child's scope (as menus do)
  re-rendered, which created a new inline object, which changed the child's props again, and so on. The scope is now
  only recreated when `id`, `ids`, or `getRootNode` change.
