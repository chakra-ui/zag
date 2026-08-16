---
"@zag-js/cascade-select": patch
"@zag-js/listbox": patch
---

Fix keyboard navigation losing the highlighted item when scrolling shifts content beneath a resting pointer. The pointer
events fired by that scroll were treated as a real hover and overrode the keyboard highlight. Affects listboxes with
`highlightOnHover` and cascade selects with `highlightTrigger: "hover"`.
