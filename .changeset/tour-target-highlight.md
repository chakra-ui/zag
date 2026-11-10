---
"@zag-js/tour": patch
---

- Fix the target losing its highlight when consecutive steps point at the same element.
- Restore the target's own `inert` and `data-tour-highlighted` state when the tour leaves it, instead of clearing them.
- Apply `preventInteraction` when the step changes from outside the tour, and when the prop changes while a step is
  open.
