---
"@zag-js/slider": patch
---

Fixes:

- The range now ends at the thumb's center when `thumbAlignment` is `"contain"`, instead of falling short of it near the
  edges.
- The thumb now sets `aria-invalid` and `data-invalid` when the slider is invalid.
