---
"@zag-js/image-cropper": patch
---

Add `api.setCrop(rect)` to set the crop area programmatically. It is constrained like `initialCrop`, and unlike
`reset()` it keeps the current zoom, rotation, flip and pan.
