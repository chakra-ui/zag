---
"@zag-js/pin-input": patch
---

Improved keyboard navigation and setup feedback.

- Pressing `Ctrl`/`Cmd` + `ArrowLeft`/`ArrowRight` now moves focus to the first or last input (reversed in RTL).
- Pressing `ArrowUp`/`ArrowDown` now moves focus to the first or last input, matching `Home`/`End`.
- Added a development warning when `count` doesn't match the number of rendered inputs.
