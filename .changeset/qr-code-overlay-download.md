---
"@zag-js/qr-code": patch
---

Include the rendered overlay in `getDataUrl()` and in the file produced by `getDownloadTriggerProps()`. The export
previously contained only the QR matrix, so a logo or badge placed over the code was dropped.
