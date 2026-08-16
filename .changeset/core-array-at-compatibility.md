---
"@zag-js/core": patch
---

Fix `getExitEnterStates()` throwing during state transitions in browsers without `Array.prototype.at()`, such as Safari
below 15.4.
