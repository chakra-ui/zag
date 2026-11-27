---
"@zag-js/dom-query": major
---

- Add `@zag-js/dom-query/press`: `trackPress`, `trackLongPress` and `LONG_PRESS_STYLE`.
- `trackLongPress` calls `onHold` once a press lasts past `delay`, and again every `interval` when set. Moving past
  `tolerance`, a scroll, a pointer cancel or the window losing focus cancels it; leaving the target pauses a repeating
  press.
- Move `trackPress` from the root entrypoint to `@zag-js/dom-query/press`.
- Fix `suppressNextClick` letting a touch's click through, since it arrives a few milliseconds after the release.
