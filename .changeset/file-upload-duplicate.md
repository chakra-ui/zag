---
"@zag-js/file-upload": patch
---

Automatically reject duplicate files with `FILE_EXISTS` error.Previously, uploading the same file twice was silently
accepted and deleting one duplicate removed all of them.
