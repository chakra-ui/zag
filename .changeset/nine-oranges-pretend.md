---
"@zag-js/file-upload": minor
---

- Add support for preventing drop on document when the file upload is used. Use the `preventDropOnDocument` context
  property. Set to `true` by default to prevent drop on document.

- Add `api.setClipboardFiles` method to set the files from the clipboard data.

- Fix issue where hidden input isn't synced with the accepted files.
