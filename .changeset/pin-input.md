---
"@zag-js/pin-input": patch
---

- Fix screen readers not announcing the label for the inputs.
- Fix `api.clearValue()` wiping a value set right after it in the same handler.
- Fix focus jumping back into the inputs when focus moves away right after a paste.
