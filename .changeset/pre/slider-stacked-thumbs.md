---
"@zag-js/slider": patch
---

- **Slider**
  - Fix stacked thumbs getting stuck when the pointer moves below the stack and `thumbCollisionBehavior` is `"none"`.
  - Add `aria-readonly` to the thumbs when `readOnly` is set.
