---
"@zag-js/combobox": patch
---

Fixes issue where on load -- if the user set initial `value` to context -- `value` should be used to check whether a
trigger button using `clearTriggerProps` should be visible on the page.
