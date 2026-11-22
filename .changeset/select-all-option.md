---
"@zag-js/select": minor
"@zag-js/listbox": minor
"@zag-js/collection": minor
---

- Add a select-all option for `multiple` with `getSelectAllProps` and `getSelectAllState`. Render it first in the list:
  the keyboard reaches it before the items, it selects every enabled item or unselects them all, and it reads as
  checked, unchecked or mixed. It renders with the item part and `data-type="select-all"`; regular items get
  `data-type="item"`.

- Add `getEnabledValues()` and `navigate({ before, after })` to `ListCollection`. `navigate` walks extra values, such as
  a select-all option, before and after the items.

- Fix `selectAll()` and `Ctrl/Cmd+A` selecting disabled items.

- Scroll the items' own scrolling element when it sits inside the select list, so a select-all option above it stays in
  view.
