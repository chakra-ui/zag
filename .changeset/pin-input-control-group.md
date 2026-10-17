---
"@zag-js/pin-input": patch
---

Render the control as a `group` labelled by the label, so screen readers announce the label for the inputs. Previously
the label pointed only at the hidden input, so its text was never announced.
