---
"@zag-js/dismissable": patch
---

Fix layer `pointer-events` being wiped by frameworks (Svelte, Vue) whose spread updates rewrite the entire `style`
attribute.
