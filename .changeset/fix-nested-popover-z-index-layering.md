---
"@zag-js/popover": patch
---

Fix nested popover z-index layering by running `trackDismissableElement` before `trackPositioning`. This ensures the
dismissable layer stack sets `--layer-index` on the content before the popper reads the content's z-index for the
positioner, resolving inconsistent layering when nesting popovers.
