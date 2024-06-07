---
"@zag-js/file-upload": patch
---

Fix issue where `onFileAccept` gets called when deleting an item via the delete trigger. Now, only `onFileChange` is
called when deleting or calling `api.clearFiles`
