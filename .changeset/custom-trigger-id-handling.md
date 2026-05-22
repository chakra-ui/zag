---
"@zag-js/popover": patch
"@zag-js/dialog": patch
"@zag-js/drawer": patch
"@zag-js/hover-card": patch
"@zag-js/tooltip": patch
---

Fix custom trigger elements (via `ids.trigger`) being ignored when shared across components (e.g. wrapping a `Popover.Trigger` in a `Tooltip` with the same id), causing broken positioning and a close-then-reopen cycle on trigger clicks.
