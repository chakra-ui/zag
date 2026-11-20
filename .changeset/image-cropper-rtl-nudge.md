---
"@zag-js/image-cropper": patch
---

Fix the arrow keys moving, resizing and panning the wrong way when `dir` is `rtl`. The crop area and image offsets are
physical, so `ArrowLeft` now always moves left and `ArrowRight` always moves right.
