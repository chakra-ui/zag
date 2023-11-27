---
"@zag-js/file-upload": minor
"@zag-js/file-utils": minor
---

- Add support for `onFileAccept` and `onFileReject` callbacks.
- Add support customizing `ids` and aria labels using `messages` context property.
- **Breaking**: Update file error types
  - `TOO_MANY_FILES_REJECTION` > `TOO_MANY_FILES`
  - `TOO_LARGE` > `FILE_TOO_LARGE`
  - `TOO_SMALL` > `FILE_TOO_SMALL`
