---
"@zag-js/select": patch
---

- Fix issue where machine doesn't leave focus state with interacting outside with another editable element. This leads
  to the `data-focus` attribute not being removed from the trigger element.
