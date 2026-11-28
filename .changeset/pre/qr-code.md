---
"@zag-js/qr-code": patch
---

- Fix `getDataUrl` never settling when the image fails to load; it now rejects.
