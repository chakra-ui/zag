---
"@zag-js/core": patch
---

Fix `getExitEnterStates()` throwing during state transitions in browsers without `Array.prototype.at()` support (#3272).
