---
"@zag-js/dom-query": patch
"@zag-js/popover": patch
---

Fix `proxyTabFocus` so tabbing out of portalled content moves to the next tabbable after the trigger, instead of looping back into the content when the trigger is last on the page.
