---
"@zag-js/image-cropper": patch
---

Fix `getCroppedImage()` and `getCropData()` to match the visible crop after rotating or flipping the image.
`getCropData()` now returns exact natural-image `corners` and `outputSize`. `getCroppedImage()` exports at natural
crop resolution by default; use the new `maxSize` option to limit its output dimensions.
