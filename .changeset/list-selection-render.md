---
"@zag-js/select": patch
"@zag-js/combobox": patch
"@zag-js/listbox": patch
"@zag-js/gridlist": patch
---

- Speed up rendering large lists with many selected items: item and select-all state are computed once per render. With
  10k items all selected, a render drops from ~465ms to ~3ms.
