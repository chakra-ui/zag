---
"@zag-js/file-upload": minor
---

- Remove `files` form user defined context. File upload, just like `<input type=file>`, is largely a readonly operation
  that can't be set by the user.

  > Consider using the `onFileChange` event to handle file changes.

- Rename `api.files` to `api.acceptedFiles`
- Rename `onFilesChange` to `onFileChange`
