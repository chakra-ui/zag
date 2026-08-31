---
"@zag-js/popper": minor
"@zag-js/hover-card": minor
---

Add inline positioning for references that wrap across lines.

- Fixed issue where a hover card anchored to a trigger spanning multiple lines was positioned against the box covering
  every line, landing far from the pointer instead of under the line being hovered.
- Fixed issue where the hover card stayed over the previous trigger when the active trigger changed, showing the new
  trigger's content in the old position.
- Added `inline` and `getInlineRectCoords` to `@zag-js/popper`, alongside a `positioning.middleware` option for
  supplying extra Floating UI middleware. The middleware is only bundled by machines that import it.
