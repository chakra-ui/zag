---
"@zag-js/dom-query": major
"@zag-js/image-cropper": major
"@zag-js/qr-code": patch
"@zag-js/signature-pad": patch
---

- Add the `@zag-js/dom-query/image` entrypoint with `loadImage`, `createCanvas`, `canvasToBlob`, `cropImage` and
  `cropImageToCanvas`.
- Move `getDataUrl` to `@zag-js/dom-query/image` as `svgToDataUrl`. It now rejects when the image fails to load instead
  of never settling.
- Measure `getCropData()` in the flipped, then rotated image, so `x`, `y`, `width` and `height` stay exact under
  rotation and can be passed to `cropImage`. Rename its `rotate` to `rotation`.
- Fix `getCroppedImage` exporting a rectangle when `cropShape` is `"circle"`.
