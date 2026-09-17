---
"@zag-js/hotkeys": patch
---

Fix an unhandled `TypeError` when a `keyup` event without a valid `key` is dispatched at `document`. Events without a
string `key` are now ignored instead of crashing the handler.
