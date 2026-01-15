---
"@zag-js/number-input": patch
---

Fix cursor positioning when clicking label or after scrubbing. The cursor now moves to the end of the input value instead of the start.

This ensures consistent behavior when:
- Clicking the label to focus the input
- Completing a scrub gesture to adjust the value
