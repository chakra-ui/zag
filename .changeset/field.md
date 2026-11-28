---
"@zag-js/field": patch
---

- Fix a control without `item` taking the targeted item's id when `target` is set, and `ids.control` with `target`
  pointing the label at an id no control had.

- Fix error text shown or hidden right after mount, or text parts rendered later, being left out of `aria-describedby`.
