---
"@zag-js/listbox": patch
---

Fix the left and right arrow keys not being mirrored when `dir` is `rtl`. In a grid or horizontal listbox, `ArrowLeft`
now moves to the next item and `ArrowRight` to the previous one, matching the visual order.
