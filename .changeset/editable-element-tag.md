---
"@zag-js/dom-query": patch
---

- Fix `isEditableElement` treating custom elements with `select` or `textarea` in their tag name as text fields, which
  blocked Home, End and Space in them.
