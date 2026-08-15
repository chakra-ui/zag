---
"@zag-js/cascade-select": patch
"@zag-js/listbox": patch
---

Fix keyboard navigation moving the highlighted item when scrollable content shifts beneath a resting pointer. Pointer
events caused by scrolling no longer override keyboard-driven highlights in listboxes with `highlightOnHover` or cascade
selects with `highlightTrigger: "hover"`.
