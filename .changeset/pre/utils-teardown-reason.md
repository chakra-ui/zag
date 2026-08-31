---
"@zag-js/utils": patch
---

Add `Teardown` and `TeardownReason`. A `Teardown` receives `"restart"` when it is about to be set up again, or `"exit"`
when it is torn down for good. Plain `VoidFunction` cleanups still work.
