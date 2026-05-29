---
"@zag-js/image-cropper": patch
---

Fix `getCroppedImage` and `getCropData` returning the wrong region when the image is displayed at a size different from
its natural resolution (e.g. `width/height: 100%`)
