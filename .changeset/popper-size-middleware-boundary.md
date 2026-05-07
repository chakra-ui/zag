---
"@zag-js/popper": patch
---

Forward `positioning.boundary` to the `size` middleware. Previously, `boundary` was honored by `flip`, `shift`, and `hide` middleware but not by `size`, so `--available-width` and `--available-height` were always computed against `clippingAncestors` (effectively the viewport for portaled popovers) regardless of the configured boundary. Consumers can now constrain the floating element's width and height to a specific boundary element, in addition to its position.

Uses the function/derivable form so `size` re-resolves the boundary on every position tick — matching the pattern recently adopted by `flip`, `shift`, and `hide` for late-mounted boundary elements.
