---
"@zag-js/date-picker": patch
---

Fix issue where clicking the input moved focus into the calendar grid when the `open` state is controlled. Focus now
stays in the input, matching the uncontrolled behavior.
