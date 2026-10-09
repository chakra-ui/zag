---
"@zag-js/menu": minor
---

Add `getInputProps()` and `getListProps()` for filterable menus. The consumer filters the items, and the input keeps focus
while the arrow keys move the highlight through them.

- Set `composite: false` so the content is a dialog holding the input and a `menu` list.
- `autoHighlight` highlights the first item as the query changes, or always with `"always"`.
- A submenu can have its own input; Escape, Shift+Tab or the left arrow on an empty input return to the parent's.
- Opening a submenu on hover or with touch leaves the input unfocused, and focus follows the pointer between menus.
- `onHighlightChange` now reports a `reason` (`keyboard`, `pointer` or `programmatic`), and `setHighlightedValue`
  accepts `null`.
