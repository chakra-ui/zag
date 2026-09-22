---
"@zag-js/tabs": patch
---

Fix tabs clicking link triggers when the value changes programmatically. Link navigation now follows only user-initiated
activation (pointer or keyboard); `api.setValue`, controlled `value` sync, and `api.selectNext`/`api.selectPrev` no
longer dispatch a synthetic click on the newly selected trigger.
