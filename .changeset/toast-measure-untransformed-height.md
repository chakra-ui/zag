---
"@zag-js/toast": patch
---

Fix toast height measurement including the `scale` transform in overlap mode, causing a
height flicker when expanding the stack. Height is now measured from the untransformed
element.
