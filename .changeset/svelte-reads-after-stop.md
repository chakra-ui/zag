---
"@zag-js/svelte": patch
---

Fix `derived_inert` warnings when a timer reads `prop` or a controlled `context` value after the component is destroyed,
such as the dialog focus trap calling `setReturnFocus` after the dialog unmounts. Reads after stop now return the values
held at stop.
