---
"@zag-js/image-cropper": patch
---

- Fix issue where `reset()` destroys the cropper area
- Fix issue where changing `aspectRatio` or `cropShape` props doesn't update the crop instantly
- Add symmetric resize support when holding `Alt` key during pointer drag
- Fix panning bounds in fixed crop mode at various zoom levels
