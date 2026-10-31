---
"@zag-js/file-upload": minor
---

Improve accessibility of the file upload component.

- Move focus to the next item's delete trigger (or the previous one, then the trigger, then the dropzone) when a file is
  removed, instead of losing it. The same applies when the clear trigger is used.
- Announce added and removed files to screen readers via a live region, e.g. "a.txt and b.txt added". Customize with
  `translations.filesAdded` and `translations.fileDeleted`.
