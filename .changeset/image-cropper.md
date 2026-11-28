---
"@zag-js/image-cropper": major
---

- **Breaking:** Measure `getCropData()` in the flipped, then rotated image, so `x`, `y`, `width` and `height` stay exact
  under rotation and can be passed to `cropImage`. Rename its `rotate` to `rotation`.

  ```diff
  - const { rotate } = api.getCropData()
  + const { rotation } = api.getCropData()
  ```

- **Breaking:** Rename the `HandlePosition` type to `HandlePlacement`.

- Restore the crop or pan on Escape, and undo a cancelled drag instead of committing it.

- Use two-way resize cursors on handles, like `ew-resize`.

- Fix `getCroppedImage` exporting a rectangle when `cropShape` is `"circle"`.

- Fix arrow keys moving the selection the wrong way in RTL, and a canceled pointer leaving the cropper mid-drag.

- Follow only the pointer that started a drag.
