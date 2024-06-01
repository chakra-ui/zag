---
"@zag-js/solid": patch
---

Fix SSR issue in Solid.js where spreading `readOnly: false` adds the `readonly` attribute on editable elements, making
them uneditable.
