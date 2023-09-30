---
"@zag-js/file-upload": minor
---

- Fix reopening the system file picker in file-upload on browsers other than Chrome
- Redesign the file-upload component to include new parts:
  - `Item`: The element that represents a file
  - `ItemSizeText`: The element that represents the size of a file
  - `ItemName`: The element that represents the name of a file
  - `ItemDeleteTrigger`: The buttonelement used to delete a file
- Added new `api.getFileSize` method to get the size of a file in a human readable format
