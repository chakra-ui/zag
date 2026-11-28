---
"@zag-js/file-upload": minor
---

- Add `data-drag-accept` and `data-drag-reject` to the root and dropzone while files are dragged over, and `dragAccept`
  and `dragReject` to their state.

  ```css
  [data-file-upload-dropzone][data-drag-accept] {
    border-color: green;
  }
  [data-file-upload-dropzone][data-drag-reject] {
    border-color: red;
  }
  ```

- Fix file types with parameters, like `text/plain;charset=utf-8`, failing the `accept` check.
