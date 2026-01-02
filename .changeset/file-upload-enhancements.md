---
"@zag-js/file-upload": minor
---

- Add `readOnly` prop to prevent file modifications while keeping component visually active
- Add `maxFilesReached` and `remainingFiles` to exposed API
- Fix item element IDs to use `name-size` combination for uniqueness (prevents ID collisions with same-named files)
