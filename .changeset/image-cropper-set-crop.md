---
"@zag-js/image-cropper": minor
---

Added `api.setCrop(rect)` to place the crop area programmatically, in viewport coordinates.

- The rect is constrained like `initialCrop`: min/max size, `aspectRatio` or `cropShape: "circle"`, and the viewport
  bounds.
- Unlike `api.reset()`, it keeps the current zoom, rotation, flip, and pan.
