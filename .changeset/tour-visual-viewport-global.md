---
"@zag-js/tour": patch
---

- Fix the backdrop leaving part of the page undimmed, and the spotlight sliding to its new position, when the window
  resizes or content loads in. The spotlight now only animates between steps.
- Fix tours in an iframe or custom root measuring the outer page, and crashing on mount in environments without
  `visualViewport`, such as jsdom.
