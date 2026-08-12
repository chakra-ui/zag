---
"@zag-js/focus-visible": patch
"@zag-js/combobox": patch
"@zag-js/select": patch
"@zag-js/menu": patch
---

- Fixed issue where keyboard navigation cleared or moved the highlighted item when the mouse was resting over the
  scrollable content. Scrolling the item into view moved the content under the cursor, and the resulting `pointerleave`
  (or, in Safari, `pointermove`) was treated as a real hover.
- Fixed issue where the interaction modality was reported as `pointer` when content scrolled under a resting cursor,
  since Safari emits move events at an unchanged position in that case.
