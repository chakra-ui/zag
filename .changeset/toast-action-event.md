---
"@zag-js/toast": minor
---

- Pass the click event to `action.onClick`; call `event.preventDefault()` to keep the toast open, like while async work
  runs.
