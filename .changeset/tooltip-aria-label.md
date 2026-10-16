---
"@zag-js/tooltip": patch
---

- Fix the `aria-label` prop leaving the trigger's `aria-describedby` pointing at a missing element.
- Use `aria-label` as the tooltip's accessible description.
