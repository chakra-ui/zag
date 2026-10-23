---
"@zag-js/tooltip": patch
---

Fix the first hover after `disabled` goes from `true` back to `false` not opening the tooltip when the pointer had left
the trigger while it was disabled.
