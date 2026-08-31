---
"@zag-js/number-input": minor
---

Improve scrubber and add configurable step sizes.

- **New part: `scrubberCursor`** — Expose the virtual cursor as a renderable part (`getScrubberCursorProps`) so
  consumers can style or replace it. The old auto-created DOM element is removed; consumers render their own content
  (e.g. a Lucide icon).
- **`scrubberPixelSensitivity`** — Control how many pixels of pointer movement trigger one step change (default `2`).
  Uses cumulative delta tracking for precise control.
- **`scrubberTeleportDistance`** — Set a pixel distance for virtual cursor wrapping. When unset, wraps at viewport
  bounds.
- **`scrubberDirection`** — Support `"horizontal"` (default) or `"vertical"` scrubbing.
- **`largeStep` / `smallStep`** — Explicit step sizes for Shift (default `step * 10`) and Alt/Option (default
  `step * 0.1`) modifier keys. Alt replaces Ctrl for fine control, matching design tool conventions.
- **`snapOnStep`** — Snap values to step multiples when scrubbing or using keyboard.
