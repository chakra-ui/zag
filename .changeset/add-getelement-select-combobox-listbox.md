---
"@zag-js/select": patch
"@zag-js/combobox": patch
"@zag-js/listbox": patch
---

- **Listbox, Select, Combobox:** Add required `getElement` to `scrollToIndexFn` details and pass the element getter when
  scrolling to the highlighted index and on initial scroll-to-top.

- **Listbox:** Track collection changes and clear `highlightedValue` if the item is no longer in the collection.
