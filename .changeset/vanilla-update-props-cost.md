---
"@zag-js/vanilla": major
---

Fix `VanillaMachine.updateProps` accumulating a closure chain that slows prop reads and can overflow the call stack in
long-lived components. Object patches are merged eagerly.

**Breaking:** Function updates replace the previous live getter, retaining omitted props at their last resolved values.
If you composed several partial getters, include all values that should remain reactive in the latest getter. Values
from replaced getters no longer update automatically.
