---
"@zag-js/file-upload": major
---

- Keep focus on a nearby file or the trigger when files are removed or cleared.

- Announce added and removed files to screen readers, with the `filesAdded` and `fileDeleted` translations.

- Fix the file upload staying in its dragging state when it becomes disabled or read-only during a drag, which kept the
  trigger from opening the file picker.

- **Breaking:** Submit the files of a read-only file upload. Only a disabled one is left out of the form, like a native
  input.
