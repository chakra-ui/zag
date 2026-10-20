---
"@zag-js/file-utils": patch
---

- Fix `getFileMimeType` not recognizing uppercase file extensions (e.g. `IMG_0001.HEIC`), so files with an empty `type`
  were rejected by `accept` mime types like `image/*`.
