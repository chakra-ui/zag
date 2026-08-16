---
"@zag-js/focus-visible": patch
"@zag-js/combobox": patch
"@zag-js/select": patch
"@zag-js/menu": patch
---

Fix keyboard navigation clearing or moving the highlighted item while the mouse rests over scrollable content. Scrolling
the item into view moved the content under the cursor, and the resulting `pointerleave` (or `pointermove` in Safari) was
treated as a real hover.

Fix the interaction modality being reported as `pointer` when content scrolls under a resting cursor. Safari emits move
events at an unchanged position in that case.
