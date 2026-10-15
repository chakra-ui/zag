---
"@zag-js/floating-panel": minor
"@zag-js/image-cropper": minor
---

**Breaking:** Unified resize handle naming across floating panel and image cropper.

- Floating panel: `ResizeTriggerProps.axis` → `.placement`, `data-axis` → `data-placement`, `resizeTriggerAxes` →
  `resizeTriggerPlacements`. `ResizeTriggerAxis` is removed.
- Image cropper: `HandleProps.position` → `.placement`, `data-position` → `data-placement`, `handles` → `placements`.
- Image cropper: with `fixedCropArea`, the selection stays focusable and arrow keys pan the image.
