---
"@zag-js/svelte": patch
"@zag-js/solid": patch
---

Fixed issue where a machine ignored a prop change made between its creation and its first effect run (e.g. a value an
earlier sibling's effect writes on mount), leaving a presence machine unmounted while `present` is true.
