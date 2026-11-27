---
"@zag-js/drawer": minor
---

- Add keyboard support to the grabber when there are several snap points: press to step, arrow keys, Home and End.
- Add `translations.grabber` for the grabber's label.
- Add `--drawer-progress`, `--drawer-dim`, `--drawer-expand` and `--drawer-stack` CSS variables.
- Add `data-snap-point` to the content and grabber.
- Fix a fast swipe's animation speed carrying over to the next open or snap.
- Fix the documented defaults of `swipeVelocityThreshold` (500) and `closeThreshold` (0.5).
