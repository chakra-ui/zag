---
"@zag-js/tour": patch
---

Fix a `ReferenceError` when a tour mounts in an environment without a global `visualViewport`, such as
jsdom. The boundary size was read from the bare global instead of the scope's window, and optional
chaining does not guard an undeclared identifier.
