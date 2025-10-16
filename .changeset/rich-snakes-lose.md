---
"@zag-js/angle-slider": patch
---

Fix accessibility violation where the slider thumb element lacked an accessible name. The thumb now supports
`aria-label` and `aria-labelledby` props, and automatically falls back to the label element's ID for proper ARIA
labeling.
