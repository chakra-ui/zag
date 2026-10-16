---
"@zag-js/svelte": patch
"@zag-js/solid": patch
---

- Fix machines missing a prop change made before their first effect run, such as a value an earlier sibling's effect
  sets on mount. A presence machine could stay unmounted while `present` was true.
