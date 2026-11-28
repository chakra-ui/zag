---
"@zag-js/vue": patch
"@zag-js/svelte": patch
---

Fix an action reading the wrong event when an earlier action sent another event, for example tree view Shift+ArrowDown
selecting one node too far in Vue and Svelte.
