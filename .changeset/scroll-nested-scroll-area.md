---
"@zag-js/dom-query": patch
---

- Fix the highlighted item not scrolling into view in combobox, select, listbox and menu when the content wraps its own
  scroll container (e.g. a scroll area). `scrollToNearest` now scrolls the nearest scrollable ancestor of the item inside
  `rootEl` when `rootEl` itself doesn't scroll.
