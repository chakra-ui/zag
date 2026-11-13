---
"@zag-js/file-upload": patch
---

- Fix the file upload staying in its dragging state when it becomes disabled (or read-only) during a drag, which kept the trigger from opening the file picker.
