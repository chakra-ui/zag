---
"@zag-js/toast": patch
---

Restore `role="region"` on the toast group element.

- The role was previously removed to reduce screen reader landmark noise, but this caused an axe
  `aria-prohibited-attr` violation since `aria-label` is not permitted on a `div` without a valid role.
- The region landmark also enables keyboard navigation to the toast area (e.g. via F6).
