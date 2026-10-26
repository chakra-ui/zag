---
"@zag-js/tooltip": patch
---

- Use the `aria-label` prop as the tooltip's accessible description, instead of pointing `aria-describedby` at a missing
  element.
- Fix a store subscription leaking when the tooltip unmounts right after mounting.
- Fix the first hover after re-enabling a disabled tooltip not opening it.
