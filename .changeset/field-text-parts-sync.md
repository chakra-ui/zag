---
"@zag-js/field": patch
"@zag-js/fieldset": patch
---

- Fix error text shown or hidden within a frame of mount not being picked up, which left it out of the control's
  `aria-describedby`.
- Fix text parts that render after the machine starts not being tracked until another change happened inside the root.
