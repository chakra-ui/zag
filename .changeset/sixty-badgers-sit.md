---
"@zag-js/svelte": patch
---

- Fix issue with useService where machine gets stopped and started at `$effect` time, rather than `onMount` time
- Improve reactivity of `useService` when `context` changes
