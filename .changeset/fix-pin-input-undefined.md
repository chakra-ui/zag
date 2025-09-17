---
"@zag-js/pin-input": patch
---

Fix issue where using the keyboard shortcuts `Cmd+Backspace` and `Cmd+Delete` to delete text in pin inputs would insert
"undefined" instead of clearing the field.
