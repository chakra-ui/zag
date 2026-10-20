---
"@zag-js/react": patch
---

- Fix `context.get` returning the previous value after `context.set` until the component re-renders. An action that ran
  in between could write the old value back; the carousel could lose a page change this way (#3506).
