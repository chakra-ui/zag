---
"@zag-js/image-cropper": patch
---

Fix `getCroppedImage()` and `getCropData()` sampling the mirror-opposite region of the source image when a horizontal or
vertical flip is active
