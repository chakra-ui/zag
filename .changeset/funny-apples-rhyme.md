---
"@zag-js/file-upload": patch
---

- Fix issue where change event is not fired when dropping files into the dropzone
- Fix issue where `api.setClipboardFiles(...)` was still called when file upload is disabled
- Expose disabled state via `api.disabled`
- Fix issue where machine transitions to `dragging` when disabled
- Fix issue where rejected files could not be deleted using the item delete trigger.
