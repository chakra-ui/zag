---
"@zag-js/carousel": patch
---

Improved carousel reliability during drag, scroll, and runtime config changes.

- Keeps page and indicators in sync after drag release and scroll settling.
- Handles rapid mixed interactions (drag, wheel, buttons, indicators) more consistently.
- Keeps page state valid when `slidesPerPage`, `slidesPerMove`, direction, or orientation change.
- Makes `slidesPerMove` (`auto`, `1`, `2`) progression more predictable.
