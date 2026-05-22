---
"@zag-js/remove-scroll": patch
---

Fix scroll lock leaking on `<body>` (`data-scroll-lock`, `overflow: hidden`) when nested dialogs or React Strict Mode
trigger overlapping locks.
