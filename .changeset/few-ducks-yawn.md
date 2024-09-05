---
"@zag-js/select": patch
---

Refactor opening and selection to be based on click events rather than pointerdown/up cycles.

This improves the usability and accessibility of the select component. It also fixes an issue where controlled multiple
selects open state behaved unexpectedly.
