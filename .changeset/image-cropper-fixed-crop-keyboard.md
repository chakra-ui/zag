---
"@zag-js/image-cropper": patch
---

Fix `fixedCropArea: true` disabling all keyboard interaction on the crop selection. It removed the element from the tab
order and ignored every key, including the `+`/`-` zoom shortcuts that still apply in fixed mode.

The selection is now always focusable. Arrow keys pan the image, since there's nothing to move or resize, and
`Alt+Arrow` is a no-op.
