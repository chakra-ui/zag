---
"@zag-js/vanilla": patch
---

Fix `VanillaMachine.updateProps` accumulating a closure chain that slows prop reads and can overflow the call stack in
long-lived components. Object patches are merged eagerly. Function updates replace the previous live getter, retaining
omitted props at their last resolved values; use the current getter for values that should remain reactive.
