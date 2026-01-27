---
"@zag-js/file-upload": patch
---

Fix accessibility violations in file upload component

- Remove invalid `aria-readonly` from dropzone (not valid for `role="button"`)
- Add `aria-hidden` to hidden input to exclude from accessibility tree
