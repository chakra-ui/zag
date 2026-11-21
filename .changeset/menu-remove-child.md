---
"@zag-js/menu": minor
---

- Add `api.removeChild(child)` to unregister a submenu when it unmounts, so the parent stops tracking its stopped
  machine.
- Fix focus not returning to the parent menu when a submenu that isn't portalled closes.
- **Breaking:** Render the items inside `api.getListProps()`, like select and combobox. The list holds the items and is
  the element scrolled to reveal the highlighted item, so a filter input, header or footer stays in place outside it. A
  dev warning flags a menu without a list. With one content per trigger, pass the same `value` to
  `getListProps({ value })` as to `getContentProps({ value })` so each list gets its own id.
- Fix the highlighted item not scrolling into view when navigating from a filter input.
