---
"@zag-js/scroll-area": patch
---

- Fix the viewport only being a tab stop when both axes overflow. A viewport that scrolls on one axis is now keyboard
  reachable, matching Base UI.
- Remove `role="presentation"` from the viewport, which conflicts with it being focusable.
- Start with no overflow until the first measurement, so a box that doesn't scroll no longer reports overflow on first
  paint.
