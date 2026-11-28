---
"@zag-js/file-upload": major
---

- **Breaking:** Rename the delete trigger to a remove trigger, since removing a file only takes it off the list.
  `npx @zag-js/codemod v2` makes these changes for you.

  ```diff
  - <button {...api.getItemDeleteTriggerProps({ file })}>Delete</button>
  + <button {...api.getItemRemoveTriggerProps({ file })}>Remove</button>
  - api.deleteFile(file)
  + api.removeFile(file)
  ```

  The part is now `data-file-upload-item-remove-trigger`, `ids.itemDeleteTrigger` is `ids.itemRemoveTrigger`, and the
  `deleteFile` and `fileDeleted` translations are `removeFile` and `fileRemoved`.

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
